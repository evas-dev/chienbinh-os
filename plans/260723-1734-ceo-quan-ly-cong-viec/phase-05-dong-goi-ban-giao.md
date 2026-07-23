# GĐ 5 — Đóng gói & bàn giao

**Ưu tiên:** Trung bình · **Trạng thái:** ⬜ Chưa bắt đầu · **Ước lượng:** 0.5–1 ngày · **Phụ thuộc:** GĐ 0–4

Chốt bản đúng spec. Hết giai đoạn này là app dùng được thật.

**Liên kết:** [plan.md](plan.md)

---

## Mục tiêu

README tiếng Việt đủ để CEO tự chạy lại app sau khi format máy. Docker sẵn sàng cho VPS. Luồng chính đã chạy thử đầu-cuối và xác nhận hoạt động.

---

## File cần tạo

```
├── README.md                    ⭐ tiếng Việt, tài liệu chính
├── Dockerfile                   multi-stage
├── docker-compose.yml           app + postgres
├── .dockerignore
├── .env.example                 rà lại đủ biến
└── docs/
    ├── huong-dan-gmail.md       2 bước App Password + cách thu hồi
    └── trien-khai-vps.md        chi tiết deploy
```

---

## Các bước

### 1. README.md — tài liệu chính

Viết cho người **không phải lập trình viên**. Cấu trúc:

```markdown
# Quản lý & Điều hành Công việc

## Ứng dụng làm được gì
[3–5 gạch đầu dòng + ảnh chụp màn hình]

## Chạy lần đầu trên máy Mac
### Yêu cầu
- Node.js 24+  (kiểm: node -v)
- PostgreSQL 17 (kiểm: psql --version)

### Các bước
1. brew services start postgresql@17
2. createdb ceo_quanly
3. npm install
4. cp .env.example .env
5. npm run db:migrate && npm run db:generate
6. npm run db:seed
7. npm run dev
8. Mở http://localhost:5173

## Dùng hằng ngày
[Tạo công việc → thêm hạng mục → trọng số → giao việc → xem bảng tới hạn]

## Kết nối Gmail
[→ docs/huong-dan-gmail.md]

## Sao lưu dữ liệu
pg_dump ceo_quanly > sao-luu-$(date +%Y%m%d).sql
+ nhắc sao lưu cả thư mục uploads/

## Đưa lên VPS
[→ docs/trien-khai-vps.md]

## Xử lý sự cố
[Bảng: triệu chứng → nguyên nhân → cách sửa]
```

**Bảng xử lý sự cố bắt buộc có:**

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| `ECONNREFUSED :5432` | Postgres chưa chạy | `brew services start postgresql@17` |
| Từ chối khởi động, báo thiếu biến | `.env` thiếu | Đối chiếu `.env.example` |
| Không gửi được mail, báo sai xác thực | App Password sai hoặc còn dấu cách | Dán lại 16 ký tự liền nhau vào `.env` |
| Trang apppasswords không hiện tùy chọn | Chưa bật Xác minh 2 bước | Bật 2SV trước, rồi quay lại tạo |
| Mail ngừng gửi giữa ngày | Vượt ~500 mail/ngày của Gmail | Đợi sang ngày hôm sau |
| Sửa schema xong lỗi type | Quên generate | `npm run db:generate` (Prisma 7 không tự chạy) |
| Trang trắng | API chưa chạy | Xem log cửa sổ terminal `api` |

### 2. `docs/huong-dan-gmail.md`

Ngắn gọn — chỉ 2 bước, kèm ảnh chụp màn hình:

