import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, type LoiTruong } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

/** Dạng phản hồi lỗi thống nhất — frontend chỉ cần xử lý một hình dạng duy nhất. */
interface PhanHoiLoi {
  thanhCong: false;
  loi: string;
  chiTiet: LoiTruong[] | null;
}

/** 404 cho route không tồn tại. Đặt SAU tất cả route, TRƯỚC errorHandler. */
export const khongTimThayRoute: RequestHandler = (req, res) => {
  res.status(404).json({
    thanhCong: false,
    loi: `Không tìm thấy đường dẫn ${req.method} ${req.path}`,
    chiTiet: null,
  } satisfies PhanHoiLoi);
};

/**
 * Xử lý lỗi tập trung.
 *
 * Express 5 tự bắt lỗi ném ra từ async handler và chuyển tới đây, nên không
 * cần gói từng handler bằng express-async-handler như thời Express 4.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Lỗi validate từ Zod → gom thành danh sách theo từng trường
  if (err instanceof ZodError) {
    const chiTiet: LoiTruong[] = err.issues.map((i) => ({
      truong: i.path.join('.') || '(gốc)',
      thongBao: i.message,
    }));
    res.status(400).json({
      thanhCong: false,
      loi: 'Dữ liệu gửi lên không hợp lệ',
      chiTiet,
    } satisfies PhanHoiLoi);
    return;
  }

  // Lỗi nghiệp vụ đã biết trước → trả nguyên thông báo tiếng Việt
  if (err instanceof AppError) {
    res.status(err.maHttp).json({
      thanhCong: false,
      loi: err.message,
      chiTiet: err.chiTiet,
    } satisfies PhanHoiLoi);
    return;
  }

  // Lỗi ngoài dự kiến: ghi log đầy đủ ở server, nhưng KHÔNG lộ chi tiết kỹ thuật
  // ra ngoài (tránh rò rỉ đường dẫn file, câu SQL, tên bảng...).
  logger.error({ err }, 'Lỗi không lường trước');

  res.status(500).json({
    thanhCong: false,
    loi: 'Lỗi hệ thống. Vui lòng thử lại hoặc xem log máy chủ.',
    chiTiet:
      env.NODE_ENV === 'development'
        ? [{ truong: '(dev)', thongBao: err instanceof Error ? err.message : String(err) }]
        : null,
  } satisfies PhanHoiLoi);
};
