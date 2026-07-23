---
title: Web App Quản lý & Điều hành Công việc cấp CEO
status: pending
created: 2026-07-23
workContext: /Users/tuantoha/CEO quản lý
blockedBy: []
blocks: []
---

# Kế hoạch: Web App Quản lý & Điều hành Công việc cấp CEO

App chạy local trên Mac, giao diện 100% tiếng Việt, kiến trúc sạch để đẩy lên VPS sau.

**Thiết kế đã duyệt:** [brainstorm-260723-thiet-ke-he-thong.md](reports/brainstorm-260723-thiet-ke-he-thong.md) — đọc file này trước khi bắt đầu bất kỳ giai đoạn nào.

---

## Các giai đoạn

| GĐ | File | Nội dung | Trạng thái |
|---|---|---|---|
| 0 | [phase-00-nen-mong.md](phase-00-nen-mong.md) | Monorepo, TS, Prisma kết nối, Vite+Tailwind+shadcn, AppShell | ✅ **Xong** 23/07 |
| 1 | [phase-01-database-backend.md](phase-01-database-backend.md) | Schema 7 bảng, migration, seed, API CRUD, calculator trọng số | ⬜ Chưa bắt đầu |
| 2 | [phase-02-frontend-quan-ly.md](phase-02-frontend-quan-ly.md) | Tổng quan, công việc, cây hạng mục, đính kèm, nhân sự | ⬜ Chưa bắt đầu |
| 3 | [phase-03-bang-toi-han.md](phase-03-bang-toi-han.md) | Bảng tới hạn, 4 bộ lọc, tìm kiếm, badge cảnh báo | ⬜ Chưa bắt đầu |
| 4 | [phase-04-tich-hop-gmail.md](phase-04-tich-hop-gmail.md) | SMTP+IMAP qua App Password, gửi giao việc, quét hộp thư, hàng chờ duyệt, magic link | ⬜ Chưa bắt đầu |
| 5 | [phase-05-dong-goi-ban-giao.md](phase-05-dong-goi-ban-giao.md) | Docker, README tiếng Việt, chạy thử đầu-cuối | ⬜ Chưa bắt đầu |
| 6 | [phase-06-mo-rong.md](phase-06-mo-rong.md) | MCP server, xuất Excel, email nhắc hạn | ⬜ Chưa bắt đầu |

**Phụ thuộc:** tuần tự 0 → 1 → 2 → 3 → 4 → 5 → 6. GĐ 3 cần GĐ 1 (dữ liệu) và GĐ 2 (khung UI). GĐ 6 cần GĐ 5 (API ổn định).

**Bản đúng spec = hết GĐ 5.** GĐ 6 là mở rộng theo yêu cầu bổ sung của CEO.

---

## Phiên bản đã kiểm chứng ngày 2026-07-23

Kiểm bằng `npm view <pkg> version`. **Không dùng trí nhớ — nhiều major version đã đổi.**

| Gói | Bản | Cảnh báo breaking change |
|---|---|---|
| prisma / @prisma/client / @prisma/adapter-pg | 7.9.0 | Generator `prisma-client` (không phải `prisma-client-js`), `output` **bắt buộc**, cần `prisma.config.ts`, cần driver adapter, không tự generate/seed. **`url` bị CẤM trong schema.prisma** → đặt ở `prisma.config.ts` |
| express | 5.2.1 | Async handler tự bắt lỗi; cú pháp route đổi (`*` → `*splat`) |
| zod | 4.4.3 | `z.string().email()` → `z.email()`; API tùy biến lỗi đổi |
| tailwindcss | 4.3.3 | CSS-first, **không có `tailwind.config.js`**, dùng `@tailwindcss/vite` |
| ~~typescript 7.0.2~~ → **typescript 6.0.3** | 6.0.3 | **R1 đã chốt: hạ xuống TS 6.** TS 7 là port Go, chỉ có CLI — không `tsserver`, không compiler API. Xem chi tiết ở [phase-00](phase-00-nen-mong.md). TS 6 khai tử `baseUrl` → chỉ dùng `paths` |
| concurrently | **9.2.4** (không phải 10.x) | Bản 10 kéo theo `shell-quote` có lỗ hổng DoS mức cao |
| react / vite | 19.2.8 / 8.1.5 | |
| @tanstack/react-query | 5.101.4 | |
| nodemailer / imapflow / mailparser | 9.0.3 / 1.5.0 / 3.9.14 | Thay cho `googleapis` — dùng App Password |
| node-cron / pino | 4.6.0 / 10.3.1 | node-cron v4 đổi API so với v3 |
| shadcn (CLI) | 4.14.0 | |
| multer / exceljs / @modelcontextprotocol/sdk | 2.2.0 / 4.4.0 / 1.29.0 | |

