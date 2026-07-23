# GĐ 2 — Frontend quản lý công việc / hạng mục / nhân sự

**Ưu tiên:** Cao · **Trạng thái:** ⬜ Chưa bắt đầu · **Ước lượng:** 2–2.5 ngày · **Phụ thuộc:** GĐ 1

Phần "TRÊN" của app theo spec. Toàn bộ thao tác quản lý làm được trên UI, không cần curl nữa.

**Liên kết:** [plan.md](plan.md) · [Thiết kế mục 5](reports/brainstorm-260723-thiet-ke-he-thong.md)

---

## Mục tiêu

CEO mở trình duyệt, tạo được công việc → thêm hạng mục lồng 2–3 cấp → chỉnh trọng số → giao nhân sự (tạo mới ngay tại chỗ nếu chưa có) → gắn file đính kèm. Tất cả bằng chuột, giao diện tiếng Việt.

---

## Nguyên tắc thiết kế giao diện

Người dùng là CEO, không phải project manager. Ưu tiên **đọc nhanh** hơn **tính năng nhiều**.

- Cây hạng mục **mở hết mặc định** (đã chốt: chỉ sâu 2–3 cấp, không cần gập)
- % của nút cha **chỉ đọc**, hiện rõ là "tự tính" để không ai thắc mắc tại sao sửa không được
- Trọng số hiện ngay cạnh tên hạng mục, sửa tại chỗ (inline), không phải mở dialog
- Mọi hành động phá hủy đều có dialog xác nhận **đếm rõ số lượng** sẽ mất
- Không dùng màu mè: đỏ chỉ dành cho quá hạn, vàng cho sắp tới hạn

---

## File cần tạo

```
apps/web/src/
├── lib/
│   ├── api-client.ts               fetch wrapper, chuẩn hóa lỗi tiếng Việt
│   └── query-client.ts             cấu hình TanStack Query
├── hooks/
│   ├── use-cong-viec.ts
│   ├── use-hang-muc.ts
│   └── use-nhan-su.ts
├── components/
│   ├── chung/
│   │   ├── ThanhTienDo.tsx         progress bar + số %
│   │   ├── HuyHieuUuTien.tsx
│   │   ├── HuyHieuTrangThai.tsx
│   │   ├── TrangThai.tsx           dùng chung: đang tải / rỗng / lỗi
│   │   └── DialogXacNhanXoa.tsx    đếm rõ số mục sẽ mất
│   ├── cong-viec/
│   │   ├── DanhSachCongViec.tsx
│   │   ├── TheCongViec.tsx
│   │   └── FormCongViec.tsx        tạo + sửa dùng chung
│   ├── hang-muc/
│   │   ├── CayHangMuc.tsx          đệ quy
│   │   ├── NodeHangMuc.tsx         1 dòng trong cây
│   │   ├── ThanhTrongSo.tsx        ⭐ cảnh báo tổng ≠ 100
│   │   ├── FormHangMuc.tsx
│   │   ├── NganKeoChiTiet.tsx      Sheet bên phải
│   │   └── KhungTepDinhKem.tsx     upload + danh sách + tải về
│   └── nhan-su/
│       ├── BangNhanSu.tsx
│       ├── FormNhanSu.tsx
│       └── ChonNhanSu.tsx          ⭐ combobox + tạo mới tại chỗ
└── pages/
    ├── TongQuan.tsx
    ├── ChiTietCongViec.tsx
    └── NhanSu.tsx
```

---

## Các bước

### 1. Hạ tầng: api-client + TanStack Query

`api-client.ts` chuẩn hóa mọi lỗi về một dạng để UI không phải xử lý rải rác:
```ts
// Backend luôn trả { thanhCong, loi, chiTiet }. Ném AppError để
// component chỉ cần bắt một loại lỗi duy nhất.
export class LoiApi extends Error {
  constructor(public thongBao: string, public chiTiet?: LoiTruong[], public status?: number)
}
```

`query-client.ts`: `staleTime` 30s, không refetch khi focus lại cửa sổ (gây nháy màn hình khó chịu khi CEO alt-tab).

Cài router: `npm i -w @ceo/web react-router` — 3 route: `/`, `/cong-viec/:id`, `/nhan-su`.

