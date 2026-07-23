import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Cấu hình Prisma CLI — BẮT BUỘC từ Prisma 7.
 *
 * Trước đây các thiết lập này nằm rải rác trong package.json và schema.prisma.
 * Prisma 7 gom hết về đây, và file phải nằm ở thư mục gốc dự án.
 *
 * HAI ĐIỂM KHÁC BIỆT LỚN SO VỚI PRISMA 5/6:
 *  1. `url` KHÔNG còn khai báo được trong schema.prisma → phải đặt ở `datasource`
 *     bên dưới. Đây là nơi CLI (migrate, studio, db push) lấy chuỗi kết nối.
 *     Còn lúc chạy ứng dụng thì PrismaClient dùng adapter — xem lib/prisma.ts.
 *  2. `dotenv/config` phải nạp ở dòng đầu vì Prisma 7 không tự đọc .env nữa.
 */
export default defineConfig({
  schema: 'apps/api/prisma/schema.prisma',

  datasource: {
    url: env('DATABASE_URL'),
  },

  migrations: {
    path: 'apps/api/prisma/migrations',
    seed: 'tsx apps/api/prisma/seed.ts',
  },
});
