# GĐ 0 — Nền móng

**Ưu tiên:** Chặn tất cả · **Trạng thái:** ✅ **HOÀN THÀNH** (2026-07-23) · **Ước lượng:** 0.5 ngày

---

## ✅ KẾT QUẢ THỰC HIỆN — đọc phần này trước khi làm GĐ 1

### Quyết định R1: **hạ TypeScript 7 → TypeScript 6.0.3**

Đã kiểm chứng thật, không phỏng đoán:

| | TypeScript 7.0.2 | TypeScript 6.0.3 (đã chọn) |
|---|---|---|
| Kích thước giải nén | 2.5 MB | 24.3 MB |
| `bin/` | chỉ `tsc` | `tsc` + **`tsserver`** |
| Compiler API (`require('typescript')`) | chỉ trả `{version}` — `createProgram` là `undefined` | đầy đủ |

**Lý do hạ:** TS 7 là bản port sang Go, **chỉ ship CLI**. Không có `tsserver` nghĩa là VS Code không dùng được phiên bản trong dự án; không có API nghĩa là `@typescript-eslint` và mọi công cụ type-check bằng chương trình đều hỏng. Chính `create-vite@8` cũng ghim `typescript: ~6.0.2` và chuyển sang `oxlint` (viết bằng Rust, không cần TS API).

Kế hoạch ban đầu ghi dự phòng `~5.9`, nhưng **TS 6 mới là bản đầy đủ mới nhất** → dùng `~6.0.2` cho khớp hệ sinh thái. Đã thêm `overrides` ở `package.json` gốc để mọi workspace dùng chung một bản.

⚠️ **Cạm bẫy:** bài test API đầu tiên báo "API OK" là **dương tính giả** — `require('typescript')` vớ phải `lib/version.cjs` (113 byte, chỉ export version). Phải kiểm `typeof ts.createProgram` mới ra sự thật.

### Bốn phát hiện khác với kế hoạch (đều đã xử lý)

**1. Prisma 7 cấm `url` trong `schema.prisma`** — tài liệu nâng cấp không nhắc điều này.
```
Error P1012: The datasource property `url` is no longer supported in schema files.
```
→ `datasource db` chỉ còn `provider`. Chuỗi kết nối chuyển vào `prisma.config.ts`:
```ts
datasource: { url: env('DATABASE_URL') }
```
Runtime vẫn dùng adapter riêng trong `lib/prisma.ts`. **Mọi ví dụ Prisma 5/6 trên mạng đều sai ở điểm này.**

**2. Prisma 7 sinh ra file `.ts` nguồn**, không phải `.js` biên dịch sẵn.

**3. `dotenv` tìm `.env` sai chỗ trong npm workspaces.** `import 'dotenv/config'` đọc theo thư mục làm việc, mà workspace đặt cwd ở `apps/api/` chứ không phải gốc → API từ chối khởi động vì "thiếu DATABASE_URL" dù `.env` có đủ.
→ `config/env.ts` nay suy đường dẫn từ `import.meta.url`, lùi 4 cấp. Chạy đúng dù khởi động kiểu nào.

**4. TypeScript 6 khai tử `baseUrl`** (`error TS5101`). Từ TS 6, `paths` tự phân giải theo vị trí file tsconfig → đã bỏ `baseUrl`, chỉ giữ `paths`.

**5. shadcn CLI 4.x đổi cờ hoàn toàn.** Không còn `--base-color`. Lệnh đúng:
```bash
npx shadcn@latest init -b radix -p nova --no-monorepo -y
```

### Kiểm chứng đã chạy thật

