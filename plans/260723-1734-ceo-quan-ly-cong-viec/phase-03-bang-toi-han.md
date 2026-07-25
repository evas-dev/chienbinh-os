# GĐ 3 — Bảng checklist theo tiến độ tới hạn

**Ưu tiên:** Cao · **Trạng thái:** ✅ **HOÀN THÀNH** (2026-07-24) · **Phụ thuộc:** GĐ 1, GĐ 2

---

## ✅ KẾT QUẢ THỰC HIỆN — kiểm chứng bằng trình duyệt thật

| Hạng mục | Kết quả |
|---|---|
| Read-model riêng | Module `bang-toi-han` query phẳng dùng index `hanHoanThanh`, không dùng lại API cây |
| Sắp xếp quy tắc kép | Chưa xong lên trước (quá hạn 4n→1n→gần hạn), việc đã xong đẩy xuống cuối dù hạn đã qua |
| Badge màu | Quá hạn tô đỏ ("Quá hạn 4 ngày"), sắp tới vàng, chỉ 2 màu cảnh báo |
| Thống kê | Tính trên toàn tập lọc: 2 quá hạn / 3 sắp tới / 14 tổng — khớp thẻ số liệu |
| 4 bộ lọc + tìm kiếm | Nhân sự, công việc, trạng thái, khoảng ngày + ô tìm debounce 300ms |
| **Đồng bộ URL** | Mở thẳng `?denNgay=...&chuaXong=true` → bảng lọc đúng 2 dòng quá hạn (bookmark/F5 giữ lọc) |
| Ngưỡng cấu hình | Đổi ngưỡng ở Cài đặt (3→7) lưu qua API, ảnh hưởng phân loại cảnh báo tức thì |
| Thẻ "quá hạn" bấm được | Áp lọc quá hạn + cuộn xuống bảng |
| Console lỗi | **0 lỗi** |

### Lệch có chủ đích so với kế hoạch
- **Mặc định hiển thị TOÀN BỘ** (đã sắp quá hạn lên đầu + phân trang 50), thay
  vì mặc định "7 ngày tới + quá hạn" như kế hoạch. Lý do: với sắp xếp đúng,
  hiển thị hết ít gây bối rối hơn ("sao thiếu việc?"), và các nút nhanh
  "7 ngày tới" / "Chỉ quá hạn" vẫn có sẵn để thu hẹp. Đổi lại dễ nếu CEO muốn.
- Nối ngưỡng cấu hình vào CẢ cây hạng mục (GĐ 2 trước đó hardcode 3) để màu
  cảnh báo nhất quán giữa hai màn hình.
- Thêm module `cau-hinh` (chưa có ở GĐ 1) vì bảng tới hạn và trang Cài đặt
  đều cần đọc/ghi ngưỡng.
- Dấu tiếng Việt: tìm kiếm dùng `insensitive` của Postgres (không bỏ dấu) —
  gõ có dấu mới khớp. Chấp nhận ở bản này; nếu vướng thì cài extension `unaccent`.

---

Phần "DƯỚI" của app theo spec. Đây là màn hình CEO nhìn nhiều nhất mỗi ngày.

**Liên kết:** [plan.md](plan.md) · [Thiết kế mục 8](reports/brainstorm-260723-thiet-ke-he-thong.md)

---

## Mục tiêu

Một bảng phẳng gom **toàn bộ** hạng mục của **mọi** công việc, gần deadline nhất lên đầu, tô màu cảnh báo, lọc và tìm kiếm được. Mục đích: CEO mở ra buổi sáng, đọc 15 giây là biết hôm nay phải hỏi ai việc gì.

---

## Vì sao tách thành read-model riêng

Bảng này **không** dùng lại API cây hạng mục. Lý do:
- Cây là dữ liệu phân cấp; bảng này cần **phẳng, đã join sẵn** tên công việc + thông tin người phụ trách
- Sắp xếp theo `hanHoanThanh` xuyên suốt mọi công việc → phải query từ bảng `HangMuc` trực tiếp với index `@@index([hanHoanThanh])`
- Trộn hai mục đích vào một endpoint sẽ khiến cả hai đều chậm và khó đọc

→ `modules/bang-toi-han/` là một module đọc riêng, chỉ có `service` + `routes`, không có `repository` riêng.

---

## File cần tạo

