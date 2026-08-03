/**
 * Quy tắc mật khẩu dùng chung cho cả nhân sự tự đổi lẫn CEO cấp lại.
 *
 * ĐỂ RIÊNG một file, không nhét vào `lib/actions/auth.ts`: file đó mang chỉ
 * thị "use server" nên chỉ được phép export hàm async. Thêm một hằng số vào
 * đó là cả module mất sạch export, kéo theo lỗi "logoutAction was not found"
 * ở chỗ hoàn toàn khác.
 */
export const DO_DAI_MAT_KHAU_TOI_THIEU = 6;