| # | Tiêu chí | Kết quả |
|---|---|---|
| 1 | `npm run dev` → 2 server | ✅ API `127.0.0.1:3001`, web `localhost:5173` |
| 2 | Giao diện tiếng Việt, Tailwind | ✅ Đủ dấu (Geist có subset tiếng Việt riêng) |
| 3 | `/api/suc-khoe` | ✅ `database: "da-ket-noi"` — cả trực tiếp lẫn qua proxy Vite |
| 4 | Xóa `DATABASE_URL` | ✅ Từ chối khởi động, thông báo tiếng Việt chỉ rõ trường sai |
| 5 | `NODE_ENV=production` + `BAT_AUTH=false` | ✅ Từ chối khởi động; với `BAT_AUTH=true` thì chạy bình thường |
| 6 | `npm run typecheck` | ✅ Sạch cả 3 workspace |
| 7 | Quyết định R1 | ✅ Ghi ở trên |
| + | `npm run build` | ✅ 232 KB JS (74 KB gzip), 49 KB CSS (9.35 KB gzip) |
| + | Console trình duyệt | ✅ 0 lỗi |
| + | `npm audit` | ✅ 0 lỗ hổng (hạ `concurrently` → 9.2.4 xử lý luôn `shell-quote`) |

### Lệch nhỏ so với kế hoạch
- `concurrently` dùng **9.2.4** thay vì 10.x — bản 10 kéo theo `shell-quote` có lỗ hổng DoS mức cao
- `create-vite@8` mặc định thêm `oxlint`; giữ lại vì nó không cần TS API
- Bộ shadcn thêm: `separator` (dùng cho AppShell)

---

Dựng bộ khung monorepo chạy được, kết nối Postgres thành công, trang chủ tiếng Việt hiển thị. Chưa có nghiệp vụ nào.

**Liên kết:** [plan.md](plan.md) · [Thiết kế](reports/brainstorm-260723-thiet-ke-he-thong.md)

---

## Mục tiêu

Sau giai đoạn này, `npm run dev` khởi động cả API lẫn web, mở trình duyệt thấy AppShell tiếng Việt, và `/api/suc-khoe` trả về trạng thái kết nối Postgres OK.

## Quyết định phải chốt ngay trong giai đoạn này

**R1 — TypeScript 7.** Bản 7.x là port Go (tsgo), rất nhanh nhưng có thể chưa tương thích hết plugin. Bước 2 kiểm thật. Nếu vỡ → hạ ngay về `typescript@~5.9` bằng `overrides` ở package.json gốc. **Không để câu hỏi này trôi sang GĐ 1.**

---

## File cần tạo

```
ceo-quanly/                          ← chính là thư mục /Users/tuantoha/CEO quản lý
├── package.json                     workspaces + scripts
├── tsconfig.base.json               config TS dùng chung
├── .gitignore
├── .env.example
├── .env                             (gitignored, tạo từ .env.example)
├── prisma.config.ts                 ⚠ BẮT BUỘC ở Prisma 7
│
├── packages/shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/index.ts                 tạm export {} — nội dung ở GĐ 1
│
├── apps/api/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/schema.prisma         chỉ datasource + generator, chưa có model
│   └── src/
│       ├── main.ts                  bind 127.0.0.1, chốt chặn R6
│       ├── app.ts                   express app + middleware chain
│       ├── config/env.ts            validate env bằng Zod, fail-fast
│       ├── lib/prisma.ts            PrismaClient + PrismaPg adapter
│       ├── lib/logger.ts            pino
│       ├── lib/errors.ts            AppError, NotFoundError, ValidationError
│       └── middleware/
│           ├── auth.middleware.ts   no-op, có comment giải thích
│           └── error-handler.middleware.ts
│
└── apps/web/
    ├── package.json
    ├── tsconfig.json · tsconfig.app.json
    ├── vite.config.ts               plugin tailwindcss + alias @ + proxy /api
    ├── index.html                   lang="vi"
    ├── components.json              shadcn sinh ra
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css                @import "tailwindcss"
        ├── lib/utils.ts             cn()
        └── components/layout/
            ├── AppShell.tsx
            └── ThanhDieuHuong.tsx
```

---

## Các bước

### 1. Khởi tạo repo và workspaces

```bash
cd "/Users/tuantoha/CEO quản lý"
git init
```

