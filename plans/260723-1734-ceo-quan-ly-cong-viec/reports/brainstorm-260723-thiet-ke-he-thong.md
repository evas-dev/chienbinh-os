# Brainstorm — Web App Quản lý & Điều hành Công việc cấp CEO

**Ngày:** 2026-07-23 · **Trạng thái:** Đã chốt thiết kế, chờ duyệt để lập kế hoạch triển khai

---

## 1. Bài toán

CEO cần một công cụ chạy local trên Mac để:
- Theo dõi khối lượng công việc, tiến độ, và cấu phần trong tiến độ
- Nhìn nhanh: việc nào sắp tới hạn, ai đang làm, hoàn thành bao nhiêu %
- Rà soát checklist sắp đến hạn theo ngày
- Tự động giao việc qua email và ghi nhận phản hồi hoàn thành

Ràng buộc: giao diện 100% tiếng Việt · dữ liệu nằm trên máy · kiến trúc phải sạch để đẩy lên VPS sau mà không viết lại.

---

## 2. Môi trường đã khảo sát

| Hạng mục | Trạng thái |
|---|---|
| Thư mục dự án | Trống (greenfield) |
| Node / npm | v24.16.0 / 11.13.0 |
| PostgreSQL | **17.10 (Homebrew), service `postgresql@17` đang chạy** |
| Kết nối DB | `psql -d postgres` OK, user `tuantoha`, không cần mật khẩu |
| Docker | Chưa cài (không cần cho dev) |

→ `DATABASE_URL=postgresql://tuantoha@localhost:5432/ceo_quanly?schema=public`

---

## 3. Bốn phản biện với spec ban đầu

### 3.1 "Đổi DATABASE_URL là chuyển SQLite → Postgres" — SAI

Prisma yêu cầu `datasource.provider` là literal string, **không nhận biến môi trường**. Nghiêm trọng hơn: `prisma/migrations/` chứa SQL sinh riêng cho từng provider — migration SQLite không chạy được trên Postgres. SQLite còn thiếu enum native, Json filtering, kiểu ngày lưu khác.

Hệ quả nếu làm theo spec: dev 3 tháng trên SQLite → lên VPS phải xóa toàn bộ migration, viết lại schema, chấp nhận rủi ro sai dữ liệu.

**→ QUYẾT ĐỊNH: Postgres từ đầu.** Chi phí = 0 vì Postgres 17 đã cài sẵn và đang chạy. Data vẫn nằm trên máy Mac. Lên VPS đúng nghĩa chỉ đổi `DATABASE_URL`.

### 3.2 Tự động đọc mail rồi tick "hoàn thành" — RỦI RO CAO

Parse tiếng Việt tự do để quyết định trạng thái sẽ sai:
- `"em chưa hoàn thành được anh ạ"` → chứa "hoàn thành"
- `"mai em hoàn thành"` → chứa "hoàn thành"

Một lần sai là CEO mất niềm tin vào toàn bộ dashboard.

**→ QUYẾT ĐỊNH: không bao giờ tự tick.** Mọi phản hồi tạo bản ghi `DeXuatHoanThanh` (hàng chờ), hiện badge trên dashboard, CEO bấm 1 nút duyệt. Điểm tin cậy chỉ dùng để sắp xếp thứ tự đọc, không dùng để tự quyết.

### 3.3 ~~OAuth Gmail cá nhân — token chết sau 7 ngày~~ → ĐÃ ĐỔI HƯỚNG

**Cập nhật 2026-07-23:** CEO chọn dùng **Google App Password** (SMTP gửi + IMAP đọc) thay cho Gmail API OAuth2. Rủi ro token 7 ngày **biến mất hoàn toàn**.

| | Gmail API OAuth2 | **App Password** (đã chọn) |
|---|---|---|
| Thiết lập | 7 bước Google Cloud + PUBLISH APP | **2 bước, ~2 phút** |
| Token hết hạn | 7 ngày nếu quên publish | **Không bao giờ** |
| Thư viện | `googleapis` | `nodemailer` + `imapflow` |
| Code | OAuth flow, 4 endpoint, refresh token, mã hóa AES | Chỉ cấu hình kết nối |

