# Epic 14 — Thông Báo Và Nhắc Việc

## Mục tiêu epic

Giúp người dùng nhận đúng thông tin cần hành động, đúng thời điểm và đúng phạm vi; giảm bỏ sót nhiệm vụ, yêu cầu hỗ trợ và quyết định quan trọng mà không gây thông báo trùng hoặc quá tải.

## NOT-01 — Xem hộp thông báo cá nhân

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người dùng, tôi muốn xem hộp thông báo cá nhân, để biết những việc mới liên quan trực tiếp tới mình.

### Tiêu chí chấp nhận

1. **Given** người dùng đã đăng nhập, **when** mở hộp thông báo, **then** hệ thống hiển thị thông báo của chính người đó theo thứ tự mới trước.
2. **Given** người dùng không có thông báo, **when** mở hộp, **then** hệ thống hiển thị trạng thái trống dễ hiểu.
3. **Given** người dùng cố truy cập hộp của người khác, **when** gọi trực tiếp dữ liệu, **then** hệ thống từ chối tại server/database.

### Quy tắc nghiệp vụ

- Thông báo cá nhân không được đọc bằng quyền của người dùng khác.

## NOT-02 — Được báo khi có yêu cầu hỗ trợ mới

**Vai trò:** Người nhận yêu cầu hỗ trợ  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người nhận yêu cầu hỗ trợ, tôi muốn được báo khi có yêu cầu mới gửi tới, để phản hồi kịp thời.

### Tiêu chí chấp nhận

1. **Given** yêu cầu hỗ trợ được tạo thành công, **when** giao dịch hoàn tất, **then** người nhận có đúng một thông báo mới.
2. **Given** người nhận mở thông báo, **when** còn quyền xem yêu cầu, **then** hệ thống dẫn tới chi tiết phù hợp.
3. **Given** yêu cầu bị hủy trước khi người nhận mở, **when** mở thông báo, **then** hệ thống nêu yêu cầu đã hủy thay vì báo không tìm thấy mơ hồ.

### Quy tắc nghiệp vụ

- Thông báo chỉ hiển thị loại yêu cầu và người gửi; không lộ toàn bộ nội dung nhạy cảm.

## NOT-03 — Được báo kết quả yêu cầu hỗ trợ

**Vai trò:** Người gửi yêu cầu hỗ trợ  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người gửi yêu cầu, tôi muốn được báo khi yêu cầu được duyệt hoặc từ chối, để biết kết quả mà không phải kiểm tra thủ công.

### Tiêu chí chấp nhận

1. **Given** yêu cầu đang chờ, **when** người có quyền duyệt, **then** người gửi nhận thông báo đã duyệt.
2. **Given** yêu cầu đang chờ, **when** người có quyền từ chối, **then** người gửi nhận thông báo từ chối và lý do nếu nghiệp vụ yêu cầu.
3. **Given** phản hồi bị gửi lặp, **when** hệ thống xử lý, **then** người gửi không nhận thông báo trùng.

### Quy tắc nghiệp vụ

- Thông báo chỉ phát sau khi trạng thái nghiệp vụ đã lưu thành công.

## NOT-04 — Nhắc hạn nhiệm vụ

**Vai trò:** Người nhận nhiệm vụ  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người nhận nhiệm vụ, tôi muốn được nhắc trước hạn và khi quá hạn, để chủ động hoàn thành hoặc báo khó khăn.

### Tiêu chí chấp nhận

1. **Given** nhiệm vụ chưa hoàn thành và sắp tới hạn, **when** tới mốc nhắc đã cấu hình, **then** người nhận có thông báo nêu nhiệm vụ và hạn theo giờ Việt Nam.
2. **Given** nhiệm vụ đã hoàn thành hoặc bị hủy trước mốc nhắc, **when** tới mốc đó, **then** hệ thống không gửi nhắc không còn giá trị.
3. **Given** nhiệm vụ quá hạn, **when** lần đầu được xác định quá hạn, **then** người nhận và quản lý phù hợp nhận cảnh báo theo chính sách.

### Quy tắc nghiệp vụ

- Deadline dùng múi giờ `Asia/Ho_Chi_Minh` trên mọi kênh.
- Không gửi nhiều cảnh báo quá hạn giống nhau cho cùng một mốc.

## NOT-05 — Nhắc việc chờ duyệt

**Vai trò:** Tư Lệnh, Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người có trách nhiệm duyệt, tôi muốn được nhắc về kết quả nhiệm vụ, đề xuất khen và yêu cầu đang chờ, để không tạo điểm nghẽn cho nhân sự.

### Tiêu chí chấp nhận

1. **Given** có hồ sơ chờ duyệt quá thời gian quy định, **when** tới lịch nhắc, **then** người có quyền nhận bản tổng hợp số lượng và liên kết xử lý.
2. **Given** hồ sơ không thuộc phạm vi quản lý, **when** tạo nhắc, **then** hệ thống không đưa hồ sơ đó vào thông báo.
3. **Given** hồ sơ được xử lý trước khi mở nhắc, **when** người dùng truy cập, **then** hệ thống hiển thị trạng thái hiện tại.

### Quy tắc nghiệp vụ

