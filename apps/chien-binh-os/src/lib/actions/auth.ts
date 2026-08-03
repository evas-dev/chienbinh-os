"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emailTuSoDienThoai } from "@/lib/auth/email-ao";
import { DO_DAI_MAT_KHAU_TOI_THIEU } from "@/lib/auth/mat-khau";
import type { ActionResult } from "./missions";

export async function logoutAction() {
  const supabase = await createClient();
  // Ghi nhận trước khi signOut() — sau đó auth.uid() không còn hợp lệ để RPC
  // xác định tác nhân (AUTH-10.1: mọi sự kiện đăng xuất phải có tác nhân).
  await supabase.rpc("log_auth_event", { p_event_type: "logout" });
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Nhân sự tự đổi mật khẩu.
 *
 * Supabase cho đổi mật khẩu chỉ với phiên đăng nhập hiện tại, KHÔNG hỏi mật
 * khẩu cũ. Như vậy ai mượn được máy đang mở sẵn là chiếm luôn tài khoản. Nên
 * ở đây ta tự xác minh: đăng nhập lại bằng mật khẩu cũ trước, sai thì dừng.
 */
export async function doiMatKhauAction(
  matKhauCu: string,
  matKhauMoi: string,
): Promise<ActionResult> {
  if (matKhauMoi.length < DO_DAI_MAT_KHAU_TOI_THIEU) {
    return { ok: false, error: `Mật khẩu mới phải có ít nhất ${DO_DAI_MAT_KHAU_TOI_THIEU} ký tự` };
  }
  if (matKhauCu === matKhauMoi) {
    return { ok: false, error: "Mật khẩu mới phải khác mật khẩu hiện tại" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Phải đăng nhập" };

  const { data: hoSo } = await supabase.from("profiles").select("phone").eq("id", user.id).single();
  if (!hoSo?.phone) return { ok: false, error: "Không tìm thấy tài khoản" };

  // Xác minh mật khẩu cũ. Đăng nhập lại đúng người đang đăng nhập nên phiên
  // không đổi chủ; sai mật khẩu thì Supabase trả lỗi và không đụng gì tới
  // phiên hiện tại.
  const { error: loiXacMinh } = await supabase.auth.signInWithPassword({
    email: emailTuSoDienThoai(hoSo.phone),
    password: matKhauCu,
  });
  if (loiXacMinh) return { ok: false, error: "Mật khẩu hiện tại không đúng" };

  const { error: loiDoi } = await supabase.auth.updateUser({ password: matKhauMoi });
  if (loiDoi) {
    return { ok: false, error: loiDoi.message || "Không đổi được mật khẩu" };
  }

  // Chỉ ghi lại SỰ KIỆN, tuyệt đối không ghi mật khẩu vào nhật ký.
  await supabase.rpc("log_auth_event", { p_event_type: "password_change" });

  return { ok: true, data: undefined };
}