**Đánh đổi phải chấp nhận:**
- App Password là **chìa khóa toàn quyền hộp thư** — lộ `.env` là mất cả hòm mail, không thu hồi từng phần như OAuth scope. Bù lại thu hồi 1 click, không ảnh hưởng mật khẩu chính
- **Bắt buộc bật Xác minh 2 bước trước** — chưa bật thì trang `apppasswords` trống
- Gmail cá nhân giới hạn **~500 mail/ngày**
- Giữ interface `NhaCungCapMail` để sau lắp lại OAuth mà không đụng nghiệp vụ

**Chống xử lý mail trùng đổi theo:** không dùng nhãn Gmail nữa (đó là cơ chế của Gmail API), thay bằng **2 lớp**: cửa sổ UID của IMAP (rẻ) + ràng buộc `messageId @unique` trong DB (đảm bảo đúng đắn tuyệt đối). Thực tế chắc hơn cách cũ.

### 3.4 Spec không có đăng nhập

Local thì không sao. Lên VPS là dữ liệu nhân sự + email công ty phơi ra internet.

**→ QUYẾT ĐỊNH của CEO: không auth, chỉ chạy local.** Giảm hại miễn phí:
- Server bind `127.0.0.1` (không phải `0.0.0.0`) — máy khác trong LAN không vào được
- Mọi route đi qua `authMiddleware` no-op → bật auth sau chỉ thay 1 file
- `main.ts` **từ chối khởi động** nếu `NODE_ENV=production` mà auth chưa bật

---

## 4. Quyết định đã chốt

| # | Vấn đề | Lựa chọn | Lý do |
|---|---|---|---|
| 1 | Database | **Postgres cả local lẫn VPS** | Đã cài sẵn, chi phí 0, loại bỏ hoàn toàn rủi ro chuyển đổi |
| 2 | Tài khoản mail | **Gmail cá nhân + App Password** (SMTP+IMAP) | Đơn giản hơn OAuth nhiều; token không bao giờ hết hạn |
| 3 | Xác nhận hoàn thành | **Cả magic link lẫn reply**, bật/tắt qua `PUBLIC_BASE_URL` | Local dùng reply + duyệt tay; lên VPS magic link tự bật, không sửa code |
| 4 | Đăng nhập | **Không auth**, chạy local | CEO quyết; có chốt chặn không cho deploy production |
| 5 | Tính % | **Trọng số WBS**: `%cha = Σ(trongSo×%)/Σ(trongSo)`, trọng số tối thiểu **1** | Chuẩn ngành dự án; sàn 1 khiến phép chia 0 không thể xảy ra về mặt cấu trúc |
| 6 | Ngưỡng cảnh báo vàng | **Cấu hình được**, mặc định 3 ngày | Lưu trong bảng `CauHinh`, sửa ở màn hình Cài đặt |
| 7 | Gửi mail giao việc | **Tự động ngay khi giao** | Theo yêu cầu CEO; có dedupe + công tắc tổng |
| 8 | Backend framework | **Express + Zod** (không NestJS) | DI/decorator là chi phí thừa ở quy mô này |
| 9 | Monorepo | **npm workspaces** (không pnpm/turbo) | YAGNI; Zod schema dùng chung FE↔BE |
| 10 | Độ sâu cây hạng mục | **2–3 cấp** | UI mặc định mở hết, bỏ toàn bộ logic gập/breadcrumb |
| 11 | Phạm vi | **Spec gốc GĐ 0–5, mở rộng GĐ 6** | CEO chọn cả "làm đúng spec trước" lẫn 3 tính năng thêm |
| 12 | Giao diện cho agent | **MCP server (GĐ 6)** | CEO muốn hỏi/tạo việc bằng ngôn ngữ tự nhiên qua Claude |

---

## 5. Cấu trúc thư mục