`package.json` gốc:
```json
{
  "name": "ceo-quanly",
  "private": true,
  "type": "module",
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "concurrently -n api,web -c cyan,magenta \"npm:dev:api\" \"npm:dev:web\"",
    "dev:api": "npm run dev -w @ceo/api",
    "dev:web": "npm run dev -w @ceo/web",
    "build": "npm run build -w @ceo/shared && npm run build -w @ceo/api && npm run build -w @ceo/web",
    "typecheck": "tsc -b --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

> ⚠️ Prisma 7 **không còn tự chạy** `generate` sau `migrate`. Mỗi lần đổi schema phải chạy `npm run db:generate` thủ công, hoặc gộp: `"db:migrate": "prisma migrate dev && prisma generate"`.

### 2. Kiểm chứng TypeScript 7 (quyết định R1)

Cài `typescript@7` + `tsx`, viết một file TS dùng decorator-free code bình thường, chạy `tsc --noEmit` và `tsx src/main.ts`. Kiểm thêm: `@typescript-eslint` nếu dùng, và plugin Vite.

**Tiêu chí đạt:** typecheck sạch, tsx chạy được, Vite build được.
**Không đạt →** thêm vào package.json gốc và ghi lý do vào file này:
```json
"overrides": { "typescript": "~5.9.0" }
```

### 3. Tạo database

```bash
createdb ceo_quanly
psql -d ceo_quanly -c "select current_database();"
```

### 4. Cấu hình Prisma 7

`apps/api/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client"          // ⚠ KHÔNG phải prisma-client-js
  output   = "../src/generated/prisma" // ⚠ BẮT BUỘC ở Prisma 7
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

`prisma.config.ts` ở thư mục gốc — Prisma 7 bắt buộc:
```ts
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'apps/api/prisma/schema.prisma',
  migrations: {
    path: 'apps/api/prisma/migrations',
    seed: 'tsx apps/api/prisma/seed.ts',
  },
});
```

`apps/api/src/lib/prisma.ts` — Prisma 7 bắt buộc driver adapter:
```ts
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from '../config/env.js';

// Prisma 7 yêu cầu driver adapter, không còn tự kết nối qua Rust engine
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
```

Thêm `apps/api/src/generated/` vào `.gitignore`.

### 5. Validate biến môi trường (fail-fast)

`apps/api/src/config/env.ts` — dùng Zod 4, sai là chết ngay lúc khởi động chứ không lỗi mơ hồ lúc chạy:
```ts
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.url(),              // ⚠ Zod 4: z.url() không phải z.string().url()
  UPLOAD_DIR: z.string().default('./uploads'),
  MUI_GIO: z.string().default('Asia/Ho_Chi_Minh'),
  PUBLIC_BASE_URL: z.string().optional(),   // rỗng = tắt magic link
  BAT_AUTH: z.coerce.boolean().default(false),
});

const ketQua = schema.safeParse(process.env);
if (!ketQua.success) {
  console.error('❌ Biến môi trường không hợp lệ:', z.treeifyError(ketQua.error));
  process.exit(1);
}
export const env = ketQua.data;
```

### 6. Chốt chặn an toàn R6

`apps/api/src/main.ts`:
```ts
// Chốt chặn: app hiện chưa có đăng nhập. Không cho phép chạy production
// khi chưa bật auth — tránh phơi dữ liệu nhân sự ra internet.
if (env.NODE_ENV === 'production' && !env.BAT_AUTH) {
  logger.fatal('Từ chối khởi động: NODE_ENV=production nhưng BAT_AUTH=false.');
  process.exit(1);
}

// Chỉ lắng nghe localhost — máy khác trong LAN không truy cập được
app.listen(env.PORT, '127.0.0.1', () => { ... });
```

`auth.middleware.ts` để no-op nhưng có cấu trúc sẵn, kèm comment tiếng Việt nói rõ chỗ cần thay khi bật auth.

### 7. Frontend: Vite + Tailwind 4 + shadcn

```bash
npm create vite@latest apps/web -- --template react-ts
npm i -w @ceo/web tailwindcss @tailwindcss/vite
npm i -D -w @ceo/web @types/node
```

