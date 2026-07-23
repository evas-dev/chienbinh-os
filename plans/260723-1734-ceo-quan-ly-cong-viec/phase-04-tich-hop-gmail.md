# GĐ 4 — Tích hợp Gmail (SMTP + IMAP qua App Password)

**Ưu tiên:** Cao · **Trạng thái:** ⬜ Chưa bắt đầu · **Ước lượng:** 1.5–2 ngày · **Phụ thuộc:** GĐ 1, GĐ 2, GĐ 3

**Đã đổi hướng:** dùng **Google App Password** (SMTP gửi + IMAP đọc) thay cho Gmail API OAuth2.

**Liên kết:** [plan.md](plan.md) · [Thiết kế mục 9](reports/brainstorm-260723-thiet-ke-he-thong.md)

---

## Mục tiêu

Giao việc → nhân viên nhận mail → trả lời → đề xuất hoàn thành hiện trên dashboard chờ CEO duyệt.

---

## Nguyên tắc không được vi phạm

> **App KHÔNG BAO GIỜ tự tick hoàn thành từ email.**

Mọi phản hồi tạo bản ghi `DeXuatHoanThanh`, CEO bấm 1 nút duyệt. Điểm tin cậy chỉ dùng để **sắp xếp thứ tự đọc**, không dùng để tự quyết. Lý do: parse tiếng Việt tự do sẽ sai (`"em chưa hoàn thành"`, `"mai em hoàn thành"`), và sai một lần là mất niềm tin vào cả dashboard.

---

## Vì sao đổi từ Gmail API sang App Password

| | Gmail API OAuth2 | **App Password** (đã chọn) |
|---|---|---|
| Thiết lập | 7 bước Google Cloud + PUBLISH APP | **2 bước, ~2 phút** |
| Token hết hạn | 7 ngày nếu quên publish | **Không bao giờ** |
| Cảnh báo "unverified app" | Có | Không |
| Thư viện | `googleapis` (nặng) | `nodemailer` + `imapflow` |
| Code phải viết | OAuth flow, 4 endpoint, refresh token, module mã hóa AES | Chỉ cấu hình kết nối |

**Rủi ro mới phải chấp nhận:**
- App Password là **chìa khóa toàn quyền hộp thư** — lộ `.env` là mất cả hòm mail, không thu hồi từng phần như OAuth scope. Bù lại: thu hồi 1 click tại trang App Passwords, không ảnh hưởng mật khẩu chính.
- **Bắt buộc bật Xác minh 2 bước trước.** Chưa bật thì trang `apppasswords` không hiện tùy chọn nào.
- Gmail SMTP giới hạn **~500 mail/ngày** với tài khoản cá nhân.
- Google có thể siết App Password trong tương lai → giữ interface `NhaCungCapMail` để lắp lại OAuth mà không sửa nghiệp vụ.

---

## Chuẩn bị thủ công (CEO làm, 2 phút)

