/**
 * Mốc tuần của chu kỳ mục tiêu — Thứ Hai đến Chủ Nhật.
 *
 * Phải chốt múi giờ Việt Nam: server chạy UTC, nếu dùng `new Date().getDay()`
 * trần thì từ 17:00 chiều Chủ Nhật (giờ VN) trở đi đã bị tính sang tuần mới.
 * Kết quả ở đây khớp với hàm `tuan_hien_tai()` trong DB (migration 0031).
 */

const MUI_GIO = "Asia/Ho_Chi_Minh";

/** Ngày hôm nay theo giờ VN, dạng YYYY-MM-DD. */
function ngayVN(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MUI_GIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Tuần chứa thời điểm `now`. Mọi phép tính ngày làm trên UTC để không dính
 * múi giờ của máy chủ — chỉ dùng phần y/m/d đã quy đổi sang giờ VN ở trên.
 */
export function tuanHienTai(now: Date = new Date()) {
  const [y, m, d] = ngayVN(now).split("-").map(Number);
  const homNay = new Date(Date.UTC(y, m - 1, d));

  const thu = homNay.getUTCDay(); // 0 = Chủ Nhật … 6 = Thứ Bảy
  const luiVeThuHai = thu === 0 ? 6 : thu - 1;

  const batDau = new Date(homNay);
  batDau.setUTCDate(homNay.getUTCDate() - luiVeThuHai);

  const ketThuc = new Date(batDau);
  ketThuc.setUTCDate(batDau.getUTCDate() + 6);

  return { batDau, ketThuc, homNay };
}

/** Khoá tuần dạng YYYY-MM-DD — khớp cột `objectives.week_start`. */
export function khoaTuan(now: Date = new Date()) {
  return tuanHienTai(now).batDau.toISOString().slice(0, 10);
}

function ddmm(d: Date) {
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Nhãn khoảng tuần, vd "27/07 – 02/08". */
export function nhanTuan(weekStart: string) {
  const [y, m, d] = weekStart.split("-").map(Number);
  const batDau = new Date(Date.UTC(y, m - 1, d));
  const ketThuc = new Date(batDau);
  ketThuc.setUTCDate(batDau.getUTCDate() + 6);
  return `${ddmm(batDau)} – ${ddmm(ketThuc)}`;
}

/** Số ngày còn lại tới hết Chủ Nhật (0 = hôm nay là Chủ Nhật). */
export function soNgayConLaiTrongTuan(now: Date = new Date()) {
  const { ketThuc, homNay } = tuanHienTai(now);
  return Math.max(0, Math.round((ketThuc.getTime() - homNay.getTime()) / 86_400_000));
}
