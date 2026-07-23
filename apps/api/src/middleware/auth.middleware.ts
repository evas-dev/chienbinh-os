import type { RequestHandler } from 'express';

/**
 * Middleware xác thực — HIỆN TẠI KHÔNG LÀM GÌ (no-op).
 *
 * ---------------------------------------------------------------------------
 * VÌ SAO TỒN TẠI DÙ CHƯA DÙNG?
 *
 * Ứng dụng hiện chạy local trên máy CEO nên chưa cần đăng nhập. Nhưng toàn bộ
 * route đã đi qua middleware này sẵn, nên khi cần bật xác thực (bắt buộc trước
 * khi đưa lên VPS) chỉ phải sửa ĐÚNG FILE NÀY, không phải sờ vào 40 route.
 *
 * KHI BẬT AUTH, THAY THÂN HÀM BÊN DƯỚI BẰNG:
 *   1. Đọc session cookie (httpOnly, sameSite: 'strict')
 *   2. Không hợp lệ → res.status(401).json({ thanhCong: false, loi: 'Chưa đăng nhập' })
 *   3. Hợp lệ → gán req.nguoiDung rồi next()
 *
 * Nhớ đặt BAT_AUTH=true trong .env, nếu không main.ts sẽ chặn khởi động
 * ở chế độ production.
 * ---------------------------------------------------------------------------
 */
export const authMiddleware: RequestHandler = (_req, _res, next) => {
  next();
};