### 2. Component dùng chung

- `ThanhTienDo` — thanh + số %; nhận prop `laTuTinh` để hiện icon 🔒 và tooltip *"Tự tính từ hạng mục con"*
- `TrangThai` — 3 trạng thái: đang tải (skeleton), rỗng (kèm nút hành động), lỗi (kèm nút thử lại). Dùng ở **mọi** danh sách, không viết lại
- `DialogXacNhanXoa` — nhận `{ tenMuc, soHangMucCon, soTep }`, hiện: *"Xóa 'Xây kho B'? Sẽ mất 12 hạng mục và 5 tệp đính kèm."*

### 3. Trang Tổng quan

Bố cục trên–dưới đúng theo spec:
- **Trên**: 4 thẻ số liệu (tổng công việc · đang chạy · quá hạn · sắp tới hạn) + danh sách công việc dạng thẻ
- **Dưới**: chỗ trống dành cho bảng tới hạn — **GĐ 3 lấp vào**. GĐ 2 để placeholder rõ ràng

`TheCongViec` hiện: tên, mã `CV-0001`, huy hiệu ưu tiên, thanh tiến độ, `ngày bắt đầu → ngày kết thúc`, số hạng mục, số hạng mục quá hạn (nếu có, tô đỏ).

### 4. Form công việc

Dùng `react-hook-form` + `@hookform/resolvers/zod`, **dùng lại đúng Zod schema từ `packages/shared`** — validate FE/BE không bao giờ lệch.

Trường: tên, mô tả, ngày bắt đầu, ngày kết thúc dự kiến, ưu tiên, trạng thái.
Ngày dùng `<input type="date">` — đơn giản, có sẵn locale hệ thống, không cần thư viện lịch.

### 5. Cây hạng mục (phần khó nhất) ⭐

`CayHangMuc.tsx` đệ quy, mỗi cấp thụt thêm 24px, có đường kẻ dọc mờ để mắt lần theo.

`NodeHangMuc.tsx` một dòng gồm:
```
[✓] Tên hạng mục          [30%⚖]  [====60%====]  [👤 Nguyễn Văn A]  [📅 25/07]  [⋮]
     ↑ hoặc ô nhập %        ↑trọng số  ↑tiến độ                        ↑hạn      ↑menu
```
- Lá `CHECKBOX` → checkbox; lá `PHAN_TRAM` → ô nhập số
- Nút cha → **chỉ đọc**, có icon khóa
- Trọng số sửa inline, blur là lưu
- Menu `⋮`: Thêm hạng mục con · Sửa · Xóa · Mở chi tiết
- Hạn quá ngày → chữ đỏ; sắp tới hạn → chữ vàng (dùng `xepMucCanhBao` từ shared)

**Cập nhật lạc quan (optimistic)**: tick checkbox phải phản hồi tức thì, không đợi API. Nhưng % của cha do server tính → sau khi API trả về, `invalidateQueries` để lấy số đúng. Nếu API lỗi → hoàn tác + toast đỏ.

### 6. Thanh trọng số ⭐

`ThanhTrongSo.tsx` đặt ngay trên mỗi nhóm anh em:
```
Tổng trọng số: 100%  ✓                    [Chia đều]
Tổng trọng số:  95%  ⚠ thiếu 5%           [Chia đều]
Tổng trọng số: 110%  ⚠ thừa 10%           [Chia đều]
```
**Cảnh báo nhưng KHÔNG chặn** — CEO tự chịu trách nhiệm con số của mình. Nút "Chia đều" gọi `PATCH /api/hang-muc/trong-so`.

### 7. Ngăn kéo chi tiết hạng mục

`Sheet` của shadcn trượt từ phải, hiện:
- Tên, mô tả, ghi chú (sửa được tại chỗ)
- Hạn, người phụ trách, trọng số, tiến độ
- **Danh sách tệp đính kèm** — chính là "checklist tài liệu" trong spec
- Chỗ trống cho **nhật ký email** — GĐ 4 lấp vào

`KhungTepDinhKem.tsx`: kéo-thả để upload, danh sách hiện tên gốc + dung lượng + ngày, nút tải về và xóa. Đang upload thì hiện thanh tiến độ.

### 8. Màn hình nhân sự