```
ceo-quanly/
├── package.json                 workspaces + script dev chạy song song FE/BE
├── .env.example  .gitignore  README.md
├── Dockerfile  docker-compose.yml        (cho VPS, không dùng khi dev)
│
├── packages/shared/src/
│   ├── schemas/                 cong-viec | hang-muc | nhan-su | bang-toi-han .schema.ts
│   ├── types/                   type suy ra từ Zod (z.infer)
│   └── constants/               muc-do-uu-tien.ts, trang-thai.ts  (nhãn tiếng Việt)
│
├── apps/api/
│   ├── prisma/                  schema.prisma · migrations/ · seed.ts
│   ├── uploads/                 file đính kèm — gitignored
│   └── src/
│       ├── main.ts              bootstrap, bind 127.0.0.1
│       ├── config/env.ts        validate env bằng Zod, sai là chết lúc khởi động
│       ├── lib/                 prisma.ts (singleton) · logger.ts (pino) · errors.ts
│       ├── middleware/          auth (no-op) · validate · error-handler
│       ├── modules/
│       │   ├── nhan-su/         routes · controller · service · repository
│       │   ├── cong-viec/       (nt)
│       │   ├── hang-muc/        (nt) + tien-do.calculator.ts   ← rollup trọng số
│       │   ├── tep-dinh-kem/    + storage/{interface, local, s3-sau-nay}
│       │   ├── bang-toi-han/    read-model, 1 query phẳng tối ưu
│       │   ├── email/           providers/{mail.interface, gmail-oauth, smtp-imap}
│       │   │                    templates/ · ma-tham-chieu.ts · phan-tich-phan-hoi.ts
│       │   ├── de-xuat/         hàng chờ CEO duyệt
│       │   └── xac-nhan/        magic link công khai + token HMAC
│       └── jobs/                scheduler.ts (node-cron) · quet-hop-thu.job.ts
│
└── apps/web/src/
    ├── lib/                     api-client.ts · ngay-thang.ts (date-fns locale vi)
    ├── components/
    │   ├── ui/                  shadcn primitives
    │   ├── layout/              AppShell · ThanhDieuHuong
    │   ├── cong-viec/           DanhSachCongViec · TheCongViec · FormCongViec
    │   ├── hang-muc/            CayHangMuc (đệ quy) · NodeHangMuc · NganKeoChiTiet
    │   │                        ThanhTrongSo (hiện tổng trọng số anh em)
    │   ├── nhan-su/             BangNhanSu · ChonNhanSu (combobox + tạo nhanh)
    │   └── bang-toi-han/        BangToiHan · BoLoc · HuyHieuConLai
    ├── hooks/                   use-cong-viec · use-hang-muc · use-bang-toi-han
    └── pages/                   TongQuan · ChiTietCongViec · NhanSu · CaiDat
```

**Stack:** React 19 + Vite + TS · Tailwind + shadcn/ui · TanStack Query (server state, không Redux) · Express + Zod + Prisma · pino · node-cron · **nodemailer + imapflow + mailparser**

---

## 6. Sơ đồ cơ sở dữ liệu (7 bảng)

### `NhanSu` — danh bạ nội bộ
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id `PK` | String cuid | |
| hoTen | String | |
| email | String **unique** `IX` | khóa đối chiếu khi quét mail |
| soDienThoai? · chucVu? · ghiChu? | String | |
| dangHoatDong | Boolean = true | nghỉ việc → tắt cờ, **không xóa** (giữ lịch sử) |
| createdAt · updatedAt | DateTime | |

### `CongViec` — công việc lớn
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id `PK` · ma **unique** | String | `ma` = `CV-0001`, tự sinh |
| ten · moTa? | String | |
| ngayBatDau · ngayKetThucDuKien | DateTime | |
| mucDoUuTien | enum `CAO\|TRUNG_BINH\|THAP` | |
| trangThai | enum `CHUA_BAT_DAU\|DANG_LAM\|TAM_DUNG\|HOAN_THANH\|HUY` | |
| phanTramHoanThanh | Int = 0 | **cache**, tính từ hạng mục gốc theo trọng số |

