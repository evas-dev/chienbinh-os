# GĐ 1 — Database + Backend cơ bản

**Ưu tiên:** Cao · **Trạng thái:** ✅ **HOÀN THÀNH** (2026-07-23) · **Phụ thuộc:** GĐ 0

---

## ✅ KẾT QUẢ THỰC HIỆN

### Kiểm chứng đã chạy thật

| Hạng mục | Kết quả |
|---|---|
| Test đơn vị (`packages/shared`) | **39/39 xanh** — gồm 2 ca bẫy múi giờ và 3 ca biên trọng số |
| Test API đầu-cuối (`apps/api/kiem-thu-api.sh`) | **31/31 xanh**, chạy 2 lần liên tiếp đều đạt |
| Seed idempotent | Chạy 3 lần → số liệu đứng yên |
| Typecheck 3 workspace | Sạch |
| Kích thước file | Lớn nhất 178 dòng (đúng quy tắc < 200) |

### Kiểm chứng công thức trọng số trên dữ liệu thật

```
CV-0001 "Xây dựng nhà xưởng số 2"
├── HM-0001 Phần móng        trọng số 30 · 100%
│   ├── HM-0002 Khảo sát      30 · 100%
│   └── HM-0003 Đổ bê tông    70 · 100%   → cha = (30×100+70×100)/100 = 100 ✓
├── HM-0004 Phần thân        trọng số 50 ·  42%
│   ├── HM-0005 Khung thép    60 ·  70%
│   └── HM-0006 Lợp mái       40 ·   0%   → cha = (60×70+40×0)/100 = 42 ✓
└── HM-0007 Hoàn thiện       trọng số 20 ·   0%

Công việc = (30×100 + 50×42 + 20×0)/100 = 51% ✓
```
Lan truyền qua 3 cấp chính xác.

### Khe hở nghiệp vụ phát hiện khi chạy thử (đã sửa)

**Nhân viên cũ quay lại làm việc thì bị kẹt.** Xóa nhân sự là xóa mềm (tắt cờ
`dangHoatDong`) để giữ lịch sử. Nhưng khi thêm lại đúng email đó, hệ thống báo
"email đã tồn tại" → email bị khóa vĩnh viễn.

→ Đã sửa: gặp email của người **đã nghỉ** thì **kích hoạt lại bản ghi cũ** và
cập nhật thông tin, giữ nguyên `id`. Nhờ vậy toàn bộ lịch sử "ai đã hoàn thành
việc gì" của người đó vẫn còn nguyên liên kết. Email của người **đang hoạt động**
vẫn bị chặn như cũ.

### Ba khác biệt kỹ thuật so với kế hoạch

**1. Express 5 đổi kiểu route param** thành `string | string[] | undefined`
(Express 4 là `string`). Thay vì ép kiểu ở hàng chục chỗ, thêm `lib/tham-so.ts`
với hàm `layThamSo(req, 'id')` — thiếu tham số thì trả lỗi tiếng Việt rõ ràng
thay vì để `undefined` trôi xuống tầng dưới.

**2. Suy kiểu vòng trong calculator.** `capNhatTienDoVaLanLenTren` gán lại
`idHienTai` từ chính kết quả `update` → TypeScript báo `TS7022`. Phải chú thích
kiểu tường minh cho biến trung gian.

**3. Multer đọc tên tệp theo latin1.** Tên tiếng Việt có dấu bị thành ký tự rác.
Phải `Buffer.from(name, 'latin1').toString('utf8')` khi nhận, và dùng
`filename*=UTF-8''` khi trả về.

### Lệch nhỏ so với kế hoạch
- `hang-muc.service.ts` ban đầu 280 dòng → tách thành 4 file theo trách nhiệm:
  `hang-muc.service.ts` (CRUD) · `hang-muc.tien-do.service.ts` (tiến độ, phân công)
  · `hang-muc.sap-xep.service.ts` (kéo thả, trọng số) · `hang-muc.chung.ts` (dùng chung)
