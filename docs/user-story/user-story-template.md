# Mẫu User Story

## Công thức ngắn

> **Là một** `[vai trò]`, **tôi muốn** `[mục tiêu]`, **để** `[giá trị nhận được]`.

## Mẫu đầy đủ

```markdown
## US-XX-YY — Tên story

**Vai trò:** Vai trò sử dụng  
**Ưu tiên:** P0 | P1 | P2  
**Trạng thái:** Hiện có | Cần hoàn thiện | Đề xuất

> Là một [vai trò], tôi muốn [mục tiêu], để [giá trị].

### Tiêu chí chấp nhận

1. **Given** [điều kiện ban đầu], **when** [hành động], **then** [kết quả].
2. **Given** [điều kiện lỗi], **when** [hành động], **then** [phản hồi mong đợi].
3. **Given** [điều kiện quyền], **when** [hành động], **then** [hệ thống cho phép hoặc từ chối].

### Quy tắc nghiệp vụ

- Quy tắc hoặc giới hạn liên quan.
- Dữ liệu bắt buộc và ngoại lệ.
```

## Ví dụ

## US-MIS-01 — Xem nhiệm vụ được giao

**Vai trò:** Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một Chiến Sỹ, tôi muốn xem nhiệm vụ được giao, để biết công việc cần ưu tiên hoàn thành.

### Tiêu chí chấp nhận

1. **Given** Chiến Sỹ đã đăng nhập, **when** mở Bảng nhiệm vụ, **then** hệ thống hiển thị nhiệm vụ liên quan tới người đó.
2. **Given** nhiệm vụ có hạn hoàn thành, **when** xem chi tiết, **then** hệ thống hiển thị ngày hạn theo giờ Việt Nam.
3. **Given** không có nhiệm vụ, **when** mở trang, **then** hệ thống hiển thị trạng thái trống dễ hiểu.

### Quy tắc nghiệp vụ

- Chiến Sỹ không được xem nhiệm vụ riêng của người khác.
- Lỗi truy vấn không được hiển thị như trạng thái “không có dữ liệu”.

## Kiểm tra INVEST

- **Independent:** có thể phát triển và kiểm thử tương đối độc lập.
- **Negotiable:** giải pháp có thể trao đổi, giá trị không đổi.
- **Valuable:** mang lại giá trị rõ cho người dùng.
- **Estimable:** đủ thông tin để ước lượng.
- **Small:** đủ nhỏ cho một sprint.
- **Testable:** có kết quả quan sát và kiểm thử được.

## Lỗi thường gặp

- Viết task kỹ thuật thay vì nhu cầu người dùng.
- Story quá rộng, chứa nhiều hành trình không liên quan.
- Thiếu vai trò hoặc giá trị sau cùng.
- Tiêu chí chấp nhận mơ hồ như “hoạt động tốt”.
- Chỉ mô tả happy path, bỏ qua quyền và lỗi.

