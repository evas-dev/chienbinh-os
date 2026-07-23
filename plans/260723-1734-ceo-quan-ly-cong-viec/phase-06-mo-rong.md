# GĐ 6 — Mở rộng: MCP server · Xuất Excel · Email nhắc hạn

**Ưu tiên:** Trung bình · **Trạng thái:** ⬜ Chưa bắt đầu · **Ước lượng:** 1.5–2 ngày · **Phụ thuộc:** GĐ 5

Ba tính năng ngoài spec gốc, CEO bổ sung trong buổi brainstorm. Làm **sau** khi bản đúng spec đã chạy được.

**Liên kết:** [plan.md](plan.md) · [Thiết kế mục 10b](reports/brainstorm-260723-thiet-ke-he-thong.md)

---

## Mục tiêu

1. **MCP server** — hỏi và điều khiển app bằng tiếng Việt qua Claude
2. **Xuất Excel** — bảng tới hạn ra file để in họp
3. **Email nhắc hạn** — tự nhắc nhân sự, giảm việc CEO phải đi đôn đốc

Ba phần **độc lập nhau**, làm theo thứ tự nào cũng được. Nếu cắt bớt, giữ MCP (giá trị cao nhất).

---

# 6A. MCP Server ⭐

## Vì sao đáng làm

Biến app thành thứ CEO hỏi bằng lời:
- *"Tuần này có gì sắp tới hạn?"*
- *"Anh Tuấn đang gánh bao nhiêu việc?"*
- *"Tạo công việc Xây kho B, 3 hạng mục: thiết kế 20%, thi công 60%, nghiệm thu 20%"*
- *"Công việc Xây kho A xong bao nhiêu phần trăm rồi?"*

Rẻ vì tầng REST API đã sạch — MCP chỉ là lớp vỏ mỏng.

## Quyết định kiến trúc

**Gọi qua REST API, KHÔNG gọi thẳng service layer.** Lý do:
- Một nguồn validation duy nhất (Zod ở API), không nhân đôi luật
- Chạy được cả khi app đã lên VPS — chỉ đổi `API_BASE_URL`
- MCP server không cần biết gì về Prisma

## File cần tạo

```
apps/mcp/
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts                  khởi tạo server, transport stdio
    ├── api.ts                   HTTP client gọi sang apps/api
    ├── tools/
    │   ├── doc/
    │   │   ├── bang-toi-han.tool.ts
    │   │   ├── liet-ke-cong-viec.tool.ts
    │   │   ├── chi-tiet-cong-viec.tool.ts
    │   │   ├── khoi-luong-nhan-su.tool.ts
    │   │   └── tim-nhan-su.tool.ts
    │   ├── ghi/
    │   │   ├── tao-cong-viec.tool.ts
    │   │   ├── tao-hang-muc.tool.ts
    │   │   ├── cap-nhat-tien-do.tool.ts
    │   │   └── tao-nhan-su.tool.ts
    │   └── index.ts             đăng ký theo cờ MCP_CHO_PHEP_GHI
    └── dinh-dang.ts             format kết quả cho người đọc
```

Backend bổ sung: `GET /api/nhan-su/:id/khoi-luong` — tổng hợp số hạng mục theo người (đang làm, quá hạn, sắp tới hạn, đã xong).

## 9 công cụ

| Tool | Loại | Công dụng |
|---|---|---|
| `bang_toi_han` | đọc | Việc sắp tới hạn, lọc theo ngày/người/công việc |
| `liet_ke_cong_viec` | đọc | Danh sách công việc + % + trạng thái |
| `chi_tiet_cong_viec` | đọc | Cả cây hạng mục kèm trọng số |
| `khoi_luong_nhan_su` | đọc | Ai đang gánh bao nhiêu việc |
| `tim_nhan_su` | đọc | Tra danh bạ |
| `tao_cong_viec` | **ghi** | Tạo công việc |
| `tao_hang_muc` | **ghi** | Tạo hạng mục (cha, trọng số, hạn, người phụ trách) |
| `cap_nhat_tien_do` | **ghi** | Cập nhật % hoặc tick |
| `tao_nhan_su` | **ghi** | Thêm nhân sự |

Mô tả tool viết bằng **tiếng Việt** để Claude hiểu ngữ cảnh và gọi đúng.

## An toàn