### `HangMuc` — cây phân cấp tự tham chiếu ⭐
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id `PK` · ma **unique** | String | `ma` = `HM-0042` → **nhúng vào tiêu đề email** |
| congViecId `FK→CongViec` `IX` | | onDelete Cascade |
| hangMucChaId? `FK→HangMuc` `IX` | | **self-relation** → cây nhiều cấp tùy ý |
| ten · ghiChu? | String | |
| hanHoanThanh? | DateTime `IX` | **xương sống của bảng tới hạn** |
| thuTu | Int | thứ tự tuần tự giữa các anh em |
| **trongSo** | Int = 0 | **trọng số trong nhóm anh em** |
| loaiTienDo | enum `CHECKBOX\|PHAN_TRAM` | |
| phanTramHoanThanh | Int = 0 | lá: nhập tay · cha: tính tự động, chỉ đọc |
| daHoanThanh · hoanThanhLuc? | Boolean · DateTime | |
| hoanThanhBoiId? `FK→NhanSu` | | "ai đã hoàn thành" |
| nguoiPhuTrachId? `FK→NhanSu` `IX` | | |
| trangThai | enum `CHUA_BAT_DAU\|DANG_LAM\|CHO_XAC_NHAN\|HOAN_THANH` | |

> ⚠️ **`QUA_HAN` KHÔNG lưu trong DB.** Là hàm của thời gian hiện tại — lưu sẽ ôi thiu ngay hôm sau. Tính lúc đọc: `hanHoanThanh < now() AND NOT daHoanThanh`.

### `TepDinhKem`
`id` · `hangMucId FK` · `tenGoc` (tên gốc tiếng Việt, để hiển thị) · `tenLuu` (uuid+ext — **chống path traversal và trùng tên**) · `duongDan` (**tương đối**, copy sang máy khác vẫn chạy) · `kichThuoc` · `loaiMime` · `taiLenLuc`

### `NhatKyEmail`
`id` · `hangMucId? FK` · `huong` enum `GUI_DI|NHAN_VE` · `diaChiEmail` · `tieuDe` · `noiDung` Text · `messageId?` **unique** (Gmail id → chống xử lý trùng) · `threadId?` · `trangThai` enum `CHO_GUI|DA_GUI|LOI` · `loiChiTiet?` · `createdAt`

### `DeXuatHoanThanh` — hàng chờ CEO duyệt ⭐
`id` · `hangMucId FK` · `nguonGoc` enum `EMAIL_REPLY|MAGIC_LINK` · `nhatKyEmailId? FK` · `nguoiDeXuatEmail` · `trichDan?` (đoạn text làm bằng chứng để CEO đọc) · `doTinCay` Int 0–100 · `trangThai` enum `CHO_DUYET|DA_DUYET|TU_CHOI` · `duyetLuc?`

### `CauHinh` — key-value
`khoa PK` · `giaTri` Text · `capNhatLuc`

Chứa: `NGUONG_CANH_BAO_VANG` (mặc định 3) · `TU_DONG_GUI_MAIL` · `BAT_CRON_QUET_MAIL` · `CHU_KY_QUET_PHUT` · `IMAP_LAST_UID` · `IMAP_UID_VALIDITY` · `EMAIL_LOI_GAN_NHAT` · `LAN_QUET_CUOI`

> Thông tin đăng nhập Gmail (`GMAIL_DIA_CHI`, `GMAIL_APP_PASSWORD`) nằm trong **`.env`**, không lưu DB — đúng như spec yêu cầu và bỏ được cả module mã hóa AES.

---

## 7. Công thức tính tiến độ (trọng số WBS)

```
Lá  CHECKBOX   →  0 hoặc 100
Lá  PHAN_TRAM  →  nhập tay 0..100

Nút cha        →  Σ(trongSo_i × phanTram_i) / Σ(trongSo_i)
CongViec       →  áp dụng công thức trên cho các hạng mục gốc
```