- Không ai nhận nhắc để tự duyệt hồ sơ của chính mình.

## NOT-06 — Nhắc mốc KPI và kỳ thưởng

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người chịu trách nhiệm kết quả, tôi muốn được nhắc các mốc KPI và kỳ thưởng liên quan, để chuẩn bị dữ liệu và hành động đúng thời hạn.

### Tiêu chí chấp nhận

1. **Given** KPI sắp kết thúc kỳ, **when** tới mốc nhắc, **then** chủ sở hữu và quản lý phù hợp nhận thông báo tiến độ còn thiếu.
2. **Given** kỳ thưởng sắp khóa, **when** tới mốc nhắc, **then** Tổng Tư Lệnh nhận cảnh báo kiểm tra dữ liệu trước khi chốt.
3. **Given** người dùng không có quyền xem số liệu toàn công ty, **when** nhận nhắc, **then** thông báo chỉ chứa phạm vi cá nhân hoặc đơn vị được phép.

### Quy tắc nghiệp vụ

- Nhắc KPI không cho phép nhân sự tự sửa kết quả KPI.

## NOT-07 — Đánh dấu đã đọc và chưa đọc

**Vai trò:** Người nhận thông báo  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người nhận thông báo, tôi muốn đánh dấu đã đọc hoặc chưa đọc, để quản lý những việc cần quay lại.

### Tiêu chí chấp nhận

1. **Given** thông báo chưa đọc, **when** người dùng mở hoặc chọn đánh dấu đã đọc, **then** số lượng chưa đọc giảm tương ứng.
2. **Given** thông báo đã đọc, **when** chọn đánh dấu chưa đọc, **then** thông báo quay lại danh sách cần chú ý.
3. **Given** thao tác được gửi lặp, **when** hệ thống xử lý, **then** trạng thái cuối cùng nhất quán và không sai bộ đếm.

### Quy tắc nghiệp vụ

- Trạng thái đọc là riêng của từng người nhận.

## NOT-08 — Chọn loại thông báo muốn nhận

**Vai trò:** Người nhận thông báo  
**Ưu tiên:** P2  
**Trạng thái:** Đề xuất

> Là một người nhận thông báo, tôi muốn chọn loại thông báo không bắt buộc, để giảm nhiễu nhưng vẫn nhận cảnh báo quan trọng.

### Tiêu chí chấp nhận

1. **Given** người dùng mở cài đặt, **when** tắt một loại thông báo tùy chọn, **then** hệ thống ngừng gửi loại đó trên kênh tương ứng.
2. **Given** thông báo bắt buộc về bảo mật hoặc công việc khẩn cấp, **when** người dùng cố tắt, **then** hệ thống giải thích vì sao không thể tắt hoàn toàn.
3. **Given** người dùng đổi cài đặt, **when** đăng nhập trên thiết bị khác, **then** lựa chọn vẫn được áp dụng.

### Quy tắc nghiệp vụ

- Cài đặt không được làm mất thông báo bắt buộc theo chính sách vận hành hoặc an toàn.

## NOT-09 — Tránh thông báo trùng và quá tải

**Vai trò:** Người nhận thông báo  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người nhận thông báo, tôi muốn các thông báo giống nhau được gộp hợp lý, để tập trung vào hành động quan trọng.

### Tiêu chí chấp nhận

1. **Given** cùng một sự kiện được xử lý lại an toàn, **when** tạo thông báo, **then** người dùng chỉ nhận một bản cho cùng nguồn và loại.
2. **Given** nhiều việc cùng loại cần xử lý, **when** tới lịch nhắc, **then** hệ thống có thể gộp thành bản tổng hợp có số lượng và liên kết.
3. **Given** ngoài khung giờ yên lặng, **when** thông báo không khẩn cấp phát sinh, **then** hệ thống trì hoãn theo lựa chọn người dùng mà không làm mất thông báo.

### Quy tắc nghiệp vụ

- Cảnh báo bảo mật nghiêm trọng và sự cố dịch vụ không bị trì hoãn bởi giờ yên lặng.

## NOT-10 — Phục hồi khi gửi thông báo thất bại

**Vai trò:** Người nhận thông báo, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người dùng, tôi muốn thông báo quan trọng không bị mất khi dịch vụ tạm lỗi và vẫn dễ tiếp cận, để không bỏ sót hành động cần thiết.

### Tiêu chí chấp nhận

1. **Given** kênh gửi tạm thời lỗi, **when** thông báo quan trọng được tạo, **then** hệ thống giữ bản ghi và thử lại theo chính sách mà không nhân đôi.
2. **Given** việc thử lại vượt ngưỡng, **when** vẫn thất bại, **then** Quản Trị Vận Hành nhận cảnh báo và người dùng vẫn thấy thông báo trong ứng dụng.
3. **Given** người dùng dùng trình đọc màn hình, **when** có thông báo mới hoặc lỗi gửi, **then** nội dung, mức độ và hành động được diễn đạt bằng văn bản rõ ràng.

### Quy tắc nghiệp vụ

- Thất bại gửi thông báo không được rollback giao dịch nghiệp vụ đã thành công.
- Nội dung lỗi không được lộ bí mật hoặc thông tin nội bộ.