```ts
// Công tắc: tắt thì chỉ còn 5 tool đọc. Dùng khi muốn agent
// chỉ báo cáo, không được sửa dữ liệu.
MCP_CHO_PHEP_GHI=true
```

⚠️ **`tao_hang_muc` qua MCP KHÔNG kích hoạt gửi mail tự động** — tránh agent lỡ bắn mail hàng loạt cho nhân viên. Muốn gửi phải gọi riêng `POST /api/email/gui-giao-viec`. Ghi rõ điều này trong mô tả tool để Claude biết mà nhắc CEO.

## Định dạng kết quả

Trả **văn bản dễ đọc**, không phải JSON thô — Claude thuật lại tự nhiên hơn:
```
Sắp tới hạn (5 việc):
  🔴 [HM-0042] Hoàn thiện hồ sơ thầu — Xây kho B
     Quá hạn 3 ngày · Nguyễn Văn A · 60%
  🟡 [HM-0043] Nghiệm thu móng — Xây kho A
     Còn 2 ngày · Trần Thị B · 0%
```

## Cấu hình cho Claude Desktop / Claude Code

Ghi vào README:
```json
{
  "mcpServers": {
    "ceo-quanly": {
      "command": "node",
      "args": ["/Users/tuantoha/CEO quản lý/apps/mcp/dist/main.js"],
      "env": {
        "API_BASE_URL": "http://127.0.0.1:3001",
        "MCP_CHO_PHEP_GHI": "true"
      }
    }
  }
}
```
⚠️ Đường dẫn có dấu cách và dấu tiếng Việt — kiểm kỹ việc thoát chuỗi.

---

# 6B. Xuất Excel bảng tới hạn

## Các bước

`GET /api/bang-toi-han/xuat-excel` — **dùng lại đúng query params** của endpoint bảng tới hạn, xuất đúng tập đang lọc.

Dùng `exceljs`, sinh phía backend:
- Header tiếng Việt, in đậm, nền xám, cố định dòng đầu (freeze)
- Tô nền đỏ nhạt cho dòng quá hạn, vàng nhạt cho sắp tới hạn — **giống hệt trên web**
- Cột ngày định dạng `dd/mm/yyyy`
- Độ rộng cột tự động
- Tên file: `bang-toi-han-YYYYMMDD.xlsx`
- Dòng đầu ghi rõ bộ lọc đang áp dụng (để in ra biết đang xem cái gì)

Frontend: nút **"Xuất Excel"** cạnh bộ lọc, gọi kèm params hiện tại.

⚠️ Không phân trang khi xuất — lấy **toàn bộ** tập đã lọc, có giới hạn cứng 5000 dòng.

---

# 6C. Email nhắc deadline tự động

## Bảng mới

```prisma
model NhatKyNhacHan {
  id         String   @id @default(cuid())
  hangMucId  String
  hangMuc    HangMuc  @relation(fields: [hangMucId], references: [id], onDelete: Cascade)
  mocNhac    MocNhac  // TRUOC_HAN | DUNG_HAN | QUA_HAN_1 | QUA_HAN_2 | QUA_HAN_3
  guiLuc     DateTime @default(now())

  @@unique([hangMucId, mocNhac])   // ⭐ mỗi mốc chỉ gửi ĐÚNG MỘT LẦN
}
```

Ràng buộc `@@unique` là lớp chống spam ở tầng DB — kể cả cron chạy lỗi hay chạy trùng cũng không gửi lại được.

## Lịch nhắc

| Mốc | Điều kiện |
|---|---|
| `TRUOC_HAN` | Còn đúng N ngày (N = `NGUONG_CANH_BAO_VANG`) |
| `DUNG_HAN` | Đúng ngày tới hạn |
| `QUA_HAN_1/2/3` | Quá hạn 3 / 6 / 9 ngày — rồi **dừng hẳn** |

Chỉ nhắc hạng mục **chưa hoàn thành** và **có người phụ trách**.

## Các bước

`jobs/nhac-han.job.ts` chạy **1 lần/ngày lúc 8h sáng** (giờ VN) — không chạy theo giờ, tránh nhắc lúc nửa đêm.

Template nhắc **khác** template giao việc: ngắn hơn, nhấn số ngày còn lại, giọng nhẹ nhàng với mốc trước hạn và rõ ràng hơn với mốc quá hạn.

