"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { emailTuSoDienThoai } from "@/lib/auth/email-ao";

const loginSchema = z.object({
  phone: z.string().trim().min(1, "Phải nhập số điện thoại"),
  // Không trim() giá trị thật (giữ nguyên mật khẩu gửi cho Supabase Auth),
  // nhưng chuỗi chỉ toàn khoảng trắng phải bị coi là trống (AUTH-02.3).
  password: z
    .string()
    .min(1, "Phải nhập mật khẩu")
    .refine((v) => v.trim().length > 0, "Phải nhập mật khẩu"),
});

export type LoginState = { error?: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailTuSoDienThoai(parsed.data.phone),
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: "Sai số điện thoại hoặc mật khẩu, chiến binh!" };
  }

  // Thông tin đăng nhập đúng nhưng tài khoản đã bị Tổng Tư Lệnh ngưng hoạt
  // động (AUTH-04) — chặn ngay tại đây, không để lọt vào Sở chỉ huy rồi mới
  // bị đá ra (tránh vòng lặp redirect và không lộ chi tiết nội bộ).
  const { data: profile } = await supabase
    .from("profiles")
    .select("active")
    .eq("id", data.user.id)
    .single();

  if (!profile || !profile.active) {
    // Ghi nhận trước khi signOut() (cần auth.uid() còn hợp lệ) — AUTH-10:
    // audit log không được giả báo thành công khi thao tác bảo mật quan
    // trọng xảy ra, nhưng cũng không được chặn luồng đăng nhập nếu ghi log
    // lỗi (best-effort, không throw).
    await supabase.rpc("log_auth_event", { p_event_type: "login_blocked_inactive" });
    await supabase.auth.signOut();
    return {
      error:
        "Tài khoản của bạn đã bị ngưng hoạt động. Vui lòng liên hệ Tổng Tư Lệnh để được hỗ trợ.",
    };
  }

  await supabase.rpc("log_auth_event", { p_event_type: "login_success" });

  redirect("/");
}