- Test dùng `node:test` có sẵn trong Node 24, không thêm phụ thuộc
- `packages/shared` cần 2 tsconfig: bản build loại test, bản typecheck gồm test

---

Toàn bộ dữ liệu và API CRUD. Chưa có UI, chưa có email.

**Liên kết:** [plan.md](plan.md) · [Thiết kế mục 6–8](reports/brainstorm-260723-thiet-ke-he-thong.md)

---

## Mục tiêu

7 bảng chạy trên Postgres, dữ liệu mẫu đã seed, toàn bộ API CRUD hoạt động và kiểm chứng được bằng curl. Công thức trọng số tính đúng và có test.

---

## Điểm cốt lõi: công thức trọng số

Đây là logic dễ sai nhất trong cả dự án. Viết **test trước**, code sau.

```
Lá  CHECKBOX   →  0 hoặc 100
Lá  PHAN_TRAM  →  nhập tay 0..100
Nút cha        →  Σ(trongSo_i × phanTram_i) / Σ(trongSo_i)
CongViec       →  áp dụng công thức trên cho các hạng mục gốc
```

**Chia cho tổng trọng số THỰC TẾ**, không chia cứng 100 — tổng 95 hay 110 vẫn ra đúng tỷ lệ.

### Khử phép chia 0 bằng cấu trúc, không bằng câu lệnh `if`

Thay vì viết `if (tong === 0) return ...` (một cái vá dễ bị quên khi refactor), **làm cho trạng thái đó không thể tồn tại**:

| Chốt chặn | Cách làm |
|---|---|
| DB | `trongSo Int @default(1)` — **không phải 0** |
| Validation | Zod: `z.int().min(1).max(1000)` — API từ chối trọng số 0 hoặc âm |
| Chia đều | `chiaDeuTrongSo()` luôn trả về mọi phần tử ≥ 1 |

Hệ quả: **`Σ trongSo ≥ số con ≥ 1`** bất cứ khi nào có con. Còn khi không có con thì nhánh code đã rẽ sang "đây là lá", không bao giờ chạm tới phép chia.

```ts
// Không cần kiểm tra chia 0: trongSo tối thiểu là 1 (chốt ở DB + Zod),
// nên tongTrongSo luôn ≥ 1 khi mảng cacCon không rỗng. Mảng rỗng đã
// được chặn ở nhánh gọi (nút không con = lá, giữ nguyên % của chính nó).
export function tinhPhanTramCha(cacCon: {trongSo: number; phanTram: number}[]): number {
  const tongTrongSo = cacCon.reduce((t, c) => t + c.trongSo, 0);
  const tongDongGop = cacCon.reduce((t, c) => t + c.trongSo * c.phanTram, 0);
  return Math.round(tongDongGop / tongTrongSo);
}
```

> **Ý nghĩa nghiệp vụ được giữ nguyên:** trọng số nhỏ nhất là 1 → hạng mục "không quan trọng lắm" vẫn diễn đạt được (trọng số 1 bên cạnh trọng số 100 chỉ chiếm ~1%), nhưng **không có hạng mục nào tàng hình**. Đã là con thì phải đóng góp vào tiến độ cha, dù ít.

### `chiaDeuTrongSo` — cũng phải không sinh ra số 0

```ts
// n = 3  → [33, 33, 34]   (dồn dư vào phần tử cuối, tổng đúng 100)
// n = 1  → [100]
// n = 200 → [1, 1, ..., 1] (tổng 200, KHÔNG phải 100 — và vẫn đúng,
//                           vì công thức chia cho tổng thực tế)
export function chiaDeuTrongSo(soLuong: number): number[]
```
Khi `soLuong > 100`, `floor(100/n)` ra 0 → **phải kẹp sàn về 1**. Đây chính là lý do công thức chia cho tổng thực tế thay vì chia cứng 100.

### Trường hợp biên bắt buộc test