1. Bật **Xác minh 2 bước**: [myaccount.google.com/signinoptions/twosv](https://myaccount.google.com/signinoptions/twosv)
   → ⚠️ Không bật bước này thì bước 2 sẽ không có tùy chọn nào để bấm
2. Tạo App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   → Đặt tên `CEO Quan Ly` → Google trả về **16 ký tự** dạng `abcd efgh ijkl mnop`
3. Chép vào `.env` (**bỏ hết dấu cách**):
```bash
GMAIL_DIA_CHI=email-cua-anh@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

> `.env` đã nằm trong `.gitignore` từ GĐ 0. **Tuyệt đối không commit.** Nếu lỡ commit → vào lại trang App Passwords thu hồi và tạo cái mới.

---

## File cần tạo

```
apps/api/src/
├── modules/
│   ├── cau-hinh/{routes,controller,service}.ts
│   ├── email/
│   │   ├── providers/
│   │   │   ├── mail.interface.ts             trừu tượng NhaCungCapMail
│   │   │   └── gmail-smtp-imap.provider.ts   nodemailer + imapflow
│   │   ├── templates/giao-viec.template.ts   HTML tiếng Việt
│   │   ├── ma-tham-chieu.ts                  sinh/parse [HM-0042]
│   │   ├── phan-tich-phan-hoi.ts             ⭐ chấm điểm tiếng Việt
│   │   ├── phan-tich-phan-hoi.test.ts        ⭐ viết TRƯỚC
│   │   ├── email.service.ts
│   │   └── email.routes.ts
│   ├── de-xuat/{routes,controller,service}.ts
│   └── xac-nhan/
│       ├── xac-nhan.routes.ts                công khai, KHÔNG qua middleware nội bộ
│       ├── token.service.ts                  HMAC ký/xác minh
│       └── trang-cam-on.ts                   HTML tiếng Việt trả cho nhân viên
└── jobs/
    ├── scheduler.ts                          node-cron v4
    └── quet-hop-thu.job.ts

apps/web/src/
├── components/
│   ├── email/
│   │   ├── KhungNhatKyEmail.tsx              gắn vào NganKeoChiTiet (GĐ 2)
│   │   └── TrangThaiKetNoiEmail.tsx          cảnh báo đỏ khi sai mật khẩu
│   └── de-xuat/
│       ├── HuyHieuDeXuat.tsx                 badge số trên thanh điều hướng
│       └── DanhSachDeXuat.tsx                hàng chờ duyệt
└── pages/CaiDat.tsx                          bổ sung phần email
```

**Không còn cần** (so với hướng OAuth): `lib/ma-hoa.ts`, `gmail-oauth.provider.ts`, 4 endpoint OAuth, gói `googleapis`.

---

## Thư viện

```bash
npm i -w @ceo/api nodemailer imapflow mailparser
npm i -D -w @ceo/api @types/nodemailer @types/mailparser
```
`nodemailer@9.0.3` · `imapflow@1.5.0` · `mailparser@3.9.14`

---

## Các bước

### 1. Biến môi trường

Bổ sung vào `config/env.ts` (Zod 4, fail-fast):
```ts
GMAIL_DIA_CHI: z.email(),
GMAIL_APP_PASSWORD: z.string().length(16, 'App Password phải đúng 16 ký tự, bỏ hết dấu cách'),
MAGIC_LINK_SECRET: z.string().min(32),
PUBLIC_BASE_URL: z.string().optional(),   // rỗng = tắt magic link
```

Thông báo lỗi bằng tiếng Việt để CEO tự sửa được — dán nhầm cả dấu cách là lỗi phổ biến nhất.

### 2. Trừu tượng hóa nhà cung cấp mail

Giữ interface này **kể cả khi chỉ có một implementation** — đây là bảo hiểm để sau lắp lại OAuth mà không đụng vào nghiệp vụ:

```ts
export interface NhaCungCapMail {
  gui(mail: { den: string; tieuDe: string; noiDungHtml: string }): Promise<{ messageId: string }>;
  docMailMoi(tuUid: number): Promise<MailNhanVe[]>;
  kiemTraKetNoi(): Promise<{ ok: boolean; loi?: string }>;
}
```

### 3. Gửi mail qua SMTP

```ts
// Dùng host tường minh thay vì service:'gmail' — dễ đoán hơn và
// đổi sang SMTP khác (Workspace, SendGrid) chỉ cần sửa 2 dòng.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: env.GMAIL_DIA_CHI, pass: env.GMAIL_APP_PASSWORD },
});
```

Kiểm kết nối lúc khởi động bằng `transporter.verify()` — sai mật khẩu thì biết ngay, không đợi tới lúc giao việc mới phát hiện.

### 4. Mã tham chiếu

`ma-tham-chieu.ts`:
```ts
export function nhungMa(ma: string, tieuDe: string): string  // "[HM-0042] Giao việc: ..."
export function trichMa(tieuDe: string): string | null       // khớp cả "Re:", "Fwd:", "RE:"
```
Regex `/\[(HM-\d{4,})\]/i`. Gmail giữ nguyên tiêu đề khi trả lời → luôn trích lại được.

### 5. Template + gửi giao việc

`giao-viec.template.ts` — HTML tiếng Việt, đơn giản, hiển thị tốt trên điện thoại:
- Tên công việc + tên hạng mục
- **Hạn hoàn thành** (in đậm, `25/07/2026`)
- Mô tả / ghi chú, trọng số, tiến độ hiện tại
- **Hướng dẫn xác nhận**:
  - Có `PUBLIC_BASE_URL` → nút *"Xác nhận đã hoàn thành"* (magic link)
  - Không có → *"Trả lời email này với nội dung 'đã hoàn thành' khi xong."*

**Tự động gửi ngay khi giao việc** (quyết định của CEO), kèm 2 chốt chặn:
```ts
// Chốt 1: không gửi lại nếu đã từng gửi cho đúng cặp này.
// Tránh spam khi CEO sửa đi sửa lại người phụ trách.
const daGui = await tx.nhatKyEmail.findFirst({
  where: { hangMucId, diaChiEmail: nhanSu.email, huong: 'GUI_DI', trangThai: 'DA_GUI' },
});
if (daGui) return;