**Ví dụ:**
```
Công việc "Xây nhà xưởng" = 100%
├── Móng          trọng số 30  ·  tiến độ 100%  →  30.0
├── Thân          trọng số 50  ·  tiến độ  40%  →  20.0
└── Hoàn thiện    trọng số 20  ·  tiến độ   0%  →   0.0
                                    Tổng = 50.0 / 100 = 50%
```

**Chia cho tổng trọng số THỰC TẾ, không chia cứng 100.** Nếu tổng = 95 hoặc 110, kết quả vẫn đúng tỷ lệ, công thức không bao giờ vỡ.

**Quy tắc UI:**
- Thêm hạng mục con mới → **tự chia đều lại** toàn nhóm anh em (3 con → 33/33/34)
- Thanh trạng thái: `Tổng trọng số: 100% ✓` hoặc `95% ⚠ thiếu 5%`
- **Cảnh báo nhưng không chặn lưu** — CEO tự chịu trách nhiệm con số của mình
- % của nút cha là **chỉ đọc** trên UI

**Thực thi:** ghi 1 chỗ → chạy ngược lên cây cập nhật toàn bộ tổ tiên trong **1 transaction**.

---

## 8. Danh sách API endpoint

```
GET    /api/suc-khoe

── Nhân sự ────────────────────────────────────────
GET    /api/nhan-su                    ?q=&dangHoatDong=
POST   /api/nhan-su
GET    /api/nhan-su/:id
PATCH  /api/nhan-su/:id
DELETE /api/nhan-su/:id                → tắt cờ, không xóa cứng

── Công việc ──────────────────────────────────────
GET    /api/cong-viec                  ?trangThai=&uuTien=&q=&sapXep=
POST   /api/cong-viec
GET    /api/cong-viec/:id              kèm CẢ cây hạng mục
PATCH  /api/cong-viec/:id
DELETE /api/cong-viec/:id

── Hạng mục ───────────────────────────────────────
POST   /api/hang-muc                   body: congViecId, hangMucChaId? (rỗng = gốc)
GET    /api/hang-muc/:id               kèm tệp + nhật ký email + đề xuất
PATCH  /api/hang-muc/:id
DELETE /api/hang-muc/:id               cascade xuống con
PATCH  /api/hang-muc/:id/tien-do       { phanTram } | { daHoanThanh }  → rollup
PATCH  /api/hang-muc/:id/phu-trach     { nguoiPhuTrachId }  → tự gửi mail
POST   /api/hang-muc/sap-xep-lai       [{id, thuTu, hangMucChaId}]  ← kéo thả
PATCH  /api/hang-muc/trong-so          [{id, trongSo}]  ← chỉnh trọng số cả nhóm

── Tệp đính kèm ───────────────────────────────────
POST   /api/hang-muc/:id/tep           multipart
GET    /api/tep/:id/tai-ve
DELETE /api/tep/:id

── Bảng tới hạn (read model) ──────────────────────
GET    /api/bang-toi-han
       ?tuNgay=&denNgay=&nhanSuId=&congViecId=&trangThai=&q=&trang=&soDong=
       → [{ maHangMuc, tenHangMuc, tenCongViec, hanHoanThanh, soNgayConLai,
            mucCanhBao: QUA_HAN|SAP_TOI|BINH_THUONG,
            nguoiPhuTrach{hoTen,email,soDienThoai},
            phanTram, trangThai, hoanThanhBoi, ghiChu }]

── Email ──────────────────────────────────────────
GET    /api/email/trang-thai           đã nối chưa · lần quét cuối · số mail xử lý
GET    /api/email/oauth/bat-dau        → redirect Google
GET    /api/email/oauth/callback       nhận code → mã hóa & lưu refresh token
POST   /api/email/ngat-ket-noi
POST   /api/email/gui-giao-viec        { hangMucId }  gửi lại thủ công
POST   /api/email/quet-ngay            quét ngay, không đợi cron
GET    /api/email/nhat-ky              ?hangMucId=

── Đề xuất hoàn thành ─────────────────────────────
GET    /api/de-xuat                    ?trangThai=CHO_DUYET
POST   /api/de-xuat/:id/duyet          → tick hạng mục + rollup
POST   /api/de-xuat/:id/tu-choi

── Xác nhận công khai (KHÔNG qua middleware nội bộ) ─
GET    /xac-nhan/:token                trang HTML tiếng Việt
POST   /xac-nhan/:token                thực thi hoàn thành

── Cấu hình ───────────────────────────────────────
GET    /api/cau-hinh   ·   PATCH /api/cau-hinh
```

