/**
 * Nút lọc dạng viên thuốc (chọn phòng ban, chọn cấp xếp hạng...).
 *
 * Gom lại vì trang Nhân sự và bảng Xếp hạng giờ nằm chung một trang — trước
 * đây mỗi bên tự định nghĩa một kiểu (lệch nhau ở padding và đường viền), đứng
 * cạnh nhau sẽ lộ ngay.
 */
export const PILL_BASE =
  "font-heading rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors";
export const PILL_ON = "bg-cb-gold text-cb-bg border-black/60";
export const PILL_OFF = "bg-cb-panel-2 text-cb-ink-dim border-cb-line hover:text-cb-ink";