| Tình huống | Kết quả đúng |
|---|---|
| Không có con nào | Giữ nguyên % của chính nó (coi như lá) — không chạm phép chia |
| Chỉ 1 con | % cha = % con đó |
| 200 con, trọng số đều = 1 | Trung bình cộng, tổng trọng số = 200 |
| Gửi `trongSo = 0` qua API | **Từ chối**, lỗi tiếng Việt |
| Con bị xóa | Tính lại ngay, không để % cũ đọng |

---

## File cần tạo

```
apps/api/prisma/
├── schema.prisma                    7 model đầy đủ
├── migrations/                      prisma migrate dev sinh ra
└── seed.ts

packages/shared/src/
├── constants/
│   ├── muc-do-uu-tien.ts            enum + nhãn tiếng Việt
│   ├── trang-thai.ts
│   └── index.ts
├── schemas/
│   ├── nhan-su.schema.ts
│   ├── cong-viec.schema.ts
│   ├── hang-muc.schema.ts
│   └── index.ts
├── utils/
│   ├── ngay-thang.ts                tinhSoNgayConLai() — múi giờ VN (R3)
│   └── ma-tu-sinh.ts                sinh CV-0001 / HM-0042
└── index.ts

apps/api/src/
├── middleware/validate.middleware.ts
├── modules/
│   ├── nhan-su/{routes,controller,service,repository}.ts
│   ├── cong-viec/{routes,controller,service,repository}.ts
│   ├── hang-muc/
│   │   ├── {routes,controller,service,repository}.ts
│   │   ├── tien-do.calculator.ts            ⭐ logic trọng số
│   │   └── tien-do.calculator.test.ts       ⭐ viết TRƯỚC
│   └── tep-dinh-kem/
│       ├── {routes,controller,service}.ts
│       └── storage/{storage.interface,local.storage,index}.ts
└── routes.ts                        gom toàn bộ router
```

---

## Các bước

### 1. Hằng số + nhãn tiếng Việt (`packages/shared/src/constants/`)

Mỗi enum đi kèm bản đồ nhãn tiếng Việt để FE không hardcode chuỗi:
```ts
export const MUC_DO_UU_TIEN = { CAO: 'CAO', TRUNG_BINH: 'TRUNG_BINH', THAP: 'THAP' } as const;

export const NHAN_UU_TIEN: Record<MucDoUuTien, string> = {
  CAO: 'Cao', TRUNG_BINH: 'Trung bình', THAP: 'Thấp',
};

export const MAU_UU_TIEN: Record<MucDoUuTien, string> = {
  CAO: 'text-red-600 bg-red-50', TRUNG_BINH: 'text-amber-600 bg-amber-50', THAP: 'text-slate-600 bg-slate-50',
};
```
Làm tương tự cho `TrangThaiCongViec`, `TrangThaiHangMuc`, `LoaiTienDo`, `MucCanhBao`.

### 2. Hàm ngày tháng (`ngay-thang.ts`) — giải quyết R3

Đây là chỗ dễ sai thứ hai sau công thức trọng số.

**Quy tắc đã chốt:** ngày Việt Nam — **cứ qua 24h (nửa đêm) là ngày mới**. So sánh theo **ngày lịch**, hoàn toàn bỏ qua giờ phút.

```
hạn hôm nay   09:00  →  còn 0 ngày
hạn hôm nay   23:59  →  còn 0 ngày      (cùng ngày lịch)
hạn ngày mai  00:01  →  còn 1 ngày      (đã sang ngày mới)
hạn hôm qua   23:59  →  quá hạn 1 ngày
```

**Cách làm — không cần thư viện múi giờ.** Lấy ngày lịch ở giờ VN dưới dạng chuỗi rồi trừ:

```ts
// Trả về ngày lịch theo giờ Việt Nam, dạng "2026-07-23".
// Dùng Intl thay vì thư viện timezone: chính xác, không thêm phụ thuộc,
// và dễ test vì đầu ra là chuỗi thuần.
function ngayLichVN(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
}

// Số ngày còn lại = hiệu hai NGÀY LỊCH ở giờ VN. Giờ phút không ảnh hưởng.
export function tinhSoNgayConLai(hanHoanThanh: Date, bayGio = new Date()): number {
  const a = Date.parse(ngayLichVN(bayGio) + 'T00:00:00Z');
  const b = Date.parse(ngayLichVN(hanHoanThanh) + 'T00:00:00Z');
  return Math.round((b - a) / 86_400_000);
}

export function xepMucCanhBao(soNgayConLai: number, nguongVang: number,
                              daHoanThanh: boolean): MucCanhBao
export function dinhDangNgayVN(d: Date): string   // 23/07/2026
```

`en-CA` cho định dạng `YYYY-MM-DD`. Máy chủ đặt múi giờ nào cũng ra kết quả giống nhau — quan trọng khi lên VPS thường chạy UTC.

**Viết unit test trước.** Ca bắt buộc:
| Ca | Kỳ vọng |
|---|---|
| Hạn hôm nay 23:59 (giờ VN) | 0 |
| Hạn hôm nay 00:01 (giờ VN) | 0 |
| Hạn ngày mai 00:01 | 1 |
| Hạn hôm qua 23:59 | −1 |
| **Máy chủ chạy UTC, hạn 2026-07-23 08:00 VN** | vẫn ra đúng như máy chạy giờ VN |
| Đã hoàn thành + quá hạn | `BINH_THUONG`, không phải `QUA_HAN` |

### 3. Schema Prisma — 7 model

Theo đúng [thiết kế mục 6](reports/brainstorm-260723-thiet-ke-he-thong.md). Điểm cần đặc biệt lưu ý:

```prisma
model HangMuc {
  id          String    @id @default(cuid())
  ma          String    @unique              // HM-0042, nhúng vào tiêu đề email
  congViecId  String
  congViec    CongViec  @relation(fields: [congViecId], references: [id], onDelete: Cascade)

  // Quan hệ tự tham chiếu → cây phân cấp cha–con
  hangMucChaId String?
  hangMucCha   HangMuc?  @relation("CayHangMuc", fields: [hangMucChaId], references: [id], onDelete: Cascade)
  hangMucCon   HangMuc[] @relation("CayHangMuc")

  trongSo            Int  @default(1)   // ⚠ mặc định 1, KHÔNG phải 0 — khử chia 0 bằng cấu trúc
  phanTramHoanThanh  Int  @default(0)   // lá: nhập tay · cha: tính tự động
  thuTu              Int  @default(0)
  hanHoanThanh       DateTime?

  @@index([congViecId])
  @@index([hangMucChaId])
  @@index([nguoiPhuTrachId])
  @@index([hanHoanThanh])              // ⭐ xương sống của bảng tới hạn GĐ 3
  @@index([congViecId, hangMucChaId, thuTu])
}
```

> ⚠️ **Không tạo cột `QUA_HAN`.** Là hàm của thời gian, lưu là ôi thiu sau 1 đêm.

Enum Postgres native cho: `MucDoUuTien`, `TrangThaiCongViec`, `TrangThaiHangMuc`, `LoaiTienDo`, `HuongEmail`, `TrangThaiEmail`, `NguonDeXuat`, `TrangThaiDeXuat`.

```bash
npm run db:migrate -- --name khoi_tao
npm run db:generate     # Prisma 7 KHÔNG tự chạy
```

### 4. Calculator trọng số — TDD

**Viết `tien-do.calculator.test.ts` trước.** Ca bắt buộc:

| # | Tình huống | Kỳ vọng |
|---|---|---|
| 1 | Móng 30/100%, Thân 50/40%, HT 20/0% | 50% |
| 2 | Tổng trọng số = 95 | vẫn đúng tỷ lệ |
| 3 | Không có con | giữ % của chính nó, **không chạm phép chia** |
| 4 | Chỉ 1 con | % cha = % con |
| 5 | Cây 3 cấp | lan truyền đúng lên tận gốc |
| 6 | Con CHECKBOX đã tick | tính là 100 |
| 7 | Xóa 1 con | cha tính lại ngay |
| 8 | `chiaDeuTrongSo(200)` | 200 phần tử, **mọi phần tử = 1**, không có số 0 |
| 9 | API nhận `trongSo: 0` | **từ chối**, lỗi tiếng Việt |