Bảng: họ tên, chức vụ, email, SĐT, số hạng mục đang gánh, trạng thái hoạt động. Có ô tìm kiếm.
Xóa = tắt hoạt động, hiện nhãn *"Ngừng hoạt động"* mờ, không biến mất khỏi bảng.

### 9. ChonNhanSu — combobox tạo nhanh ⭐

Yêu cầu spec: *"nếu người đó chưa có trong hệ thống thì cho phép tạo mới ngay tại chỗ"*.

`Command` của shadcn:
- Gõ để lọc theo tên/email
- Không khớp ai → hiện dòng **`+ Tạo nhân sự "Trần Văn B"`**
- Bấm vào → mini-form ngay trong popover (họ tên đã điền sẵn, chỉ cần nhập email + SĐT) → tạo xong **tự chọn luôn**
- Không rời khỏi màn hình đang làm

---

## Todo

- [ ] `api-client.ts` + `LoiApi` + `query-client.ts`
- [ ] Cài `react-router`, dựng 3 route
- [ ] `ThanhTienDo`, `HuyHieuUuTien`, `HuyHieuTrangThai`
- [ ] `TrangThai` (tải/rỗng/lỗi) — dùng ở mọi danh sách
- [ ] `DialogXacNhanXoa` đếm rõ số mục
- [ ] Trang `TongQuan` + 4 thẻ số liệu + danh sách thẻ công việc
- [ ] `FormCongViec` dùng lại Zod schema từ shared
- [ ] `CayHangMuc` đệ quy + `NodeHangMuc`
- [ ] Cập nhật lạc quan cho tick/sửa %, hoàn tác khi lỗi
- [ ] `ThanhTrongSo` + nút "Chia đều"
- [ ] `NganKeoChiTiet` (Sheet) + sửa tại chỗ
- [ ] `KhungTepDinhKem` kéo-thả upload + tải về + xóa
- [ ] `BangNhanSu` + `FormNhanSu` + tìm kiếm
- [ ] `ChonNhanSu` combobox + tạo mới tại chỗ
- [ ] Rà soát: **không sót chuỗi tiếng Anh** nào trên UI
- [ ] Kiểm tra responsive ở 1280 và 1440
- [ ] `npm run typecheck` sạch

---

## Tiêu chí nghiệm thu

1. Tạo công việc mới hoàn toàn bằng UI → hiện ngay trong danh sách
2. Thêm 3 hạng mục con → trọng số tự thành 33/33/34, thanh hiện `100% ✓`
3. Thêm hạng mục cháu (cấp 3) → cây hiển thị đúng thụt lề
4. Tick checkbox → phản hồi **tức thì**, % cha và % công việc cập nhật sau khi server trả
5. Sửa trọng số thành tổng 95 → hiện `⚠ thiếu 5%` nhưng **vẫn lưu được**
6. Bấm "Chia đều" → về đúng 100%
7. Giao việc cho người chưa có → tạo ngay trong combobox, tự chọn, không rời màn hình
8. Upload file tên tiếng Việt có dấu → hiện đúng tên, tải về mở được
9. Xóa công việc → dialog đếm đúng số hạng mục và tệp
10. Ngắt mạng → hiện lỗi tiếng Việt kèm nút thử lại, không màn hình trắng
11. Duyệt toàn bộ UI: 0 chuỗi tiếng Anh

---

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Cập nhật lạc quan lệch với % server tính | Lạc quan cho hành động của người dùng, `invalidateQueries` sau khi API trả để lấy % cha đúng |
| Component đệ quy render lại toàn cây | `memo` cho `NodeHangMuc`, key ổn định theo id |
| Sửa trọng số inline gọi API mỗi lần gõ | Chỉ lưu khi blur hoặc Enter, không lưu theo từng ký tự |
| Sót chuỗi tiếng Anh (placeholder, aria-label, toast) | Có bước rà soát riêng trong todo, grep tìm ký tự ASCII trong JSX |
| Sheet chi tiết mở chậm vì tải file cùng lúc | Tải danh sách tệp riêng sau khi Sheet đã mở |
| Upload file lớn treo UI | Hiện thanh tiến độ, giới hạn 25MB, báo lỗi rõ khi vượt |
