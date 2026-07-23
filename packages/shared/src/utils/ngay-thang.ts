import type { MucCanhBao } from '../constants/trang-thai.js';

/** Múi giờ nghiệp vụ. Mọi phép tính hạn đều quy về đây. */
export const MUI_GIO_VN = 'Asia/Ho_Chi_Minh';

const MOT_NGAY_MS = 86_400_000;

/**
 * Trả về ngày lịch theo giờ Việt Nam, dạng "2026-07-23".
 *
 * Dùng Intl thay vì thư viện múi giờ vì ba lý do: chính xác, không thêm phụ
 * thuộc, và dễ test do đầu ra là chuỗi thuần. Locale "en-CA" cho ra đúng
 * định dạng YYYY-MM-DD.
 *
 * QUAN TRỌNG: hàm này khiến kết quả KHÔNG phụ thuộc múi giờ của máy chủ —
 * chạy trên máy Mac giờ VN hay trên VPS chạy UTC đều ra cùng kết quả.
 */
export function ngayLichVN(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: MUI_GIO_VN,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Số ngày còn lại tới hạn, tính theo RANH GIỚI NGÀY ở giờ Việt Nam.
 *
 * Quy tắc nghiệp vụ: cứ qua nửa đêm là ngày mới. Giờ phút không ảnh hưởng —
 * hạn 00:01 và hạn 23:59 cùng một ngày đều cho ra kết quả giống nhau.
 *
 *   > 0  còn bấy nhiêu ngày
 *   = 0  đến hạn hôm nay
 *   < 0  đã quá hạn bấy nhiêu ngày
 */
export function tinhSoNgayConLai(hanHoanThanh: Date, bayGio: Date = new Date()): number {
  const mocHan = Date.parse(`${ngayLichVN(hanHoanThanh)}T00:00:00Z`);
  const mocHienTai = Date.parse(`${ngayLichVN(bayGio)}T00:00:00Z`);
  return Math.round((mocHan - mocHienTai) / MOT_NGAY_MS);
}

/**
 * Xếp mức cảnh báo để tô màu.
 *
 * KHÔNG lưu giá trị này vào cơ sở dữ liệu: nó là hàm của thời điểm hiện tại,
 * lưu xuống là ôi thiu ngay sau một đêm.
 *
 * @param nguongVang Số ngày bắt đầu cảnh báo vàng, lấy từ bảng CauHinh.
 */
export function xepMucCanhBao(
  soNgayConLai: number,
  nguongVang: number,
  daHoanThanh: boolean,
): MucCanhBao {
  // Việc đã xong thì dù quá hạn bao lâu cũng không cần cảnh báo nữa.
  if (daHoanThanh) return 'BINH_THUONG';

  if (soNgayConLai < 0) return 'QUA_HAN';
  if (soNgayConLai === 0) return 'HOM_NAY';
  if (soNgayConLai <= nguongVang) return 'SAP_TOI';
  return 'BINH_THUONG';
}

/** Định dạng ngày để hiển thị: 23/07/2026 (theo giờ Việt Nam). */
export function dinhDangNgayVN(d: Date): string {
  const [nam, thang, ngay] = ngayLichVN(d).split('-');
  return `${ngay}/${thang}/${nam}`;
}

/**
 * Mô tả số ngày còn lại bằng tiếng Việt, dùng trực tiếp trên huy hiệu.
 * Ví dụ: "Quá hạn 3 ngày" · "Hôm nay" · "Còn 2 ngày"
 */
export function moTaSoNgayConLai(soNgayConLai: number): string {
  if (soNgayConLai < 0) return `Quá hạn ${Math.abs(soNgayConLai)} ngày`;
  if (soNgayConLai === 0) return 'Hôm nay';
  return `Còn ${soNgayConLai} ngày`;
}
