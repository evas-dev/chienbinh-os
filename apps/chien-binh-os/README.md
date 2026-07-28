# CHIẾN BINH OS

Ứng dụng quản trị đội nhóm theo hướng game hoá (quân hàm, huân chương, EXP, điểm mùa)
cho công ty nhỏ (<10 người). Next.js 16 (App Router) + Supabase.

> Đây là dự án độc lập, **không liên quan** tới `apps/web` và `apps/api` trong cùng repo
> (đó là dự án "CEO quản lý công việc" dùng Vite + Express + Prisma).

## Chạy dev

```bash
npm run dev -w chien-binh-os
```

Mở http://localhost:3000. Đăng nhập bằng SĐT + mật khẩu (tài khoản demo: `0901000001` / `123456`).

## Biến môi trường

Copy `.env.example` → `.env.local`:

| Biến | Bắt buộc | Dùng để |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Kết nối Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Publishable key (an toàn để lộ) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chỉ khi tạo tài khoản mới | `auth.admin.createUser` trong Route Handler |

## Kiến trúc

- **Auth**: `@supabase/ssr`, dùng trick phone-as-email (`<sđt>@chienbinh.local`).
  `src/proxy.ts` (Next 16 đổi tên từ `middleware.ts`) refresh cookie + chặn route.
- **Đọc dữ liệu**: Server Component gọi trực tiếp Supabase (`lib/supabase/server.ts`).
- **Ghi dữ liệu**: **luôn** qua RPC `security definer` trong `supabase/migrations/`,
  gọi từ Server Action ở `lib/actions/`. RLS chặn UPDATE trực tiếp các cột nhạy cảm
  (`exp`, `season_points`, `role`, huy hiệu) để user không tự sửa được.
- **EXP là ledger**: `exp_log` là nguồn sự thật; `profiles.exp`/`season_points` chỉ là
  cache do trigger `apply_exp_log_to_profile` tính lại bằng `SUM()`. Không ghi trực tiếp.
- **Ngoại lệ duy nhất** dùng service role: `app/api/admin/create-staff/route.ts`
  (tạo user trong `auth.users` — RPC thường không có quyền).

## Database

```
supabase/schema.sql          # schema gốc, tạo 16 bảng nền — ĐỪNG XOÁ
supabase/migrations/*.sql    # bồi thêm (ALTER) + toàn bộ RPC, áp theo thứ tự số
```

`schema.sql` phải chạy trước migrations khi dựng project mới.

## Quy ước code

- Server Component mặc định; chỉ `"use client"` ở lá nhỏ nhất cần tương tác.
- Component chia theo domain tiếng Việt: `missions/`, `objectives/`, `chung/` (dùng chung)…
- Emoji trong UI render qua `components/chung/emoji-icon.tsx` (map sang icon SVG lucide),
  **không** viết emoji thô vào JSX.
- Tiêu đề khối dùng `components/chung/tieu-de-muc.tsx` để khoảng cách nhất quán.