---

## 9. Cơ chế Gmail

### Gửi
Tiêu đề luôn nhúng mã tham chiếu:
```
[HM-0042] Giao việc: Hoàn thiện hồ sơ thầu
```
Gmail giữ nguyên `Re: ... [HM-0042]` khi nhân viên trả lời → parse lại bằng regex.

**Tự động gửi ngay khi giao việc** (theo quyết định CEO), kèm 2 chốt an toàn:
1. **Dedupe** — không gửi lại nếu đã từng gửi mail giao việc cho đúng cặp `(hangMucId, nhanSuId)`
2. **Công tắc tổng** `TU_DONG_GUI_MAIL` trong Cài đặt, tắt khi nhập liệu hàng loạt / chạy seed

### Đọc — IMAP, chống trùng bằng 2 lớp

**Lớp 1 — cửa sổ UID** (rẻ, tránh quét lại nghìn mail cũ). Lưu `IMAP_LAST_UID` + `IMAP_UID_VALIDITY` trong `CauHinh`:
```
search({ uid: `${lastUid + 1}:*`, since: cachDay30Ngay })
```

**Lớp 2 — `messageId @unique`** (đảm bảo đúng đắn tuyệt đối). Ghi trùng → Prisma ném `P2002` → bỏ qua.

Idempotent tuyệt đối: cron chạy trùng, app restart giữa chừng, mạng rớt, thậm chí Gmail reset `uidValidity` — không bao giờ xử lý lặp. Lớp 2 một mình đã đủ đúng; lớp 1 chỉ để nhanh.

### Nhận diện phản hồi = 2 yếu tố bắt buộc
Email người gửi khớp `NhanSu.email` **VÀ** mã `[HM-xxxx]` có trong tiêu đề.
Thiếu một trong hai → chỉ ghi nhật ký, **không** tạo đề xuất.

### Chấm điểm tin cậy tiếng Việt (`phan-tich-phan-hoi.ts`)
```
+  "đã hoàn thành" "đã xong" "xong rồi" "hoàn tất" "done" "đã gửi"
−  phủ định / tương lai đứng gần:
   "chưa" "sẽ" "sắp" "đang" "chuẩn bị" "cố gắng" "chậm"
```
`"em chưa hoàn thành"` và `"mai em hoàn thành"` bị đánh tụt điểm mạnh.

**Dù 100 điểm vẫn KHÔNG tự tick** → luôn vào `DeXuatHoanThanh`, hiện badge số trên dashboard, CEO bấm 1 nút duyệt. Điểm chỉ dùng để sắp xếp thứ tự đọc.

### Magic link
Bật khi `PUBLIC_BASE_URL` có giá trị. Token = `HMAC-SHA256(hangMucId + hanSuDung, SECRET)`, hết hạn 30 ngày, dùng 1 lần.

Chạy local → biến rỗng → email chỉ có hướng dẫn *"trả lời mail này"*, không có link chết.
Lên VPS hoặc bật `cloudflared tunnel` → set biến → link xuất hiện, **không sửa dòng code nào**.

---

## 10. Lộ trình 6 giai đoạn

