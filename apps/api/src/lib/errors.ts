/**
 * Các lớp lỗi nghiệp vụ.
 *
 * Mọi lỗi ném ra từ tầng service đều nên là một trong các lớp này, để
 * error-handler biết trả mã HTTP nào và thông báo tiếng Việt nào cho người dùng.
 * Lỗi không thuộc các lớp này sẽ bị coi là lỗi hệ thống (500) và KHÔNG lộ
 * chi tiết kỹ thuật ra ngoài.
 */

/** Chi tiết lỗi của một trường cụ thể — dùng để frontend hiện lỗi dưới từng ô nhập. */
export interface LoiTruong {
  truong: string;
  thongBao: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly maHttp: number = 500,
    public readonly chiTiet: LoiTruong[] | null = null,
  ) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** 404 — không tìm thấy tài nguyên. */
export class KhongTimThayError extends AppError {
  constructor(tenTaiNguyen = 'Tài nguyên') {
    super(`Không tìm thấy ${tenTaiNguyen.toLowerCase()}`, 404);
  }
}

/** 400 — dữ liệu đầu vào không hợp lệ. */
export class DuLieuKhongHopLeError extends AppError {
  constructor(thongBao = 'Dữ liệu không hợp lệ', chiTiet: LoiTruong[] | null = null) {
    super(thongBao, 400, chiTiet);
  }
}

/** 409 — thao tác mâu thuẫn với trạng thái hiện tại (ví dụ: tạo vòng lặp trong cây hạng mục). */
export class XungDotError extends AppError {
  constructor(thongBao = 'Thao tác này mâu thuẫn với dữ liệu hiện có') {
    super(thongBao, 409);
  }
}

/** 413 — tệp tải lên vượt giới hạn cho phép. */
export class TepQuaLonError extends AppError {
  constructor(gioiHanMB: number) {
    super(`Tệp vượt quá giới hạn ${gioiHanMB}MB`, 413);
  }
}