Công tắc `BAT_NHAC_HAN` trong Cài đặt, **mặc định TẮT** — CEO tự bật khi đã tin tưởng hệ thống. Bật/tắt được cả từng mốc.

⚠️ Dùng chung `tinhSoNgayConLai()` từ `packages/shared` (R3) — không viết lại logic ngày.

---

## Todo

### 6A — MCP
- [ ] Workspace `apps/mcp` + `@modelcontextprotocol/sdk`
- [ ] `api.ts` HTTP client + xử lý lỗi
- [ ] `GET /api/nhan-su/:id/khoi-luong` ở backend
- [ ] 5 tool đọc
- [ ] 4 tool ghi + cờ `MCP_CHO_PHEP_GHI`
- [ ] `tao_hang_muc` **không** kích hoạt gửi mail
- [ ] `dinh-dang.ts` định dạng dễ đọc
- [ ] Build ra `dist/`, hướng dẫn cấu hình Claude Desktop
- [ ] Thử thật 4 câu hỏi mẫu qua Claude

### 6B — Excel
- [ ] Cài `exceljs`
- [ ] `GET /api/bang-toi-han/xuat-excel` dùng lại params
- [ ] Tô màu giống web, freeze header, định dạng ngày
- [ ] Dòng đầu ghi bộ lọc đang áp dụng
- [ ] Nút "Xuất Excel" trên UI
- [ ] Giới hạn 5000 dòng

### 6C — Nhắc hạn
- [ ] Model `NhatKyNhacHan` + enum `MocNhac` + migration
- [ ] Template nhắc hạn riêng
- [ ] `nhac-han.job.ts` chạy 8h sáng giờ VN
- [ ] Công tắc `BAT_NHAC_HAN` mặc định TẮT
- [ ] Bật/tắt từng mốc trong Cài đặt
- [ ] Dùng chung `tinhSoNgayConLai()`

- [ ] Cập nhật README cho cả 3 tính năng
- [ ] `npm run typecheck` sạch

---

## Tiêu chí nghiệm thu

**MCP:**
1. Claude Desktop nhận đủ 9 tool sau khi cấu hình
2. Hỏi *"tuần này có gì sắp tới hạn?"* → trả kết quả thật từ DB
3. Hỏi *"anh Tuấn đang gánh bao nhiêu việc?"* → tổng hợp đúng
4. Bảo Claude tạo công việc kèm 3 hạng mục → xuất hiện trên web, trọng số đúng
5. `MCP_CHO_PHEP_GHI=false` → chỉ còn 5 tool đọc
6. Tạo hạng mục qua MCP → **không có mail nào được gửi**

**Excel:**
7. Lọc "quá hạn" rồi xuất → file chỉ chứa dòng quá hạn
8. Mở bằng Excel/Numbers → màu đúng, ngày đúng định dạng, header cố định
9. Dòng đầu ghi rõ bộ lọc đã dùng

**Nhắc hạn:**
10. Mặc định `BAT_NHAC_HAN=false` → không gửi gì
11. Bật lên, chạy job → đúng người nhận đúng mốc
12. Chạy job **2 lần cùng ngày** → không gửi trùng (ràng buộc `@@unique`)
13. Quá hạn 12 ngày → **không** gửi thêm (đã dừng sau mốc 3)
14. Hạng mục đã hoàn thành → không nhắc

---

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Agent tạo dữ liệu rác qua MCP | Cờ `MCP_CHO_PHEP_GHI`; mô tả tool nêu rõ nên xác nhận với CEO trước khi ghi |
| Agent lỡ bắn mail hàng loạt | `tao_hang_muc` qua MCP không gửi mail, phải gọi endpoint riêng |
| Đường dẫn MCP có dấu cách + tiếng Việt | Kiểm kỹ thoát chuỗi trong cấu hình JSON |
| MCP không chạy khi API tắt | Thông báo lỗi tiếng Việt rõ ràng: *"Chưa chạy npm run dev"* |
| Nhắc hạn gửi trùng | Ràng buộc `@@unique(hangMucId, mocNhac)` ở tầng DB |
| Nhắc hạn spam vô hạn khi quá hạn lâu | Dừng hẳn sau mốc `QUA_HAN_3` |
| Nhắc hạn gửi lúc nửa đêm | Chạy đúng 8h sáng giờ VN, không theo interval |
| Xuất Excel với dữ liệu lớn treo server | Giới hạn cứng 5000 dòng |
