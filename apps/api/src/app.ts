import express from 'express';
import { authMiddleware } from './middleware/auth.middleware.js';
import { errorHandler, khongTimThayRoute } from './middleware/error-handler.middleware.js';
import { kiemTraKetNoiDatabase } from './lib/prisma.js';
import { env } from './config/env.js';

/**
 * Dựng Express app.
 *
 * Tách khỏi main.ts để sau này viết test tích hợp có thể import app
 * mà không khởi động server thật.
 */
export function taoApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check đặt TRƯỚC authMiddleware để còn kiểm tra được khi đã bật auth
  app.get('/api/suc-khoe', async (_req, res) => {
    const dbOk = await kiemTraKetNoiDatabase();
    res.status(dbOk ? 200 : 503).json({
      trangThai: dbOk ? 'OK' : 'LOI',
      database: dbOk ? 'da-ket-noi' : 'khong-ket-noi-duoc',
      moiTruong: env.NODE_ENV,
      thoiGian: new Date().toISOString(),
    });
  });

  // Từ đây trở xuống là các route nghiệp vụ, đều đi qua lớp xác thực.
  // Hiện authMiddleware chưa làm gì — xem giải thích trong auth.middleware.ts
  app.use('/api', authMiddleware);

  // Các module nghiệp vụ (nhan-su, cong-viec, hang-muc...) sẽ gắn vào đây ở giai đoạn 1.

  app.use(khongTimThayRoute);
  app.use(errorHandler);

  return app;
}