| GĐ | Nội dung | Đầu ra kiểm chứng được |
|---|---|---|
| **0** | Monorepo, TS config, env validate, Prisma connect, Vite+Tailwind+shadcn, AppShell | `npm run dev` → 2 server sống, trang chủ tiếng Việt |
| **1** | schema.prisma + migration + seed · module nhan-su/cong-viec/hang-muc · calculator trọng số · upload file · error handler | Toàn bộ API CRUD chạy, có dữ liệu mẫu |
| **2** | Trang Tổng quan · danh sách + form công việc · **cây hạng mục đệ quy + thanh trọng số** · ngăn kéo chi tiết + đính kèm · màn hình nhân sự + combobox tạo nhanh | Tạo việc → thêm hạng mục lồng → chỉnh trọng số → giao người → gắn file, toàn bộ trên UI |
| **3** | Bảng tới hạn: query tối ưu, bộ lọc, tìm kiếm, badge đỏ/vàng theo ngưỡng cấu hình | Bảng dưới dashboard chạy đủ 4 bộ lọc + tìm kiếm |
| **4** | SMTP+IMAP qua App Password · template giao việc · tự động gửi + dedupe · cron quét · parser + hàng chờ duyệt · magic link · nhật ký email | Giao việc → mail tới → trả lời → badge duyệt hiện |
| **5** | Dockerfile + compose · README tiếng Việt · chạy thử luồng chính đầu-cuối | Bàn giao bản đúng spec |
| **6** | **Mở rộng:** MCP server · xuất Excel bảng tới hạn · email nhắc deadline tự động | Hỏi Claude "tuần này có gì gấp?" ra kết quả thật |

---

## 10b. Giai đoạn 6 — chi tiết mở rộng

### 10b.1 MCP Server (`apps/mcp/`)

Cho phép CEO điều khiển app bằng ngôn ngữ tự nhiên qua Claude Desktop / Claude Code.

**Kiến trúc:** transport `stdio`, **gọi vào REST API** (không gọi thẳng service layer). Lý do: một nguồn validation duy nhất, và chạy được cả khi app đã lên VPS chỉ bằng đổi `API_BASE_URL`.

**Bộ công cụ (tên tiếng Việt để Claude gọi tự nhiên):**

| Tool | Loại | Công dụng |
|---|---|---|
| `bang_toi_han` | đọc | *"Tuần này có gì sắp tới hạn?"* — trả bảng đã lọc |
| `liet_ke_cong_viec` | đọc | Danh sách công việc + % + trạng thái |
| `chi_tiet_cong_viec` | đọc | Cả cây hạng mục kèm trọng số và tiến độ |
| `khoi_luong_nhan_su` | đọc | *"Anh Tuấn đang gánh bao nhiêu việc?"* — tổng hợp theo người |
| `tim_nhan_su` | đọc | Tra danh bạ |
| `tao_cong_viec` | **ghi** | Tạo công việc mới |
| `tao_hang_muc` | **ghi** | Tạo hạng mục (có cha, trọng số, hạn, người phụ trách) |
| `cap_nhat_tien_do` | **ghi** | Cập nhật % hoặc tick hoàn thành |
| `tao_nhan_su` | **ghi** | Thêm nhân sự mới |

**An toàn:** biến `MCP_CHO_PHEP_GHI` (mặc định `true` cho local). Khi tắt, chỉ còn 5 tool đọc — dùng khi muốn agent chỉ báo cáo, không sửa dữ liệu. Tool `tao_hang_muc` **không** kích hoạt gửi mail tự động (tránh agent lỡ bắn mail hàng loạt); phải gọi `POST /api/email/gui-giao-viec` riêng.

### 10b.2 Xuất Excel bảng tới hạn
Nút *"Xuất Excel"* trên bảng tới hạn, **giữ nguyên bộ lọc đang áp dụng**. Dùng `exceljs`, sinh phía backend, header tiếng Việt, tô màu đỏ/vàng giống trên web. Endpoint: `GET /api/bang-toi-han/xuat-excel` (cùng query params).

### 10b.3 Email nhắc deadline tự động
Cron riêng, tái sử dụng toàn bộ tầng email đã có.

| Mốc | Hành động |
|---|---|
| Trước hạn N ngày (N = `NGUONG_CANH_BAO_VANG`) | Gửi nhắc nhẹ cho người phụ trách |
| Đúng ngày tới hạn | Gửi nhắc |
| Quá hạn | Gửi mỗi 3 ngày, tối đa 3 lần rồi dừng |

