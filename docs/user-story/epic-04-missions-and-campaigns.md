# Epic 04 — Nhiệm Vụ Và Chiến Dịch

## Mục tiêu epic

Cho phép Tổng Tư Lệnh mở chiến dịch, Tư Lệnh phân rã thành nhiệm vụ và người nhận theo dõi, tiếp nhận công việc trong đúng phạm vi, với trạng thái, thời hạn và giá trị thưởng minh bạch.

## MIS-01 — Xem Bảng nhiệm vụ được giao

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người nhận nhiệm vụ, **tôi muốn** xem các nhiệm vụ được giao cho mình, **để** biết công việc cần thực hiện.

### Tiêu chí chấp nhận

1. **Given** người dùng đã đăng nhập, **when** mở Bảng nhiệm vụ, **then** hệ thống chỉ hiển thị nhiệm vụ liên quan tới người đó.
2. **Given** có nhiệm vụ ở nhiều trạng thái, **when** danh sách hiển thị, **then** mỗi nhiệm vụ có trạng thái rõ ràng và nhất quán.
3. **Given** người dùng cố xem nhiệm vụ riêng của người khác qua URL hoặc yêu cầu trực tiếp, **when** hệ thống kiểm tra quyền, **then** dữ liệu bị từ chối.

## MIS-02 — Phân nhóm nhiệm vụ theo loại công việc

**Vai trò:** Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> **Là một** Chiến Sỹ, **tôi muốn** nhiệm vụ được phân nhóm theo tháng, cố định và phát sinh, **để** dễ chọn việc cần ưu tiên.

### Tiêu chí chấp nhận

1. **Given** có nhiều loại nhiệm vụ, **when** mở Bảng nhiệm vụ, **then** hệ thống đặt mỗi nhiệm vụ vào đúng nhóm nghiệp vụ.
2. **Given** một nhóm không có nhiệm vụ, **when** trang hiển thị, **then** nhóm trống không tạo khoảng trắng hoặc tiêu đề gây nhầm lẫn.
3. **Given** loại nhiệm vụ không hợp lệ, **when** dữ liệu được tải, **then** hệ thống không gán sai nhóm và báo lỗi phù hợp cho người có trách nhiệm.

## MIS-03 — Xem thông tin đầy đủ của nhiệm vụ

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người tham gia nhiệm vụ, **tôi muốn** xem mục tiêu, đơn vị, hạn và EXP, **để** hiểu điều kiện hoàn thành trước khi hành động.

### Tiêu chí chấp nhận

1. **Given** nhiệm vụ hợp lệ, **when** xem thẻ hoặc chi tiết, **then** hệ thống hiển thị người giao, người nhận, mục tiêu, đơn vị, hạn, EXP và trạng thái.
2. **Given** trường tùy chọn chưa được cấu hình, **when** nhiệm vụ hiển thị, **then** hệ thống dùng trạng thái “chưa có” rõ ràng, không tự đặt giá trị ngầm.
3. **Given** nội dung nhiệm vụ chứa ký tự đặc biệt, **when** hiển thị, **then** nội dung được xử lý an toàn và không thực thi mã ngoài ý muốn.

### Quy tắc nghiệp vụ

- Nhiệm vụ phải có người giao, người nhận, mục tiêu, đơn vị, hạn và EXP theo quy tắc đã chốt.

## MIS-04 — Tiếp nhận nhiệm vụ

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người được giao nhiệm vụ, **tôi muốn** xác nhận tiếp nhận, **để** thể hiện công việc đã bắt đầu.

### Tiêu chí chấp nhận

1. **Given** nhiệm vụ ở trạng thái chưa nhận và thuộc người dùng, **when** chọn Nhận nhiệm vụ, **then** trạng thái chuyển sang đang làm.
2. **Given** nhiệm vụ thuộc người khác hoặc không còn ở trạng thái chưa nhận, **when** gửi yêu cầu tiếp nhận, **then** hệ thống từ chối.
3. **Given** người dùng bấm nhiều lần trong lúc xử lý, **when** yêu cầu hoàn tất, **then** hệ thống chỉ ghi nhận một lần tiếp nhận và hiển thị trạng thái cuối đúng.

## MIS-05 — Mở chiến dịch cấp công ty

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** mở chiến dịch và giao cho Tư Lệnh, **để** chuyển mục tiêu công ty thành trách nhiệm quản lý cụ thể.

### Tiêu chí chấp nhận

1. **Given** dữ liệu chiến dịch hợp lệ, **when** Tổng Tư Lệnh xác nhận tạo, **then** hệ thống tạo chiến dịch và gán đúng Tư Lệnh.
2. **Given** người không phải Tổng Tư Lệnh, **when** cố tạo loại chiến dịch cấp công ty, **then** hệ thống từ chối.
3. **Given** tạo chiến dịch thất bại, **when** hệ thống phản hồi, **then** không có chiến dịch một phần và thông báo không lộ chi tiết nội bộ.

## MIS-06 — Giao nhiệm vụ cho Chiến Sỹ