`src/index.css` — Tailwind 4 CSS-first, **không tạo `tailwind.config.js`**:
```css
@import "tailwindcss";
```

`vite.config.ts`:
```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:3001' },   // tránh CORS khi dev
  },
});
```

Thêm alias `@/*` vào `tsconfig.json` **và** `tsconfig.app.json`, rồi:
```bash
npx shadcn@latest init
npx shadcn@latest add button card table badge input select dialog sheet form sonner
```

### 8. AppShell tiếng Việt

`index.html` đặt `<html lang="vi">`, `<title>Quản lý Công việc</title>`.

`AppShell.tsx` — thanh điều hướng 4 mục: **Tổng quan · Công việc · Nhân sự · Cài đặt**. Chưa cần router hoạt động đầy đủ, chỉ cần khung hiển thị đúng.

### 9. Health check

`GET /api/suc-khoe` → `{ trangThai: 'OK', database: 'da-ket-noi', thoiGian: ... }`, thực sự chạy `SELECT 1` qua Prisma chứ không trả cứng.

---

## Todo

- [ ] `git init` + `.gitignore` (bỏ qua `.env`, `node_modules`, `uploads/`, `src/generated/`)
- [ ] `package.json` gốc với workspaces + scripts
- [ ] `tsconfig.base.json` + tsconfig từng workspace
- [ ] **Kiểm chứng TypeScript 7 — chốt R1, ghi kết quả vào file này**
- [ ] `createdb ceo_quanly`, xác nhận kết nối bằng psql
- [ ] `schema.prisma` với generator `prisma-client` + `output`
- [ ] `prisma.config.ts` ở thư mục gốc
- [ ] `lib/prisma.ts` với `PrismaPg` adapter
- [ ] `config/env.ts` validate Zod 4, fail-fast
- [ ] `lib/logger.ts` (pino) + `lib/errors.ts`
- [ ] `main.ts` bind 127.0.0.1 + chốt chặn R6
- [ ] `auth.middleware.ts` no-op + `error-handler.middleware.ts`
- [ ] `GET /api/suc-khoe` kiểm tra DB thật
- [ ] Vite + Tailwind 4 + alias `@` + proxy `/api`
- [ ] `shadcn init` + thêm bộ component cơ bản
- [ ] `AppShell` + `ThanhDieuHuong` tiếng Việt
- [ ] `.env.example` đủ biến + `.env` chạy được
- [ ] `npm run dev` khởi động cả 2 server
- [ ] `npm run typecheck` sạch

---

## Tiêu chí nghiệm thu

1. `npm run dev` từ thư mục gốc → API ở `127.0.0.1:3001`, web ở `localhost:5173`, không lỗi
2. Mở `localhost:5173` → AppShell tiếng Việt, 4 mục điều hướng, Tailwind áp dụng đúng
3. `curl 127.0.0.1:3001/api/suc-khoe` → `database: "da-ket-noi"`
4. Xóa `DATABASE_URL` khỏi `.env` → API **từ chối khởi động** kèm thông báo tiếng Việt rõ ràng
5. `NODE_ENV=production npm run dev:api` → **từ chối khởi động** (chốt chặn R6)
6. `npm run typecheck` không lỗi
7. Quyết định R1 (TypeScript 7 hay hạ 5.9) đã ghi lại trong file này

---

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| TS 7 không tương thích tooling | Bước 2 kiểm ngay, hạ 5.9 bằng `overrides`. Chốt trong GĐ này |
| Prisma 7 khác hoàn toàn tài liệu cũ | Chỉ bám docs Prisma 7 chính thức. Ví dụ Prisma 5/6 trên mạng **không dùng được** |
| Quên chạy `prisma generate` sau migrate | Gộp vào script `db:migrate` |
| npm workspaces + Prisma output path lẫn lộn | Đặt `output` tuyệt đối rõ ràng, thêm vào `.gitignore`, import bằng đường dẫn tương đối có `.js` |
| shadcn CLI ghi đè `index.css` mất `@import` | Kiểm lại `index.css` sau khi chạy `shadcn init` |
