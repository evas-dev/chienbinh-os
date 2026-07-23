/**
 * Logic tính tiến độ theo trọng số (WBS).
 *
 * Đây là phần dễ sai nhất của cả dự án nên được viết test trước, và được đặt ở
 * gói dùng chung để backend lẫn frontend dùng CHUNG MỘT công thức duy nhất.
 */

/**
 * Trọng số nhỏ nhất cho phép.
 *
 * Đặt sàn bằng 1 (không phải 0) để phép chia 0 KHÔNG THỂ XẢY RA về mặt cấu trúc,
 * thay vì phải canh bằng câu lệnh if — thứ dễ bị xoá nhầm khi refactor.
 * Sàn này được chốt ở ba nơi: giá trị mặc định trong DB, ràng buộc Zod ở tầng
 * API, và hàm chiaDeuTrongSo bên dưới.
 *
 * Ý nghĩa nghiệp vụ vẫn giữ nguyên: trọng số 1 nằm cạnh trọng số 100 chỉ chiếm
 * khoảng 1% — vẫn diễn đạt được "hạng mục này không quan trọng lắm" — nhưng
 * không hạng mục nào tàng hình. Đã là con thì phải đóng góp vào tiến độ cha.
 */
export const TRONG_SO_TOI_THIEU = 1;

export const TRONG_SO_TOI_DA = 1000;

export interface ConCoTrongSo {
  trongSo: number;
  phanTram: number;
}

/**
 * Tính phần trăm hoàn thành của một nút cha từ các con TRỰC TIẾP của nó.
 *
 *     %cha = Σ(trongSo × %) / Σ(trongSo)
 *
 * Chia cho tổng trọng số THỰC TẾ chứ không chia cứng 100, nên dù người dùng
 * để tổng lệch (95 hay 110) thì tỷ lệ vẫn đúng.
 *
 * Nút không có con là nút lá — bên gọi phải rẽ nhánh trước và không gọi vào
 * đây. Nhánh mảng rỗng bên dưới chỉ là lưới an toàn.
 */
export function tinhPhanTramCha(cacCon: readonly ConCoTrongSo[]): number {
  if (cacCon.length === 0) return 0;

  let tongTrongSo = 0;
  let tongDongGop = 0;

  for (const con of cacCon) {
    // Kẹp sàn ngay tại đây: dữ liệu cũ trong DB có thể còn trọng số 0, và
    // một mẫu số bằng 0 sẽ sinh ra NaN lan khắp giao diện.
    const trongSo = Math.max(con.trongSo, TRONG_SO_TOI_THIEU);
    tongTrongSo += trongSo;
    tongDongGop += trongSo * con.phanTram;
  }

  const ketQua = Math.round(tongDongGop / tongTrongSo);
  return Math.min(100, Math.max(0, ketQua));
}

/**
 * Chia đều trọng số cho một nhóm anh em.
 *
 *   3 con   → [33, 33, 34]     (phần dư dồn vào phần tử cuối, tổng đúng 100)
 *   1 con   → [100]
 *   200 con → [1, 1, ... , 1]  (tổng 200, KHÔNG phải 100)
 *
 * Trường hợp trên 100 con: chia đều cho ra 0, nên phải kẹp sàn về 1. Tổng khi
 * đó khác 100 nhưng kết quả vẫn đúng, vì tinhPhanTramCha chia cho tổng thực tế.
 */
export function chiaDeuTrongSo(soLuong: number): number[] {
  if (soLuong <= 0) return [];

  const phanCoBan = Math.floor(100 / soLuong);

  // Quá nhiều con để chia đủ 100 → mỗi con nhận trọng số tối thiểu
  if (phanCoBan < TRONG_SO_TOI_THIEU) {
    return Array.from({ length: soLuong }, () => TRONG_SO_TOI_THIEU);
  }

  const ketQua = Array.from({ length: soLuong }, () => phanCoBan);
  const conThieu = 100 - phanCoBan * soLuong;
  ketQua[soLuong - 1] = phanCoBan + conThieu;

  return ketQua;
}

/**
 * Phần trăm của một nút LÁ.
 * Kiểu CHECKBOX chỉ có 0 hoặc 100; kiểu PHAN_TRAM lấy giá trị nhập tay.
 */
export function tinhPhanTramLa(
  loaiTienDo: 'CHECKBOX' | 'PHAN_TRAM',
  daHoanThanh: boolean,
  phanTramNhapTay: number,
): number {
  if (loaiTienDo === 'CHECKBOX') return daHoanThanh ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round(phanTramNhapTay)));
}

/** Tổng trọng số của một nhóm anh em — dùng cho thanh cảnh báo "thiếu/thừa" trên giao diện. */
export function tinhTongTrongSo(cacCon: readonly { trongSo: number }[]): number {
  return cacCon.reduce((tong, c) => tong + c.trongSo, 0);
}