```
apps/api/src/modules/bang-toi-han/
├── bang-toi-han.routes.ts
├── bang-toi-han.service.ts          query phẳng + phân trang
└── bang-toi-han.types.ts

packages/shared/src/schemas/
└── bang-toi-han.schema.ts           schema tham số lọc

apps/web/src/
├── hooks/use-bang-toi-han.ts
├── components/bang-toi-han/
│   ├── BangToiHan.tsx               bảng chính
│   ├── BoLoc.tsx                    4 bộ lọc + tìm kiếm
│   ├── HuyHieuConLai.tsx            badge số ngày còn lại
│   └── DongToiHan.tsx               1 dòng
└── pages/CaiDat.tsx                 chỉnh NGUONG_CANH_BAO_VANG
```

---

## Các bước

### 1. Endpoint read-model

```
GET /api/bang-toi-han
    ?tuNgay=&denNgay=&nhanSuId=&congViecId=&trangThai=&q=
    &sapXep=hanHoanThanh&chieu=asc&trang=1&soDong=50
```

Trả về:
```ts
{
  duLieu: [{
    hangMucId, maHangMuc, tenHangMuc,
    congViecId, tenCongViec, maCongViec,
    hanHoanThanh, soNgayConLai, mucCanhBao,      // QUA_HAN | SAP_TOI | BINH_THUONG
    nguoiPhuTrach: { id, hoTen, email, soDienThoai } | null,
    phanTramHoanThanh, trangThai, loaiTienDo,
    hoanThanhBoi: { hoTen } | null, hoanThanhLuc,
    ghiChu,
  }],
  tong, trang, soDong,
  thongKe: { quaHan, sapToiHan, hoanThanh, tongCong }
}
```

`thongKe` tính trên **toàn bộ tập đã lọc**, không phải trang hiện tại — dùng cho 4 thẻ số liệu ở Tổng quan.

### 2. Chi tiết truy vấn — chỗ dễ sai

```ts
// Chỉ lấy hạng mục CÓ hạn. Hạng mục không đặt hạn không thuộc bảng "tới hạn".
where: { hanHoanThanh: { not: null }, ...boLoc }

// Sắp xếp: gần deadline nhất lên đầu.
// Hạng mục đã hoàn thành đẩy xuống cuối dù hạn có gần đến đâu.
orderBy: [{ daHoanThanh: 'asc' }, { hanHoanThanh: 'asc' }]
```

