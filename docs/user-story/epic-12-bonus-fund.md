# Epic 12 — Quỹ Thưởng

## Mục tiêu epic

Giúp Tổng Tư Lệnh cấu hình, kiểm tra và chốt quỹ thưởng minh bạch; giúp người có quyền hiểu công thức phân bổ, nguồn EXP và lịch sử quyết định trước khi chi trả.

## BON-01 — Xem cấu hình quỹ thưởng

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn xem giá trị quỹ và chu kỳ hiện tại, để biết cơ sở phân bổ thưởng đang áp dụng.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh đã đăng nhập, **when** mở trang Quỹ thưởng, **then** hệ thống hiển thị số tiền quỹ và số tháng của chu kỳ.
2. **Given** người dùng không phải Tổng Tư Lệnh, **when** truy cập trang hoặc dữ liệu quỹ, **then** hệ thống từ chối tại server/database.
3. **Given** cấu hình chưa tồn tại hoặc đọc lỗi, **when** mở trang, **then** hệ thống hiển thị lỗi rõ và không dùng số liệu gây hiểu nhầm.

### Quy tắc nghiệp vụ

- Quỹ thưởng là dữ liệu quản trị giới hạn cho Tổng Tư Lệnh.

## BON-02 — Cập nhật số tiền và chu kỳ quỹ

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn cập nhật số tiền và chu kỳ chia quỹ, để chính sách thưởng phản ánh quyết định điều hành hiện tại.

### Tiêu chí chấp nhận

1. **Given** người dùng có quyền, **when** nhập số tiền không âm và chọn chu kỳ hợp lệ, **then** hệ thống lưu cấu hình mới.
2. **Given** số tiền âm, không phải số hoặc chu kỳ không hợp lệ, **when** lưu, **then** hệ thống từ chối và nêu trường cần sửa.
3. **Given** người dùng gửi lặp cùng cấu hình, **when** thao tác được xử lý, **then** hệ thống không tạo nhiều phiên bản hiệu lực trùng nhau.

### Quy tắc nghiệp vụ

- Chu kỳ hiện hỗ trợ 3 hoặc 6 tháng.
- Không cho phép quỹ âm.

## BON-03 — Hiểu công thức phân bổ thưởng

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một Tổng Tư Lệnh, tôi muốn thấy công thức chia thưởng bằng ngôn ngữ dễ hiểu, để kiểm tra kết quả trước khi ra quyết định.

### Tiêu chí chấp nhận

1. **Given** trang Quỹ thưởng tải thành công, **when** xem phần giải thích, **then** hệ thống nêu thưởng mỗi người bằng tỷ lệ EXP của người đó nhân với tổng quỹ.
2. **Given** tổng EXP hợp lệ, **when** xem bảng, **then** tỷ lệ và số tiền của từng người khớp công thức hiển thị.
3. **Given** tổng EXP bằng 0, **when** xem phân bổ, **then** hệ thống hiển thị 0 thay vì chia cho 0 hoặc tạo số liệu sai.

### Quy tắc nghiệp vụ

- Quân hàm chỉ là danh vọng, không trực tiếp thay đổi tỷ lệ tiền thưởng.

## BON-04 — Xem bảng phân bổ dự kiến

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn xem phân bổ dự kiến theo từng nhân sự, để nhận biết chênh lệch và kiểm tra tổng tiền trước khi chốt.

### Tiêu chí chấp nhận

1. **Given** có nhân sự và EXP, **when** mở bảng phân bổ, **then** hệ thống hiển thị tên, đơn vị, EXP, tỷ lệ quỹ và số tiền dự kiến.
2. **Given** nhiều nhân sự có EXP khác nhau, **when** xem bảng, **then** danh sách được sắp theo EXP giảm dần.
3. **Given** số tiền được làm tròn để hiển thị, **when** cộng các khoản dự kiến, **then** hệ thống nêu rõ quy tắc xử lý phần chênh lệch làm tròn.

### Quy tắc nghiệp vụ

- Tổng phân bổ sau làm tròn không được vượt tổng quỹ.

## BON-05 — Xác định người đủ điều kiện trong kỳ

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn biết ai đủ điều kiện nhận thưởng trong kỳ, để không phân bổ cho người ngoài phạm vi hoặc sai thời gian.

### Tiêu chí chấp nhận

1. **Given** nhân sự hoạt động trong kỳ, **when** tính quỹ, **then** hệ thống chỉ dùng EXP phát sinh trong khoảng thời gian của kỳ.
2. **Given** nhân sự bị khóa hoặc rời công ty giữa kỳ, **when** xem phân bổ, **then** hệ thống áp dụng chính sách đủ điều kiện đã công bố và nêu lý do bao gồm hoặc loại trừ.
3. **Given** Tổng Tư Lệnh, **when** xem một khoản phân bổ, **then** hệ thống cho phép truy nguyên tới các bút toán EXP hợp lệ.

### Quy tắc nghiệp vụ