// Chốt 2: công tắc tổng, tắt khi nhập liệu hàng loạt hoặc chạy seed.
if (!cauHinh.TU_DONG_GUI_MAIL) return;
```

Gửi **bất đồng bộ** — API `PATCH /:id/phu-trach` trả về ngay, không để CEO chờ SMTP. Lỗi ghi `NhatKyEmail.trangThai = LOI`, hiện trong ngăn kéo chi tiết.

⚠️ Giới hạn ~500 mail/ngày: đếm số mail đã gửi trong ngày, vượt 450 thì cảnh báo trên UI.

### 6. Đọc mail qua IMAP — chống xử lý trùng ⭐

Đây là chỗ thiết kế quan trọng nhất của giai đoạn. Hướng OAuth cũ dùng nhãn Gmail; hướng IMAP dùng **hai lớp bảo vệ**, thực ra còn chắc hơn:

**Lớp 1 — cửa sổ UID (rẻ, tránh quét lại nghìn mail cũ)**
```ts
// Lưu trong CauHinh: IMAP_LAST_UID, IMAP_UID_VALIDITY
// Chỉ lấy mail có UID lớn hơn lần quét trước, trong vòng 30 ngày.
const ds = await client.search({ uid: `${lastUid + 1}:*`, since: cachDay30Ngay });
```

**Lớp 2 — `Message-ID` unique (đảm bảo đúng đắn tuyệt đối)**
```ts
// NhatKyEmail.messageId đã có @unique từ GĐ 1.
// Ghi trùng → Prisma ném P2002 → bỏ qua, coi như đã xử lý.
// Kể cả UID bị lệch, restart giữa chừng, hay Gmail reset uidValidity
// thì cũng KHÔNG BAO GIỜ tạo đề xuất trùng.
```

⚠️ **`uidValidity` đổi** (hiếm, nhưng Gmail có thể reset): so với giá trị lưu trong `CauHinh`; khác nhau → đặt `lastUid = 0` và dựa hoàn toàn vào lớp 2.

Với mỗi mail:
1. Parse bằng `mailparser` → lấy `messageId`, `from`, `subject`, `text`
2. Trích `[HM-xxxx]` từ tiêu đề → không có thì chỉ ghi nhật ký, bỏ qua
3. Đối chiếu email người gửi với `NhanSu.email` → không khớp thì chỉ ghi nhật ký
4. **Cả hai khớp** → ghi `NhatKyEmail` (huong `NHAN_VE`), chấm điểm, tạo `DeXuatHoanThanh` trạng thái `CHO_DUYET`
5. Cập nhật `IMAP_LAST_UID`

### 7. Phân tích phản hồi tiếng Việt — TDD ⭐

**Viết `phan-tich-phan-hoi.test.ts` trước.**

```ts
export function chamDiemHoanThanh(noiDung: string): {
  diem: number;            // 0..100
  trichDan: string | null; // câu làm bằng chứng cho CEO đọc
}
```

Quy tắc:
```
+ cụm khẳng định: "đã hoàn thành" "đã xong" "xong rồi" "hoàn tất" "đã gửi" "done"
− dấu hiệu phủ định / tương lai đứng GẦN (trong cùng câu):
  "chưa" "sẽ" "sắp" "đang" "chuẩn bị" "cố gắng" "chậm" "xin gia hạn" "không kịp"