---

## Môi trường

- Thư mục dự án trống, **chưa phải git repo** (GĐ 0 sẽ `git init`)
- Node v24.16.0 · npm 11.13.0
- PostgreSQL **17.10** (Homebrew), service `postgresql@17` đang chạy, user `tuantoha` không cần mật khẩu
- `DATABASE_URL=postgresql://tuantoha@localhost:5432/ceo_quanly?schema=public`
- Docker chưa cài — không cần cho dev, chỉ viết file cấu hình ở GĐ 5

---

## Rủi ro xuyên suốt

| Mã | Rủi ro | Xử lý |
|---|---|---|
| **R1** | TypeScript 7 (port Go) có thể chưa tương thích hết tooling | GĐ 0 kiểm ngay. Vỡ → hạ về `typescript@~5.9` bằng `overrides` trong package.json gốc. Quyết trong GĐ 0, không để trôi |
| **R2** | Prisma 7 khác xa tài liệu cũ trên mạng | Bám tài liệu chính thức Prisma 7. Mọi ví dụ Prisma 5/6 tìm được đều **không dùng được** |
| **R3** | Múi giờ sai → "còn 0 ngày" vs "quá hạn 1 ngày" | Hàm dùng chung `tinhSoNgayConLai()` trong `packages/shared`. **Quy tắc chốt: qua nửa đêm giờ VN là ngày mới** — so theo ngày lịch, bỏ qua giờ phút. Dùng `Intl` với `timeZone: 'Asia/Ho_Chi_Minh'`, không phụ thuộc múi giờ máy chủ. Test trước khi dùng |
| **R4** | ~~Token Gmail chết sau 7 ngày~~ → **đã loại bỏ** bằng App Password | Thay bằng: App Password là chìa khóa toàn quyền hộp thư → `.env` phải gitignored, GĐ 5 kiểm `git log --all -- .env`. Bắt buộc bật Xác minh 2 bước trước |
| **R5** | Tự động gửi mail → spam khi CEO sửa tới sửa lui | Dedupe theo cặp `(hangMucId, nhanSuId)` + công tắc `TU_DONG_GUI_MAIL` |
| **R6** | Không có auth mà lỡ deploy VPS | `main.ts` **từ chối khởi động** khi `NODE_ENV=production` và auth chưa bật |

---

## Nguyên tắc bất di bất dịch

1. **Không bao giờ tự tick hoàn thành** từ email — luôn tạo `DeXuatHoanThanh` chờ CEO duyệt
2. **`QUA_HAN` không lưu trong DB** — tính lúc đọc
3. **Mọi chuỗi hiển thị bằng tiếng Việt**, không sót tiếng Anh
4. **File dưới 200 dòng**, tách module khi vượt
5. **Comment tiếng Việt** ở logic nghiệp vụ quan trọng (calculator trọng số, parser email, tính ngày)
6. Sau mỗi giai đoạn: chạy compile/typecheck, không để lỗi trôi sang giai đoạn sau
7. **Trọng số tối thiểu là 1** — phép chia 0 bị khử bằng cấu trúc (DB default + Zod `min(1)`), không bằng câu lệnh `if` canh chừng
8. **Ngày Việt Nam: qua nửa đêm là ngày mới** — mọi phép tính hạn so theo ngày lịch `Asia/Ho_Chi_Minh`, không so giờ phút