Chống spam: bảng `NhatKyNhacHan(hangMucId, mocNhac, guiLuc)` — mỗi mốc chỉ gửi đúng 1 lần. Công tắc `BAT_NHAC_HAN` trong Cài đặt, mặc định **tắt** để bạn bật khi đã tin tưởng.

---

## 11. Rủi ro & giảm thiểu

| Rủi ro | Mức | Xử lý |
|---|---|---|
| Chưa bật Xác minh 2 bước → không tạo được App Password | **Cao** | README ghi rõ đây là bước 1 bắt buộc, kèm link trực tiếp |
| Lộ `.env` = mất toàn quyền hộp thư | **Cao** | `.gitignore` từ GĐ 0; GĐ 5 kiểm `git log --all -- .env`; hướng dẫn thu hồi 1 click |
| Dán App Password còn dấu cách | **Cao** | Zod kiểm đúng 16 ký tự, lỗi tiếng Việt chỉ rõ nguyên nhân |
| Múi giờ: "còn 0 ngày" hay "quá hạn 1 ngày"? | **Cao** | Lưu UTC; mọi phép tính "số ngày còn lại" quy về `Asia/Ho_Chi_Minh`, so sánh theo **ranh giới ngày** không phải theo giờ |
| Tự động gửi mail → spam khi sửa tới sửa lui | **Trung bình** | Dedupe theo cặp `(hangMucId, nhanSuId)` + công tắc `TU_DONG_GUI_MAIL` |
| Tổng trọng số ≠ 100 → % sai | Trung bình | Công thức chia cho tổng thực tế; UI cảnh báo vàng nhưng không chặn |
| Xóa công việc → cascade mất hạng mục + file | Trung bình | Dialog đếm rõ "sẽ xóa 12 hạng mục, 5 tệp"; file chuyển vào `uploads/.thung-rac/` |
| Không auth mà lỡ deploy VPS | Trung bình | `main.ts` từ chối khởi động nếu `NODE_ENV=production` và auth chưa bật |
| Cây quá sâu → UI rối | Thấp | Mặc định gập từ cấp 3; quy mô dữ liệu này không có vấn đề hiệu năng |

---

## 12. Tiêu chí nghiệm thu

- [ ] `npm run dev` khởi động được ngay, không cần Docker
- [ ] Seed sẵn vài công việc / hạng mục / nhân sự → mở trình duyệt là thấy giao diện có dữ liệu
- [ ] Luồng chính chạy đầu-cuối: tạo công việc → thêm hạng mục lồng nhiều cấp → chỉnh trọng số → giao nhân sự → mail tự gửi → xem bảng tới hạn
- [ ] % cha tính đúng theo trọng số, cập nhật tức thì khi sửa con
- [ ] Bảng tới hạn sắp xếp gần deadline lên đầu, tô đỏ quá hạn / vàng sắp tới hạn theo ngưỡng cấu hình
- [ ] 4 bộ lọc (ngày, nhân sự, công việc, trạng thái) + ô tìm kiếm hoạt động
- [ ] Trả lời email có `[HM-xxxx]` → xuất hiện đề xuất chờ duyệt, KHÔNG tự tick
- [ ] 100% giao diện tiếng Việt, không sót chuỗi tiếng Anh
- [ ] `.env.example` đủ biến · README hướng dẫn chạy local, tạo App Password từng bước, deploy VPS

---

## 13. Câu hỏi còn mở

Đã giải quyết trong buổi brainstorm:
- ~~Độ sâu cây hạng mục~~ → **2–3 cấp**, UI mở hết mặc định
- ~~Xuất Excel~~ → **có**, giai đoạn 6
- ~~Nhắc deadline tự động~~ → **có**, giai đoạn 6, mặc định tắt

Còn lại, quyết sau khi chạy thật:
- MCP server có cần tool ghi không, hay chỉ đọc cho an toàn? (mặc định bật ghi, có công tắc)
- Có cần lưu lịch sử thay đổi tiến độ (audit log) để biết ai sửa % lúc nào?
- Khi lên VPS: dùng Cloudflare Tunnel hay mở cổng + domain thật?
