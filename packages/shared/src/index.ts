/**
 * Điểm xuất chung của gói @ceo/shared.
 *
 * Gói này chứa những thứ CẢ backend lẫn frontend đều dùng:
 *  - Schema Zod (validate một lần, dùng hai đầu → không bao giờ lệch luật)
 *  - Hằng số và nhãn tiếng Việt cho các enum
 *  - Công thức tính tiến độ theo trọng số
 *  - Hàm tính ngày tháng theo múi giờ Việt Nam
 */

export * from './constants/muc-do-uu-tien.js';
export * from './constants/trang-thai.js';

export * from './utils/ngay-thang.js';
export * from './utils/tien-do.js';

export * from './schemas/nhan-su.schema.js';
export * from './schemas/cong-viec.schema.js';
export * from './schemas/hang-muc.schema.js';
export * from './schemas/bang-toi-han.schema.js';
export * from './schemas/cau-hinh.schema.js';

/** Dạng phản hồi thống nhất của mọi endpoint. */
export interface PhanHoiThanhCong<T> {
  thanhCong: true;
  duLieu: T;
}

export interface LoiTruong {
  truong: string;
  thongBao: string;
}

export interface PhanHoiLoi {
  thanhCong: false;
  loi: string;
  chiTiet: LoiTruong[] | null;
}

export type PhanHoi<T> = PhanHoiThanhCong<T> | PhanHoiLoi;
