import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { DO_DAI_MAT_KHAU_TOI_THIEU } from "@/lib/auth/mat-khau";

const bodySchema = z.object({
  warriorId: z.string().uuid("Nhân sự không hợp lệ"),
  password: z
    .string()
    .min(DO_DAI_MAT_KHAU_TOI_THIEU, `Mật khẩu phải có ít nhất ${DO_DAI_MAT_KHAU_TOI_THIEU} ký tự`),
});

/**
 * Tổng Tư Lệnh cấp lại mật khẩu cho nhân sự quên mật khẩu.
 *
 * Phải đi qua Route Handler chứ không dùng RPC được: đổi mật khẩu là thao tác
 * trên bảng `auth.users`, chỉ service_role mới với tới. Khoá service_role
 * tuyệt đối không được lộ ra trình duyệt nên mọi thứ chạy ở phía máy chủ.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }
  const { warriorId, password } = parsed.data;

  // Kiểm quyền TRƯỚC khi chạm tới service_role: khoá đó bỏ qua mọi luật RLS
  // nên phải tự canh cổng ở đây.
  const callerClient = await createClient();
  const {
    data: { user: callerUser },
  } = await callerClient.auth.getUser();
  if (!callerUser) {
    return NextResponse.json({ error: "Phải đăng nhập" }, { status: 401 });
  }
  const { data: callerProfile } = await callerClient
    .from("profiles")
    .select("role, active")
    .eq("id", callerUser.id)
    .single();
  if (!callerProfile?.active || callerProfile.role !== "tong_tu_lenh") {
    return NextResponse.json(
      { error: "Chỉ Tổng Tư Lệnh mới được cấp lại mật khẩu" },
      { status: 403 },
    );
  }

  // Người được cấp lại phải là nhân sự có thật trong hệ thống — chặn việc
  // truyền id bừa để đổi mật khẩu một tài khoản auth nào đó ngoài phạm vi.
  const { data: target } = await callerClient
    .from("profiles")
    .select("id, name")
    .eq("id", warriorId)
    .single();
  if (!target) {
    return NextResponse.json({ error: "Không tìm thấy nhân sự" }, { status: 404 });
  }

  let serviceClient;
  try {
    serviceClient = createServiceRoleClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi cấu hình" },
      { status: 500 },
    );
  }

  const { error } = await serviceClient.auth.admin.updateUserById(warriorId, { password });
  if (error) {
    return NextResponse.json(
      { error: `Không đặt lại được mật khẩu: ${error.message}` },
      { status: 400 },
    );
  }

  // Ghi nhật ký dưới danh nghĩa CEO. Chỉ ghi việc đã cấp lại cho ai, KHÔNG ghi
  // mật khẩu.
  await callerClient.rpc("log_auth_event", {
    p_event_type: "password_reset_by_admin",
    p_payload: { warrior_id: warriorId, warrior_name: target.name },
  });

  return NextResponse.json({ ok: true });
}