**Vai trò:** Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tư Lệnh, **tôi muốn** giao nhiệm vụ cho Chiến Sỹ trong phạm vi quản lý, **để** phân công mục tiêu thành hành động cụ thể.

### Tiêu chí chấp nhận

1. **Given** Chiến Sỹ thuộc phạm vi quản lý và dữ liệu hợp lệ, **when** Tư Lệnh tạo nhiệm vụ, **then** nhiệm vụ được gán đúng người ở trạng thái chưa nhận.
2. **Given** người nhận ngoài phạm vi, **when** Tư Lệnh gửi yêu cầu, **then** hệ thống từ chối dù giao diện đã bị thay đổi.
3. **Given** Chiến Sỹ bị ngưng tài khoản, **when** Tư Lệnh cố giao nhiệm vụ mới, **then** hệ thống không cho giao và nêu lý do phù hợp.

## MIS-07 — Kiểm tra dữ liệu khi tạo nhiệm vụ

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> **Là một** người giao nhiệm vụ, **tôi muốn** dữ liệu được kiểm tra trước khi tạo, **để** người nhận có đủ thông tin thực hiện.

### Tiêu chí chấp nhận

1. **Given** thiếu tiêu đề, người nhận, mục tiêu, đơn vị, hạn hoặc EXP bắt buộc, **when** xác nhận tạo, **then** hệ thống từ chối và chỉ rõ trường cần sửa.
2. **Given** mục tiêu hoặc EXP âm, hạn không hợp lệ hay loại nhiệm vụ sai, **when** gửi yêu cầu, **then** hệ thống không tạo nhiệm vụ.
3. **Given** dữ liệu hợp lệ, **when** nhiệm vụ được tạo, **then** giá trị hiển thị sau lưu khớp với dữ liệu người giao đã xác nhận.

## MIS-08 — Liên kết nhiệm vụ với chiến dịch cha

**Vai trò:** Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> **Là một** Tư Lệnh, **tôi muốn** gắn nhiệm vụ con vào chiến dịch được giao, **để** theo dõi đóng góp của đội vào mục tiêu lớn.

### Tiêu chí chấp nhận

1. **Given** Tư Lệnh có chiến dịch được giao, **when** tạo nhiệm vụ con và chọn chiến dịch, **then** hệ thống lưu đúng quan hệ cha–con.
2. **Given** chiến dịch không thuộc phạm vi Tư Lệnh, **when** gửi liên kết trực tiếp, **then** hệ thống từ chối.
3. **Given** không chọn chiến dịch cha và nghiệp vụ cho phép nhiệm vụ độc lập, **when** tạo nhiệm vụ, **then** hệ thống lưu nhiệm vụ không có cha mà không phát sinh lỗi.

## MIS-09 — Giới hạn người nhận theo vai trò và phạm vi

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người giao nhiệm vụ, **tôi muốn** danh sách người nhận chỉ gồm đối tượng hợp lệ, **để** tránh giao sai cấp hoặc sai đơn vị.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh tạo chiến dịch, **when** chọn người nhận, **then** hệ thống cung cấp Tư Lệnh phù hợp.
2. **Given** Tư Lệnh tạo nhiệm vụ, **when** chọn người nhận, **then** hệ thống chỉ cung cấp Chiến Sỹ trong phạm vi được giao.
3. **Given** yêu cầu chứa người nhận không hợp lệ, **when** server xử lý, **then** hệ thống từ chối độc lập với danh sách trên giao diện.

## MIS-10 — Xem trạng thái trống của Bảng nhiệm vụ

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> **Là một** người dùng, **tôi muốn** biết khi chưa có nhiệm vụ hoặc chiến dịch, **để** không nhầm với lỗi tải dữ liệu.

### Tiêu chí chấp nhận

1. **Given** truy vấn thành công nhưng không có nhiệm vụ, **when** mở bảng, **then** hệ thống hiển thị trạng thái trống phù hợp vai trò.
2. **Given** người dùng có quyền tạo nhiệm vụ, **when** bảng trống, **then** hệ thống gợi ý hành động tạo phù hợp.
3. **Given** truy vấn thất bại, **when** trang tải, **then** hệ thống báo lỗi và cách thử lại, không hiển thị như trạng thái trống.

## MIS-11 — Hiển thị hạn nhiệm vụ thống nhất

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> **Là một** người tham gia nhiệm vụ, **tôi muốn** hạn hoàn thành hiển thị thống nhất theo giờ Việt Nam, **để** tránh hiểu sai thời điểm hết hạn.

### Tiêu chí chấp nhận

1. **Given** nhiệm vụ có deadline, **when** xem ở bất kỳ trang hoặc thiết bị nào, **then** hệ thống hiển thị cùng thời điểm theo `Asia/Ho_Chi_Minh`.
2. **Given** thời điểm qua nửa đêm giờ Việt Nam, **when** hệ thống xác định ngày hiện tại, **then** nhiệm vụ được phân loại theo ngày mới.
3. **Given** deadline không hợp lệ hoặc thiếu theo quy tắc bắt buộc, **when** tạo hay hiển thị, **then** hệ thống từ chối hoặc cảnh báo rõ, không tự suy đoán.