Hàm chính:
```ts
// Tính lại % của một nút và lan ngược lên toàn bộ tổ tiên.
// Chạy trong 1 transaction để không có trạng thái nửa vời.
export async function capNhatTienDoVaLanLenTren(tx, hangMucId: string): Promise<void>
export function tinhPhanTramCha(cacCon: {trongSo: number; phanTram: number}[]): number
export function chiaDeuTrongSo(soLuong: number): number[]   // 3 → [33,33,34]
```

`chiaDeuTrongSo` cộng đúng 100 khi `soLuong ≤ 100` (dư dồn vào phần tử cuối); khi vượt 100 thì kẹp sàn về 1 mỗi phần tử — tổng khác 100 nhưng công thức chia cho tổng thực tế nên vẫn đúng.

### 5. Module `nhan-su`

CRUD + tìm kiếm theo tên/email/SĐT. `DELETE` là **soft delete** (`dangHoatDong = false`) để không mất lịch sử ai đã làm việc gì.

Validation Zod 4: `hoTen` bắt buộc ≥2 ký tự, `email` dùng **`z.email()`** (Zod 4, không phải `z.string().email()`), SĐT tùy chọn nhưng nếu có phải khớp regex số VN.

### 6. Module `cong-viec`

CRUD + sinh mã tự động `CV-0001`. `GET /:id` trả **cả cây hạng mục** (load phẳng rồi dựng cây trong bộ nhớ — quy mô này không cần recursive CTE).

Validation: `ngayKetThucDuKien` phải **sau** `ngayBatDau` (dùng `.refine()`).

### 7. Module `hang-muc`

Ngoài CRUD:
- `POST` — khi thêm con mới, **tự chia đều lại trọng số** toàn nhóm anh em trong cùng transaction
- `PATCH /:id/tien-do` — cập nhật % hoặc tick, rồi gọi `capNhatTienDoVaLanLenTren`
- `PATCH /:id/phu-trach` — GĐ 1 chỉ gán người, chưa gửi mail (để GĐ 4)
- `PATCH /trong-so` — cập nhật hàng loạt cả nhóm anh em
- `POST /sap-xep-lai` — kéo thả, đổi `thuTu` và/hoặc `hangMucChaId`
  - ⚠️ **Chặn vòng lặp**: không cho đặt một nút làm con của chính hậu duệ nó
- `DELETE` — cascade xuống con, **tính lại % cha sau khi xóa**

### 8. Module `tep-dinh-kem`

`storage.interface.ts` trừu tượng hóa để sau đổi sang S3 không sửa nghiệp vụ:
```ts
export interface KhoLuuTru {
  luu(file: Express.Multer.File): Promise<{ tenLuu: string; duongDan: string }>;
  doc(duongDan: string): Promise<Buffer>;
  xoa(duongDan: string): Promise<void>;
}
```

`local.storage.ts`: lưu vào `UPLOAD_DIR`, tên file = `uuid + phần mở rộng`.
- **Bắt buộc**: giữ `tenGoc` (tiếng Việt, để hiển thị) tách khỏi `tenLuu` (uuid, để lưu đĩa) → chống path traversal và trùng tên
- `duongDan` lưu **tương đối** để copy sang máy khác vẫn chạy
- Giới hạn 25MB/file, chặn phần mở rộng nguy hiểm (`.sh`, `.command`, `.app`)
- Xóa = chuyển vào `uploads/.thung-rac/`, không `unlink` ngay

### 9. Error handler + validate middleware

Express 5 **tự bắt lỗi trong async handler** → không cần `express-async-handler`.

Error handler trả về thông báo **tiếng Việt**:
```json
{ "thanhCong": false, "loi": "Không tìm thấy hạng mục", "chiTiet": null }
```
Lỗi Zod → gom thành danh sách `{ truong, thongBao }` để FE hiện dưới từng ô nhập.