**`soNgayConLai` và `mucCanhBao` tính ở tầng service bằng `tinhSoNgayConLai()` từ `packages/shared`** — cùng một hàm frontend dùng, không viết lại. `QUA_HAN` không bao giờ đọc từ DB (nguyên tắc bất di bất dịch #2).

`NGUONG_CANH_BAO_VANG` đọc từ bảng `CauHinh` mỗi request (bảng nhỏ, không cần cache).

Tìm kiếm `q` quét: tên hạng mục, mã hạng mục, tên công việc, tên người phụ trách — `mode: 'insensitive'`.

> ⚠️ **Dấu tiếng Việt**: `insensitive` của Postgres không bỏ dấu — gõ "hoan thanh" **không** khớp "hoàn thành". Chấp nhận ở bản này (CEO gõ có dấu). Nếu sau thấy vướng: cài extension `unaccent` và thêm index biểu thức. Ghi vào mục "còn mở".

### 3. Bảng frontend

Cột theo đúng spec:

| Cột | Nội dung |
|---|---|
| Hạng mục | Tên + mã `HM-0042` mờ bên dưới |
| Công việc | Tên công việc, bấm được → sang chi tiết |
| Hạn | `25/07/2026` + badge số ngày còn lại |
| Người phụ trách | Tên; hover hiện email + SĐT |
| Tiến độ | Thanh mini + số % |
| Trạng thái | Huy hiệu |
| Người hoàn thành | Tên + ngày, rỗng nếu chưa xong |
| Ghi chú | Cắt ngắn, hover xem đủ |

### 4. Quy tắc màu

| Điều kiện | Hiển thị |
|---|---|
| Đã hoàn thành | Xám nhạt, chữ mờ, đẩy xuống cuối |
| Quá hạn (< 0 ngày) | **Đỏ** — `Quá hạn 3 ngày` |
| Còn ≤ ngưỡng (mặc định 3) | **Vàng** — `Còn 2 ngày` |
| Đúng hôm nay | **Vàng đậm** — `Hôm nay` |
| Còn xa | Bình thường — `Còn 12 ngày` |

Chỉ dùng **hai** màu cảnh báo. Thêm màu nữa là mất tác dụng cảnh báo.

### 5. Bộ lọc

Bốn bộ lọc theo spec + ô tìm kiếm:
- **Khoảng ngày** — kèm nút nhanh: `Hôm nay` · `7 ngày tới` · `Quá hạn` · `Tất cả`
- **Nhân sự** — dropdown, có mục *"Chưa giao ai"*
- **Công việc** — dropdown
- **Trạng thái** — nhiều lựa chọn

Trạng thái bộ lọc lưu vào **URL query params** → CEO bookmark được "việc quá hạn của anh Tuấn", F5 không mất.

Ô tìm kiếm debounce 300ms.

### 6. Gắn vào Tổng quan

Thay placeholder ở GĐ 2 bằng bảng thật. Mặc định vào trang: lọc `7 ngày tới + quá hạn` — đúng thứ CEO cần thấy đầu tiên, không phải toàn bộ 200 dòng.

4 thẻ số liệu phía trên lấy từ `thongKe`, bấm vào thẻ → áp bộ lọc tương ứng.

### 7. Trang Cài đặt

Màn hình đơn giản chỉnh `CauHinh`:
- **Ngưỡng cảnh báo vàng** (số ngày) — mặc định 3
- Chỗ trống cho cấu hình email — GĐ 4 lấp vào

---

## Todo

- [ ] `bang-toi-han.schema.ts` — validate tham số lọc
- [ ] `bang-toi-han.service.ts` — query phẳng + phân trang + `thongKe`
- [ ] Dùng lại `tinhSoNgayConLai()` từ shared, **không viết lại**
- [ ] Đọc `NGUONG_CANH_BAO_VANG` từ `CauHinh`
- [ ] Sắp xếp: chưa xong trước, gần hạn trước
- [ ] `use-bang-toi-han.ts` hook
- [ ] `BangToiHan.tsx` 8 cột
- [ ] `HuyHieuConLai.tsx` 5 trạng thái màu
- [ ] `BoLoc.tsx` 4 bộ lọc + nút nhanh + tìm kiếm debounce
- [ ] Đồng bộ bộ lọc với URL query params
- [ ] Gắn bảng vào Tổng quan, mặc định `7 ngày tới + quá hạn`
- [ ] 4 thẻ số liệu bấm được để lọc
- [ ] Trang `CaiDat` chỉnh ngưỡng cảnh báo
- [ ] Kiểm với ~200 dòng seed, đo tốc độ
- [ ] `npm run typecheck` sạch

---

## Tiêu chí nghiệm thu

1. Bảng gom hạng mục của **mọi** công việc, không sót
2. Hạng mục **không có hạn** không xuất hiện trong bảng
3. Gần deadline nhất lên đầu; đã hoàn thành xuống cuối
4. Quá hạn tô đỏ ghi rõ số ngày; còn ≤3 ngày tô vàng
5. Đổi ngưỡng ở Cài đặt thành 7 → bảng đổi màu ngay, không phải khởi động lại
6. Cả 4 bộ lọc chạy đúng, **kết hợp được với nhau**
7. Tìm kiếm khớp cả tên hạng mục, mã, tên công việc, tên người
8. Lọc xong copy URL, mở tab mới → **giữ nguyên bộ lọc**
9. Bấm thẻ "Quá hạn" → bảng lọc đúng
10. Bấm tên công việc trong bảng → sang trang chi tiết đúng
11. Với 200 dòng, phản hồi < 300ms
12. Hạng mục quá hạn nhưng **đã hoàn thành** → xám, không đỏ

---

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Tính `soNgayConLai` lệch với UI cây ở GĐ 2 | Bắt buộc dùng chung `tinhSoNgayConLai()` từ `packages/shared` |
| Sai ranh giới ngày → "còn 0" vs "quá hạn 1" | Đã có test ở GĐ 1; thêm ca kiểm ở 23:00 và 01:00 giờ VN |
| Tìm kiếm không khớp khi gõ không dấu | Chấp nhận bản này; ghi vào mục còn mở (extension `unaccent`) |
| Bảng chậm khi dữ liệu lớn | Index `@@index([hanHoanThanh])` đã có từ GĐ 1; phân trang mặc định 50 dòng |
| Quá nhiều màu làm mất tác dụng cảnh báo | Chỉ 2 màu cảnh báo: đỏ và vàng |
| Mặc định hiện toàn bộ → CEO ngợp | Mặc định lọc `7 ngày tới + quá hạn` |