## MIS-12 — Bảo vệ nhiệm vụ khỏi truy cập trái quyền

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** hệ thống quản lý công việc, **tôi muốn** kiểm tra quyền trên mọi thao tác nhiệm vụ, **để** dữ liệu không bị đọc hoặc thay đổi ngoài phạm vi.

### Tiêu chí chấp nhận

1. **Given** người dùng chưa đăng nhập, **when** gọi hành động nhận, tạo hoặc xem nhiệm vụ, **then** hệ thống từ chối.
2. **Given** người dùng không phải người nhận hoặc người giao hợp lệ, **when** gọi hành động trực tiếp, **then** hệ thống không thay đổi dữ liệu.
3. **Given** tài khoản đã ngưng, **when** gửi thao tác nhiệm vụ, **then** hệ thống chặn dù phiên đăng nhập còn tồn tại.

## MIS-13 — Chống thao tác nhiệm vụ trùng và xung đột

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> **Là một** hệ thống quản lý công việc, **tôi muốn** xử lý an toàn các yêu cầu đồng thời, **để** trạng thái nhiệm vụ không bị ghi nhận trùng hoặc lùi sai.

### Tiêu chí chấp nhận

1. **Given** hai yêu cầu nhận cùng nhiệm vụ đến đồng thời, **when** hệ thống xử lý, **then** nhiệm vụ chỉ chuyển từ chưa nhận sang đang làm một lần.
2. **Given** dữ liệu nhiệm vụ đã thay đổi sau khi biểu mẫu được mở, **when** người dùng gửi thao tác dựa trên trạng thái cũ, **then** hệ thống từ chối xung đột và yêu cầu tải lại.
3. **Given** yêu cầu mạng được gửi lại, **when** thao tác trước đã thành công, **then** hệ thống không tạo nhiệm vụ hoặc sự kiện nghiệp vụ trùng.

## MIS-14 — Chỉnh sửa nhiệm vụ chưa bắt đầu

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> **Là một** người giao nhiệm vụ, **tôi muốn** sửa nhiệm vụ chưa được nhận, **để** khắc phục sai sót trước khi người nhận bắt đầu.

### Tiêu chí chấp nhận

1. **Given** nhiệm vụ do người dùng giao và còn ở trạng thái chưa nhận, **when** cập nhật dữ liệu hợp lệ, **then** hệ thống lưu thay đổi.
2. **Given** nhiệm vụ đã được nhận, nộp hoặc hoàn thành, **when** cố sửa thông tin ảnh hưởng kết quả, **then** hệ thống từ chối hoặc yêu cầu quy trình điều chỉnh riêng.
3. **Given** hai người sửa cùng lúc, **when** một bản đã được lưu trước, **then** bản còn lại nhận cảnh báo xung đột thay vì ghi đè im lặng.

## MIS-15 — Hủy nhiệm vụ không còn phù hợp

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> **Là một** người giao nhiệm vụ, **tôi muốn** hủy nhiệm vụ theo điều kiện rõ ràng, **để** người nhận không tiếp tục công việc đã mất giá trị.

### Tiêu chí chấp nhận

1. **Given** nhiệm vụ chưa có kết quả được duyệt, **when** người giao hủy và nhập lý do, **then** trạng thái chuyển thành đã hủy và người nhận thấy lý do.
2. **Given** nhiệm vụ đã hoàn thành hoặc có hệ quả thành tích, **when** yêu cầu hủy, **then** hệ thống không xóa trực tiếp và hướng tới quy trình thu hồi phù hợp.
3. **Given** người không phải người giao hoặc Tổng Tư Lệnh, **when** cố hủy, **then** hệ thống từ chối.

## MIS-16 — Theo dõi tiến độ chiến dịch và lịch sử thay đổi

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> **Là một** người quản lý chiến dịch, **tôi muốn** xem tiến độ tổng hợp và lịch sử thay đổi, **để** đánh giá đóng góp của các nhiệm vụ con và truy vết quyết định.

### Tiêu chí chấp nhận

1. **Given** chiến dịch có nhiệm vụ con, **when** xem chi tiết, **then** hệ thống tổng hợp tiến độ theo quy tắc đã chốt và không tính trùng.
2. **Given** nhiệm vụ con hoàn thành hoặc bị thu hồi, **when** dữ liệu cập nhật, **then** tiến độ chiến dịch phản ánh đúng trạng thái mới.
3. **Given** nhiệm vụ hoặc chiến dịch được tạo, sửa, hủy hay đổi trạng thái quan trọng, **when** người có quyền xem audit, **then** hệ thống hiển thị tác nhân, thời gian, đối tượng và lý do nếu có.

### Quy tắc nghiệp vụ

- Nhiệm vụ hoàn thành phải phản ánh đúng tiến độ mục tiêu liên quan; audit log không cho người dùng thường sửa hoặc xóa.