### 10. Seed dữ liệu mẫu

`prisma/seed.ts` — dữ liệu tiếng Việt thực tế để mở lên là thấy giao diện có hồn:
- **4 nhân sự** có email thật dạng `ten@example.com`
- **3 công việc**: 1 đang chạy đúng tiến độ, 1 **có hạng mục quá hạn** (để thấy badge đỏ), 1 sắp hoàn thành
- Mỗi công việc **2–3 cấp hạng mục**, trọng số cộng đúng 100
- Vài `TepDinhKem` giả (chỉ metadata)
- `CauHinh` mặc định: `NGUONG_CANH_BAO_VANG=3`, `TU_DONG_GUI_MAIL=true`, `BAT_CRON_QUET_MAIL=false`

> Seed phải **idempotent** (`upsert`), chạy nhiều lần không nhân bản dữ liệu.

```bash
npm run db:seed
```

---

## Todo

- [ ] Hằng số + nhãn tiếng Việt trong `packages/shared`
- [ ] **Test `ngay-thang.ts` trước** → rồi implement (R3, so theo ngày lịch VN)
- [ ] Kiểm ca "máy chủ chạy UTC" cho `tinhSoNgayConLai`
- [ ] `schema.prisma` 7 model + enum + index, **`trongSo @default(1)`**
- [ ] `npm run db:migrate -- --name khoi_tao` && `db:generate`
- [ ] **Test `tien-do.calculator.test.ts` trước** → rồi implement (9 ca)
- [ ] Zod chặn `trongSo < 1` ở tầng API
- [ ] Zod schema dùng chung cho 3 thực thể chính
- [ ] Module `nhan-su` (soft delete)
- [ ] Module `cong-viec` (sinh mã, trả cây)
- [ ] Module `hang-muc` (chia đều trọng số, chặn vòng lặp, rollup)
- [ ] Module `tep-dinh-kem` + `KhoLuuTru` + local storage
- [ ] `validate.middleware.ts` + error handler tiếng Việt
- [ ] `seed.ts` idempotent, có ca quá hạn
- [ ] Script curl kiểm thử toàn bộ endpoint
- [ ] `npm run typecheck` sạch

---

## Tiêu chí nghiệm thu

1. `npm run db:migrate` && `db:seed` chạy sạch trên DB trống
2. Chạy `db:seed` **hai lần** → không nhân đôi dữ liệu
3. Toàn bộ test calculator xanh, **kể cả 3 ca biên** (trọng số 0, không con, cây 3 cấp)
4. `curl` tạo công việc → thêm 3 hạng mục → trọng số tự thành 33/33/34
5. Sửa % một hạng mục lá → % cha **và** % công việc đổi đúng theo trọng số
6. Xóa 1 hạng mục con → % cha tính lại ngay
7. Thử đặt hạng mục làm con của chính hậu duệ nó → API **từ chối**
8. Upload file tên tiếng Việt có dấu → tải về đúng tên gốc
9. Gửi payload sai → lỗi tiếng Việt, có tên trường cụ thể
10. `npm run typecheck` sạch

---

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Công thức trọng số sai ở ca biên | TDD, 9 ca test viết trước khi code |
| Chia cho 0 | **Khử bằng cấu trúc**: `trongSo` mặc định 1, Zod `min(1)`, `chiaDeuTrongSo` kẹp sàn 1 → tổng luôn ≥ 1. Không dùng `if` canh chừng |
| Rollup để lại trạng thái nửa vời | Toàn bộ chạy trong 1 transaction Prisma |
| `chiaDeuTrongSo` cộng ra 99 hoặc 101 | Dồn phần dư vào phần tử cuối, có test |
| Vòng lặp trong cây khi kéo thả | Kiểm tra hậu duệ trước khi cho phép |
| Sai múi giờ khi tính ngày | Test viết trước, so theo ranh giới ngày VN |
| File tên tiếng Việt lỗi encoding | Tách `tenGoc` / `tenLuu`, test riêng ca có dấu |