1. **Bật Xác minh 2 bước** — [myaccount.google.com/signinoptions/twosv](https://myaccount.google.com/signinoptions/twosv)
   → ⚠️ Nhấn mạnh: **bỏ qua bước này thì bước 2 không làm được**, trang App Passwords sẽ trống
2. **Tạo App Password** — [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   → Google chỉ cho vào bằng link trực tiếp, không có trong menu cài đặt
   → Dán 16 ký tự vào `.env`, **bỏ hết dấu cách**

Kèm thêm:
- Cách kiểm tra đã thành công (nút "Kiểm tra kết nối" trong Cài đặt)
- **Cách thu hồi khi nghi lộ**: quay lại trang App Passwords, bấm xóa — mật khẩu chính không bị ảnh hưởng
- Cảnh báo: App Password cho **toàn quyền hộp thư**, không được commit `.env`
- Giới hạn ~500 mail/ngày với Gmail cá nhân

### 3. `docs/trien-khai-vps.md`

- Chuẩn bị VPS (Ubuntu, Docker, domain)
- ⚠️ **BẮT BUỘC bật auth trước khi deploy** — app sẽ từ chối khởi động nếu chưa (R6). Nêu rõ đây không phải lỗi mà là chốt chặn cố ý
- Chuyển dữ liệu: `pg_dump` local → `psql` trên VPS
- Chuyển thư mục `uploads/`
- Đặt `PUBLIC_BASE_URL` để bật magic link
- Cập nhật redirect URI trong Google Cloud
- HTTPS bằng Caddy hoặc nginx + certbot

### 4. Dockerfile

Multi-stage: build shared → api → web (tĩnh) → runtime nhỏ.
- Base `node:24-alpine`
- Chạy bằng user không phải root
- `uploads/` là volume
- Healthcheck gọi `/api/suc-khoe`
- ⚠️ Prisma 7 sinh client vào `src/generated/` → phải chạy `prisma generate` **trong** stage build và copy đúng thư mục

### 5. docker-compose.yml

`app` + `postgres:17-alpine`, volume cho DB và uploads, healthcheck postgres, `depends_on` có điều kiện.
Docker **chưa cài trên máy này** → chỉ viết file, không chạy thử được. Ghi rõ trong README là chưa kiểm chứng thực tế.

### 6. Rà soát `.env.example`

Mọi biến đều có comment tiếng Việt giải thích và giá trị mẫu. Đối chiếu với `env.ts` để không sót.

### 7. Chạy thử luồng chính đầu-cuối ⭐

**Trên DB sạch hoàn toàn** (`dropdb ceo_quanly && createdb ceo_quanly`), làm đúng theo README như người dùng mới:

1. Cài đặt theo README từng bước, không dùng kiến thức ngoài
2. Tạo công việc mới
3. Thêm 3 hạng mục, 1 hạng mục có con (cấp 3)
4. Chỉnh trọng số về đúng 100%
5. Tạo nhân sự mới ngay trong combobox
6. Giao việc → kiểm mail đã gửi
7. Gắn 1 file đính kèm
8. Xem bảng tới hạn, thử cả 4 bộ lọc
9. Trả lời mail → chờ cron → kiểm đề xuất → duyệt
10. Xác nhận % lan lên đúng tận công việc

**Ghi lại mọi chỗ vướng vào README.** Nếu bước nào phải đoán → README chưa đạt.

### 8. Dọn dẹp

- Xóa `console.log` còn sót
- Rà lại: không file nào vượt 200 dòng (theo quy tắc dự án)
- Grep tìm chuỗi tiếng Anh còn sót trên UI
- Xác nhận `.gitignore` chặn `.env`, `uploads/`, `src/generated/`
- **Kiểm tra chưa từng commit `.env`** — nếu lỡ thì xoay khóa

---

## Todo

- [ ] `README.md` tiếng Việt đầy đủ + bảng xử lý sự cố
- [ ] Ảnh chụp màn hình các trang chính
- [ ] `docs/huong-dan-gmail.md` — 2 bước App Password + cách thu hồi
- [ ] `docs/trien-khai-vps.md`
- [ ] `Dockerfile` multi-stage, xử lý đúng Prisma 7 generate
- [ ] `docker-compose.yml` + `.dockerignore`
- [ ] Rà `.env.example` đủ biến, có comment tiếng Việt
- [ ] **Chạy thử đầu-cuối trên DB sạch theo đúng README**
- [ ] Ghi mọi chỗ vướng vào README
- [ ] Xóa `console.log`, rà file > 200 dòng
- [ ] Grep chuỗi tiếng Anh còn sót
- [ ] Xác nhận `.env` chưa từng bị commit
- [ ] `npm run build` thành công
- [ ] `npm run typecheck` sạch

---

## Tiêu chí nghiệm thu

1. Xóa DB, làm theo README từ đầu → app chạy, **không phải đoán bước nào**
2. Toàn bộ 10 bước luồng chính chạy thông
3. `npm run build` không lỗi
4. README có đủ: chạy local, dùng hằng ngày, Gmail, sao lưu, VPS, xử lý sự cố
5. Hướng dẫn Gmail nêu rõ **phải bật Xác minh 2 bước trước**, và cách thu hồi App Password
6. `.env.example` khớp `env.ts`, không sót biến
7. `.env` không có trong git
8. Không còn `console.log` trong mã nguồn
9. Không file nào vượt 200 dòng
10. 0 chuỗi tiếng Anh trên giao diện

---

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| README thiếu bước, CEO không chạy lại được | Chạy thử trên DB sạch, làm đúng README, không dùng kiến thức ngoài |
| Docker chưa kiểm chứng (máy chưa cài) | Ghi rõ trong README là chưa chạy thử; đánh dấu cần kiểm khi lên VPS |
| Prisma 7 generate sai đường dẫn trong Docker | Chạy generate trong stage build, copy đúng `src/generated/` |
| Lỡ commit `.env` | Kiểm `git log --all -- .env`; nếu có thì **thu hồi ngay App Password** tại [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) và tạo cái mới, đồng thời đổi `MAGIC_LINK_SECRET` |
| Ảnh chụp màn hình lỗi thời sau này | Chụp ở bước cuối cùng, sau khi UI đã chốt |
