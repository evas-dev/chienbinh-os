import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Nạp file .env từ THƯ MỤC GỐC của monorepo.
 *
 * Không dùng `import 'dotenv/config'` được vì nó tìm .env theo thư mục làm việc,
 * mà npm workspaces đặt thư mục làm việc ở apps/api/ chứ không phải gốc dự án.
 * Suy đường dẫn từ vị trí file này để chạy đúng dù khởi động bằng cách nào
 * (npm run dev từ gốc, npm run dev trong workspace, hay node dist/main.js).
 *
 * Độ sâu giống nhau ở cả mã nguồn lẫn bản build:
 *   apps/api/src/config/env.ts   → lùi 4 cấp = gốc
 *   apps/api/dist/config/env.js  → lùi 4 cấp = gốc
 */
const thuMucHienTai = path.dirname(fileURLToPath(import.meta.url));
const duongDanEnv = path.resolve(thuMucHienTai, '../../../../.env');
dotenv.config({ path: duongDanEnv, quiet: true });

/**
 * Kiểm tra biến môi trường ngay khi khởi động (fail-fast).
 *
 * Triết lý: thà chết ngay lúc khởi động với thông báo rõ ràng, còn hơn chạy được
 * rồi lỗi mơ hồ ở giữa nghiệp vụ lúc 11h đêm. Mọi thông báo đều bằng tiếng Việt
 * để người dùng tự sửa được mà không cần đọc code.
 */
const schemaEnv = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.coerce.number().int().min(1).max(65535).default(3001),

  // Zod 4: dùng z.url() thay cho z.string().url() của Zod 3
  DATABASE_URL: z.url({
    error: 'DATABASE_URL phải là chuỗi kết nối hợp lệ, ví dụ: postgresql://user@localhost:5432/ceo_quanly',
  }),

  UPLOAD_DIR: z.string().default('./uploads'),

  MUI_GIO: z.string().default('Asia/Ho_Chi_Minh'),

  /**
   * Rỗng = tắt magic link. Khi có giá trị (lên VPS hoặc chạy cloudflared tunnel),
   * email giao việc sẽ kèm nút "Xác nhận đã hoàn thành". Không cần sửa code.
   */
  PUBLIC_BASE_URL: z.string().optional(),

  /**
   * Chốt chặn an toàn: app hiện chưa có đăng nhập. Xem thêm ở main.ts.
   * Nhận cả "true"/"1" lẫn "false"/"0".
   */
  BAT_AUTH: z
    .enum(['true', 'false', '1', '0'])
    .default('false')
    .transform((v) => v === 'true' || v === '1'),

  // --- Email (TÙY CHỌN) ------------------------------------------------------
  // Để trống thì app vẫn chạy bình thường, chỉ là tính năng email chưa bật.
  // Không validate chặt ở đây (email/độ dài) vì để trống là hợp lệ; việc kiểm
  // App Password đúng 16 ký tự được làm ở tầng email khi thực sự kết nối, kèm
  // thông báo tiếng Việt rõ ràng.
  GMAIL_DIA_CHI: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),

  // Khóa ký liên kết xác nhận hoàn thành. Sinh sẵn ở .env khi khởi tạo dự án.
  MAGIC_LINK_SECRET: z.string().min(16).optional(),
});

const ketQua = schemaEnv.safeParse(process.env);

if (!ketQua.success) {
  // Không dùng logger ở đây vì logger cũng phụ thuộc env — sẽ vòng lặp.
  console.error('\n❌ Biến môi trường không hợp lệ. Kiểm tra lại file .env:\n');
  for (const issue of ketQua.error.issues) {
    const truong = issue.path.join('.') || '(gốc)';
    console.error(`   • ${truong}: ${issue.message}`);
  }
  console.error('\n   Gợi ý: đối chiếu với file .env.example ở thư mục gốc.\n');
  process.exit(1);
}

export const env = ketQua.data;

export type Env = typeof env;