```

Chuẩn hóa bỏ dấu trước khi so khớp → `"da hoan thanh"` (gõ không dấu) vẫn nhận ra.

Ca test bắt buộc:
| Nội dung | Kỳ vọng |
|---|---|
| `"Em đã hoàn thành rồi anh nhé"` | điểm cao |
| `"Em chưa hoàn thành được anh ạ"` | điểm **thấp** |
| `"Mai em hoàn thành nhé"` | điểm **thấp** |
| `"Đang làm, sắp xong"` | điểm thấp |
| `"Xin gia hạn thêm 2 ngày"` | điểm rất thấp |
| `"Da hoan thanh"` (không dấu) | vẫn nhận được |
| Có chuỗi trích dẫn mail cũ phía dưới | **bỏ qua**, chỉ đọc phần trả lời mới |

Cắt phần trích dẫn: bỏ mọi dòng bắt đầu bằng `>`, cắt từ mốc `On ... wrote:` / `Vào ... đã viết:`.

### 8. Cron quét hộp thư

`scheduler.ts` dùng **node-cron v4** (API khác v3 — đọc lại tài liệu). Bật/tắt bằng `BAT_CRON_QUET_MAIL`, chu kỳ từ `CHU_KY_QUET_PHUT` trong `CauHinh`.

- Cờ khóa trong bộ nhớ chống chạy chồng
- Kết nối IMAP mở → quét → **đóng** mỗi lần (không giữ kết nối lâu, Gmail hay tự ngắt)
- Lỗi kết nối ghi `CauHinh.EMAIL_LOI_GAN_NHAT` → UI hiện cảnh báo đỏ

### 9. Trạng thái kết nối + Cài đặt

```
GET  /api/email/trang-thai      { daKetNoi, diaChi, lanQuetCuoi, soMailDaXuLy, soMailGuiHomNay, loiGanNhat }
POST /api/email/kiem-tra        gọi verify() SMTP + IMAP, trả kết quả ngay
POST /api/email/gui-giao-viec   { hangMucId }  gửi lại thủ công
POST /api/email/quet-ngay       quét ngay, không đợi cron
GET  /api/email/nhat-ky         ?hangMucId=
```

Trang Cài đặt hiện: địa chỉ đang dùng, nút **"Kiểm tra kết nối"**, công tắc `TU_DONG_GUI_MAIL` / `BAT_CRON_QUET_MAIL`, ô chu kỳ quét, số mail đã gửi hôm nay.

Sai App Password → cảnh báo đỏ kèm hướng dẫn: *"Kiểm tra lại App Password trong .env, nhớ bỏ hết dấu cách."*

### 10. Hàng chờ duyệt

```
GET  /api/de-xuat?trangThai=CHO_DUYET
POST /api/de-xuat/:id/duyet      → tick hạng mục + ghi hoanThanhBoi + rollup
POST /api/de-xuat/:id/tu-choi
```

`POST /duyet` chạy trong transaction, gọi lại `capNhatTienDoVaLanLenTren` từ GĐ 1.

Frontend: badge số trên thanh điều hướng; danh sách hiện tên hạng mục, người gửi, **trích dẫn nguyên văn** (để CEO tự đọc và quyết), điểm tin cậy, 2 nút Duyệt / Từ chối.

### 11. Magic link

`token.service.ts`: `HMAC-SHA256(hangMucId + hanSuDung, MAGIC_LINK_SECRET)`, hết hạn 30 ngày, **dùng một lần**.

```
GET  /xac-nhan/:token   → trang HTML tiếng Việt, nút "Xác nhận đã hoàn thành"
POST /xac-nhan/:token   → tạo DeXuatHoanThanh nguồn MAGIC_LINK, độ tin cậy 100
```

⚠️ Route này **không đi qua** middleware nội bộ. Nhưng vẫn tạo **đề xuất chờ duyệt**, không tự tick.

Chỉ bật khi `PUBLIC_BASE_URL` có giá trị. Chạy local → biến rỗng → mail không có link chết.

### 12. Nhật ký email trong ngăn kéo

Lấp chỗ trống chừa từ GĐ 2: dòng thời gian mail gửi/nhận của hạng mục, mở xem được nội dung đầy đủ.

---

## Todo

- [ ] **CEO bật Xác minh 2 bước rồi tạo App Password, dán vào `.env`**
- [ ] Cài `nodemailer` `imapflow` `mailparser` + types
- [ ] Biến môi trường Gmail + validate độ dài 16 ký tự, lỗi tiếng Việt
- [ ] `mail.interface.ts` (giữ để sau lắp lại OAuth được)
- [ ] `gmail-smtp-imap.provider.ts` — SMTP gửi + IMAP đọc
- [ ] `transporter.verify()` lúc khởi động
- [ ] `ma-tham-chieu.ts` sinh + trích, khớp `Re:`/`Fwd:`
- [ ] `giao-viec.template.ts` HTML tiếng Việt
- [ ] Tự động gửi + **dedupe theo (hangMucId, nhanSuId)** + công tắc (R5)
- [ ] Gửi bất đồng bộ, lỗi ghi `NhatKyEmail`
- [ ] Đếm mail gửi trong ngày, cảnh báo khi gần 500
- [ ] **Chống trùng 2 lớp**: cửa sổ UID + `messageId` unique
- [ ] Xử lý `uidValidity` đổi → reset `lastUid`
- [ ] **Test `phan-tich-phan-hoi.test.ts` trước** → implement (7 ca)
- [ ] Chuẩn hóa bỏ dấu khi so khớp
- [ ] Cắt phần trích dẫn mail cũ
- [ ] `scheduler.ts` node-cron v4 + cờ chống chạy chồng
- [ ] `quet-hop-thu.job.ts` mở/đóng kết nối mỗi lần quét
- [ ] Module `de-xuat` + duyệt trong transaction + rollup
- [ ] `token.service.ts` HMAC + hết hạn + dùng một lần
- [ ] Route `/xac-nhan/:token` + trang cảm ơn tiếng Việt
- [ ] `KhungNhatKyEmail` gắn vào ngăn kéo GĐ 2
- [ ] Badge đề xuất + `DanhSachDeXuat`
- [ ] `TrangThaiKetNoiEmail` cảnh báo đỏ + nút kiểm tra kết nối
- [ ] Bổ sung phần email vào trang Cài đặt
- [ ] `npm run typecheck` sạch

---

## Tiêu chí nghiệm thu

1. Nhập App Password đúng → Cài đặt hiện "Đã kết nối" + địa chỉ
2. Nhập sai (hoặc còn dấu cách) → **cảnh báo đỏ, hướng dẫn tiếng Việt rõ ràng**
3. Giao việc → mail đến, tiêu đề có `[HM-xxxx]`, tiếng Việt không lỗi font
4. Đổi người phụ trách qua lại → **không gửi trùng** cho người đã nhận
5. Tắt `TU_DONG_GUI_MAIL` → giao việc không gửi mail
6. Trả lời `"đã hoàn thành"` → sau 1 chu kỳ quét, đề xuất hiện, badge tăng
7. Trả lời `"chưa hoàn thành"` → đề xuất **điểm thấp**, CEO đọc trích dẫn thấy rõ
8. **Hạng mục KHÔNG tự tick trong mọi trường hợp** — để cron chạy nhiều vòng để kiểm
9. Bấm Duyệt → hạng mục hoàn thành, ghi đúng người, % cha cập nhật
10. Chạy cron 3 lần liên tiếp → **không tạo đề xuất trùng**
11. **Xóa `IMAP_LAST_UID` rồi quét lại** → vẫn không trùng (lớp `messageId` hoạt động)
12. Mail từ người lạ có `[HM-xxxx]` → chỉ ghi nhật ký, **không** tạo đề xuất
13. Mail từ đúng người nhưng không có mã → chỉ ghi nhật ký
14. Thu hồi App Password ở Google → app hiện **cảnh báo đỏ**, không im lặng
15. Đặt `PUBLIC_BASE_URL` → mail có nút xác nhận, bấm ra trang tiếng Việt, tạo đề xuất
16. Bỏ `PUBLIC_BASE_URL` → mail chỉ có hướng dẫn trả lời, không có link chết
17. Ngăn kéo hạng mục hiện đủ nhật ký mail gửi/nhận

---

## Rủi ro

| Rủi ro | Mức | Xử lý |
|---|---|---|
| Chưa bật Xác minh 2 bước → không tạo được App Password | **Cao** | README ghi rõ đây là bước 1, kèm link trực tiếp |
| Dán App Password còn dấu cách | **Cao** | Zod kiểm đúng 16 ký tự, báo lỗi tiếng Việt chỉ rõ nguyên nhân |
| Lộ `.env` = mất toàn quyền hộp thư | **Cao** | `.gitignore` từ GĐ 0; GĐ 5 kiểm `git log --all -- .env`; hướng dẫn thu hồi 1 click |
| Parser tiếng Việt hiểu sai | **Cao** | Không bao giờ tự tick; luôn qua CEO duyệt; TDD 7 ca |
| Xử lý mail trùng lặp | Trung bình | 2 lớp: cửa sổ UID + `messageId` unique |
| `uidValidity` đổi làm lệch UID | Trung bình | So sánh với giá trị lưu, khác thì reset về 0 |
| Tự động gửi → spam nhân viên | Trung bình | Dedupe theo cặp + công tắc tổng |
| Vượt giới hạn ~500 mail/ngày | Trung bình | Đếm theo ngày, cảnh báo từ mốc 450 |
| Cron chạy chồng lên nhau | Trung bình | Cờ khóa trong bộ nhớ |
| Chuỗi trích dẫn mail cũ gây điểm sai | Trung bình | Cắt dòng `>` và mốc `Vào ... đã viết:` |
| Gmail siết App Password trong tương lai | Thấp | Giữ interface `NhaCungCapMail` → lắp lại OAuth không đụng nghiệp vụ |
| Magic link bị đoán | Thấp | HMAC-SHA256, hết hạn 30 ngày, dùng một lần |
| node-cron v4 khác v3 | Thấp | Đọc lại tài liệu v4 khi implement |
