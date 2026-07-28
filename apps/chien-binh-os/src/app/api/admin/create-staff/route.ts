import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(8),
  password: z.string().min(4).default("123456"),
  dept: z.string().trim().min(1),
  front: z.enum(["tien_tuyen", "hau_phuong"]),
  role: z.enum(["chien_sy", "tu_lenh"]),
  squadId: z.string().nullable().optional(),
});

// Tạo tài khoản nhân sự = 2 bước bắt buộc (RPC thường không tạo được auth.users):
// 1) service_role tạo auth user (email = <sđt>@chienbinh.local)
// 2) RPC admin_create_warrior (chạy dưới session CEO hiện tại) tạo dòng profiles khớp id đó
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const { name, phone, password, dept, front, role, squadId } = parsed.data;

  // ADM-04.2: chặn ngay tại đây nếu người gọi không phải CEO — tránh tạo rồi
  // xoá một auth user "mồ côi" tạm thời một cách không cần thiết, và từ chối
  // rõ ràng thay vì để lỗi cấu hình service-role che khuất nguyên nhân thật.
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
  if (!callerProfile || !callerProfile.active || callerProfile.role !== "tong_tu_lenh") {
    return NextResponse.json({ error: "Chỉ Tổng Tư Lệnh mới được tạo tài khoản nhân sự" }, { status: 403 });
  }

  let serviceClient;
  try {
    serviceClient = createServiceRoleClient();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi cấu hình" }, { status: 500 });
  }

  const { data: created, error: createErr } = await serviceClient.auth.admin.createUser({
    email: `${phone}@chienbinh.local`,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "Không tạo được tài khoản đăng nhập" },
      { status: 400 },
    );
  }

  const { error: rpcErr } = await callerClient.rpc("admin_create_warrior", {
    p_user_id: created.user.id,
    p_name: name,
    p_phone: phone,
    p_dept: dept,
    p_front: front,
    p_role: role,
    p_squad_id: squadId || undefined,
  } as never);

  if (rpcErr) {
    // Dọn dẹp: xoá auth user vừa tạo để tránh tài khoản mồ côi không có profiles.
    await serviceClient.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: rpcErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: created.user.id });
}
