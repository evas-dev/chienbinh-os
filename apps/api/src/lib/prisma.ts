import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from '../config/env.js';

/**
 * Thể hiện PrismaClient dùng chung toàn ứng dụng.
 *
 * LƯU Ý PRISMA 7: bắt buộc phải truyền driver adapter. Prisma 7 đã bỏ
 * query engine viết bằng Rust, nay nói chuyện với Postgres qua driver
 * `pg` của Node. Code Prisma 5/6 kiểu `new PrismaClient()` trần sẽ không chạy.
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

/**
 * Kiểm tra kết nối database thật sự, không phải chỉ kiểm tra đã khởi tạo client.
 * Dùng cho endpoint /api/suc-khoe.
 */
export async function kiemTraKetNoiDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/** Đóng kết nối gọn gàng khi tắt server. */
export async function dongKetNoiDatabase(): Promise<void> {
  await prisma.$disconnect();
}
