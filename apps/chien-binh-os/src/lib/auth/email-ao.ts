/**
 * Supabase Auth bắt buộc phải có email, nhưng nhân sự chỉ đăng nhập bằng số
 * điện thoại. Ta ghép một email ảo cố định từ số đó — không có hộp thư thật,
 * chỉ dùng làm khoá đăng nhập.
 *
 * Gom vào một chỗ vì công thức này phải giống hệt nhau ở mọi nơi: lệch một ký
 * tự là tài khoản tạo ra không đăng nhập được, hoặc đổi mật khẩu nhầm người.
 */
export const MIEN_AO = "chienbinh.local";

export function emailTuSoDienThoai(soDienThoai: string) {
  return `${soDienThoai.trim()}@${MIEN_AO}`;
}