- `exp_log` là nguồn sự thật; không dùng trực tiếp tổng EXP trọn đời nếu kỳ thưởng có giới hạn thời gian.
- Chính sách nhân sự vào hoặc rời kỳ phải được chốt trước khi khóa kỳ.

## BON-06 — Khóa và chốt kỳ thưởng

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn khóa số liệu và chốt kỳ thưởng, để kết quả đã phê duyệt không thay đổi theo EXP phát sinh sau đó.

### Tiêu chí chấp nhận

1. **Given** kỳ còn mở, **when** xem phân bổ, **then** hệ thống ghi rõ đây là số dự kiến có thể thay đổi.
2. **Given** Tổng Tư Lệnh xác nhận chốt, **when** hoàn tất kiểm tra, **then** hệ thống lưu ảnh chụp số liệu, công thức và người phê duyệt.
3. **Given** kỳ đã chốt, **when** EXP mới phát sinh, **then** kết quả kỳ cũ không thay đổi và EXP được tính cho kỳ phù hợp tiếp theo.

### Quy tắc nghiệp vụ

- Chỉ Tổng Tư Lệnh được chốt hoặc mở lại kỳ.
- Mở lại kỳ phải có lý do và audit log.

## BON-07 — Xem lịch sử thay đổi quỹ

**Vai trò:** Tổng Tư Lệnh, Quản Trị Vận Hành được cấp quyền  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người kiểm soát quỹ, tôi muốn xem lịch sử thay đổi cấu hình, để giải trình ai đã đổi số tiền hoặc chu kỳ và khi nào.

### Tiêu chí chấp nhận

1. **Given** cấu hình quỹ từng thay đổi, **when** mở lịch sử, **then** hệ thống hiển thị giá trị trước, giá trị sau, người thay đổi, thời gian và lý do.
2. **Given** người không có quyền kiểm soát, **when** truy cập lịch sử, **then** hệ thống từ chối.
3. **Given** một thay đổi bị điều chỉnh lại, **when** xem lịch sử, **then** bản ghi cũ vẫn còn và không bị ghi đè.

### Quy tắc nghiệp vụ

- Audit log quỹ không được sửa hoặc xóa bởi người dùng thường.

## BON-08 — Phê duyệt danh sách chi trả

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn phê duyệt danh sách chi trả cuối kỳ, để phân biệt rõ số dự kiến với nghĩa vụ chi trả đã chốt.

### Tiêu chí chấp nhận

1. **Given** kỳ đã khóa và tổng phân bổ hợp lệ, **when** Tổng Tư Lệnh phê duyệt, **then** danh sách chuyển sang trạng thái đã phê duyệt.
2. **Given** tổng phân bổ vượt quỹ hoặc còn dữ liệu bất thường, **when** phê duyệt, **then** hệ thống chặn và liệt kê vấn đề cần xử lý.
3. **Given** danh sách đã phê duyệt, **when** có yêu cầu phê duyệt lặp, **then** hệ thống không tạo đợt chi trả trùng.

### Quy tắc nghiệp vụ

- Không ai được tự thay đổi khoản của chính mình ngoài công thức chung.
- Phê duyệt phải idempotent.

## BON-09 — Xuất bảng phân bổ có kiểm soát

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn xuất bảng phân bổ của kỳ, để đối soát và chuyển cho bộ phận chi trả mà không sao chép thủ công.

### Tiêu chí chấp nhận

1. **Given** người dùng có quyền và chọn một kỳ, **when** xuất báo cáo, **then** tệp chứa kỳ, công thức, người nhận, EXP hợp lệ, tỷ lệ và số tiền.
2. **Given** kỳ chưa chốt, **when** xuất, **then** tệp được đánh dấu rõ là “Dự kiến”.
3. **Given** người không có quyền, **when** gọi chức năng xuất, **then** hệ thống từ chối và không tạo tệp.

### Quy tắc nghiệp vụ

- Tệp xuất chỉ chứa dữ liệu cá nhân cần thiết cho mục đích chi trả.
- Mỗi lần xuất phải được ghi audit log.

## BON-10 — Thông báo kết quả thưởng minh bạch

**Vai trò:** Người đủ điều kiện nhận thưởng  
**Ưu tiên:** P2  
**Trạng thái:** Đề xuất

> Là một người đủ điều kiện nhận thưởng, tôi muốn được thông báo phần thưởng và cách tính của mình sau khi phê duyệt, để hiểu kết quả mà không thấy dữ liệu riêng của người khác.

### Tiêu chí chấp nhận

1. **Given** danh sách chi trả được phê duyệt, **when** thông báo được phát hành, **then** mỗi người nhận đúng khoản, tỷ lệ và kỳ của mình.
2. **Given** người dùng mở chi tiết, **when** xem cách tính, **then** hệ thống hiển thị EXP hợp lệ của họ, tổng mẫu số được phép công bố và công thức.
3. **Given** người dùng cố xem khoản cá nhân của người khác, **when** truy cập trực tiếp, **then** hệ thống từ chối.

### Quy tắc nghiệp vụ

- Không công bố tiền thưởng cá nhân trên feed toàn công ty nếu chưa có chính sách cho phép.
