import { taoApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { dongKetNoiDatabase, kiemTraKetNoiDatabase } from './lib/prisma.js';

/**
 * ===========================================================================
 * CHỐT CHẶN AN TOÀN — ĐỪNG XÓA
 *
 * Ứng dụng này CHƯA CÓ ĐĂNG NHẬP. Chạy local trên máy CEO thì không sao,
 * nhưng nếu vô tình deploy lên VPS thì toàn bộ danh bạ nhân sự, email và
 * dữ liệu công việc của công ty sẽ phơi ra internet công cộng.
 *
 * Vì vậy: chạy ở NODE_ENV=production mà chưa bật auth thì TỪ CHỐI KHỞI ĐỘNG.
 * Đây là hành vi CỐ Ý, không phải lỗi.
 *
 * Muốn deploy: cài đặt xác thực trong middleware/auth.middleware.ts rồi
 * đặt BAT_AUTH=true trong .env.
 * ===========================================================================
 */
if (env.NODE_ENV === 'production' && !env.BAT_AUTH) {
  console.error(
    [
      '',
      '❌ TỪ CHỐI KHỞI ĐỘNG',
      '',
      '   Đang chạy ở chế độ production nhưng chưa bật xác thực (BAT_AUTH=false).',
      '   Khởi động lúc này sẽ để lộ dữ liệu nhân sự và công việc ra internet.',
      '',
      '   Cách xử lý:',
      '     1. Cài đặt xác thực trong apps/api/src/middleware/auth.middleware.ts',
      '     2. Đặt BAT_AUTH=true trong file .env',
      '',
      '   Nếu chỉ muốn chạy thử trên máy: đặt NODE_ENV=development',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

async function khoiDong() {
  // Kiểm tra database TRƯỚC khi mở cổng, để không có tình trạng server
  // nhận request rồi mới phát hiện không nói chuyện được với DB.
  const dbOk = await kiemTraKetNoiDatabase();
  if (!dbOk) {
    logger.fatal(
      'Không kết nối được PostgreSQL. Kiểm tra: (1) service đã chạy chưa ' +
        '[brew services start postgresql@17], (2) DATABASE_URL trong .env có đúng không.',
    );
    process.exit(1);
  }

  const app = taoApp();

  /**
   * Chỉ lắng nghe trên 127.0.0.1, KHÔNG phải 0.0.0.0.
   * Nghĩa là chỉ chính máy này truy cập được — máy khác trong cùng mạng LAN
   * (quán cà phê, văn phòng, wifi khách) không vào được.
   */
  const server = app.listen(env.PORT, '127.0.0.1', () => {
    logger.info(`✅ API đang chạy tại http://127.0.0.1:${env.PORT}`);
    logger.info(`   Kiểm tra sức khỏe: http://127.0.0.1:${env.PORT}/api/suc-khoe`);
    logger.info(`   Môi trường: ${env.NODE_ENV} · Xác thực: ${env.BAT_AUTH ? 'BẬT' : 'TẮT'}`);
  });

  // Tắt gọn gàng: đóng cổng và ngắt kết nối DB thay vì cắt ngang đột ngột.
  const tatGonGang = async (tinHieu: string) => {
    logger.info(`Nhận tín hiệu ${tinHieu}, đang tắt server...`);
    server.close(async () => {
      await dongKetNoiDatabase();
      logger.info('Đã tắt gọn gàng.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void tatGonGang('SIGINT'));
  process.on('SIGTERM', () => void tatGonGang('SIGTERM'));
}

khoiDong().catch((err) => {
  logger.fatal({ err }, 'Khởi động thất bại');
  process.exit(1);
});
