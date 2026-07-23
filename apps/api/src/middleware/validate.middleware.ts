import type { Request, RequestHandler } from 'express';
import type { ZodType } from 'zod';

/**
 * Kiểm tra dữ liệu đầu vào bằng schema Zod dùng chung với frontend.
 *
 * Dữ liệu sau khi kiểm được ghi đè vào req.body, nên controller nhận thẳng dữ
 * liệu đã ép kiểu (chuỗi ngày đã thành Date, chuỗi số đã thành number).
 *
 * Lỗi Zod ném ra sẽ được error-handler bắt và trả về dạng thống nhất có tên
 * từng trường sai — giao diện hiện lỗi ngay dưới đúng ô nhập.
 */

declare module 'express-serve-static-core' {
  interface Request {
    /** Tham số truy vấn đã qua kiểm tra và ép kiểu. Xem kiemTraQuery bên dưới. */
    queryDaKiem?: unknown;
  }
}

export function kiemTraBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}

export function kiemTraQuery(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    // Express 5 biến req.query thành getter chỉ đọc (Express 4 thì gán đè được),
    // nên phải cất kết quả sang thuộc tính riêng.
    req.queryDaKiem = schema.parse(req.query);
    next();
  };
}

/** Lấy tham số truy vấn đã kiểm trong controller, đã đúng kiểu. */
export function layQuery<T>(req: Request): T {
  return req.queryDaKiem as T;
}
