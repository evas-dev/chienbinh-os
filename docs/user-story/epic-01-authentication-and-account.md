# Epic 01 — Đăng Nhập Và Tài Khoản

## Mục tiêu epic

Bảo đảm người dùng nội bộ truy cập Chiến Binh OS bằng tài khoản được cấp, phiên đăng nhập an toàn, quyền bị thu hồi đúng lúc và không lộ thông tin nhạy cảm khi có lỗi.

## AUTH-01 — Đăng nhập bằng số điện thoại

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người dùng nội bộ, **tôi muốn** đăng nhập bằng số điện thoại và mật khẩu, **để** truy cập đúng không gian làm việc của mình.

### Tiêu chí chấp nhận

1. **Given** tài khoản đang hoạt động và thông tin đúng, **when** người dùng đăng nhập, **then** hệ thống mở Sở chỉ huy theo vai trò của người đó.
2. **Given** biểu mẫu đăng nhập đang hiển thị, **when** người dùng di chuyển bằng bàn phím, **then** các trường và nút đăng nhập có nhãn, thứ tự focus rõ ràng.
3. **Given** yêu cầu đăng nhập đang xử lý, **when** người dùng bấm gửi lại, **then** hệ thống không tạo nhiều yêu cầu đăng nhập đồng thời và hiển thị trạng thái đang xác thực.

### Quy tắc nghiệp vụ

- Đăng nhập dùng số điện thoại và mật khẩu; không yêu cầu người dùng biết địa chỉ email nội bộ.

## AUTH-02 — Kiểm tra dữ liệu đăng nhập bắt buộc

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người dùng nội bộ, **tôi muốn** được báo rõ khi thiếu thông tin đăng nhập, **để** sửa dữ liệu trước khi gửi lại.

### Tiêu chí chấp nhận

1. **Given** số điện thoại để trống, **when** người dùng gửi biểu mẫu, **then** hệ thống yêu cầu nhập số điện thoại.
2. **Given** mật khẩu để trống, **when** người dùng gửi biểu mẫu, **then** hệ thống yêu cầu nhập mật khẩu.
3. **Given** dữ liệu chỉ chứa khoảng trắng, **when** người dùng gửi biểu mẫu, **then** hệ thống coi dữ liệu là trống và không thực hiện đăng nhập.

## AUTH-03 — Nhận phản hồi khi thông tin đăng nhập sai

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người dùng nội bộ, **tôi muốn** nhận thông báo dễ hiểu khi đăng nhập thất bại, **để** thử lại mà không bị lộ thông tin bảo mật.

### Tiêu chí chấp nhận

1. **Given** số điện thoại hoặc mật khẩu sai, **when** người dùng đăng nhập, **then** hệ thống báo thông tin đăng nhập không đúng.
2. **Given** số điện thoại không tồn tại, **when** người dùng đăng nhập, **then** thông báo không xác nhận tài khoản đó có tồn tại hay không.
3. **Given** dịch vụ xác thực gặp lỗi, **when** đăng nhập thất bại, **then** hệ thống không hiển thị SQL, stack trace, khóa bí mật hoặc chi tiết nội bộ.

## AUTH-04 — Chặn tài khoản đã ngưng hoạt động

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** tài khoản bị ngưng mất quyền truy cập ngay, **để** bảo vệ dữ liệu khi nhân sự không còn được phép sử dụng hệ thống.

### Tiêu chí chấp nhận

1. **Given** tài khoản đã bị ngưng, **when** người dùng đăng nhập hoặc mở trang nội bộ, **then** hệ thống không cho đọc hay thay đổi dữ liệu.
2. **Given** tài khoản đang có phiên đăng nhập, **when** Tổng Tư Lệnh ngưng tài khoản, **then** lần truy cập tiếp theo bị chặn dù phiên cũ chưa hết hạn.
3. **Given** người dùng bị chặn, **when** hệ thống phản hồi, **then** thông báo không tiết lộ dữ liệu nội bộ và hướng người dùng liên hệ cấp có thẩm quyền.

### Quy tắc nghiệp vụ

- Trạng thái tài khoản phải được kiểm tra phía server hoặc database, không chỉ tại giao diện.

## AUTH-05 — Đăng xuất khỏi hệ thống

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người dùng đã đăng nhập, **tôi muốn** đăng xuất, **để** kết thúc phiên sử dụng trên thiết bị hiện tại.

### Tiêu chí chấp nhận

1. **Given** người dùng đang ở trang nội bộ, **when** chọn Đăng xuất, **then** hệ thống kết thúc phiên và đưa về trang đăng nhập.
2. **Given** người dùng đã đăng xuất, **when** dùng nút quay lại hoặc mở URL nội bộ cũ, **then** hệ thống không hiển thị dữ liệu được bảo vệ.
3. **Given** yêu cầu đăng xuất được gửi lặp, **when** hệ thống xử lý, **then** kết quả vẫn là một phiên đã kết thúc và không phát sinh lỗi gây nhầm lẫn.

## AUTH-06 — Duy trì và bảo vệ phiên đăng nhập

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> **Là một** người dùng đã xác thực, **tôi muốn** phiên đăng nhập được duy trì an toàn giữa các trang, **để** làm việc liên tục mà vẫn được bảo vệ khi phiên hết hiệu lực.

### Tiêu chí chấp nhận

1. **Given** phiên còn hiệu lực, **when** người dùng tải lại hoặc chuyển trang, **then** hệ thống giữ trạng thái đăng nhập đúng.
2. **Given** phiên hết hạn hoặc không hợp lệ, **when** người dùng mở trang nội bộ, **then** hệ thống đưa về đăng nhập và không hiển thị dữ liệu cũ.
3. **Given** cùng tài khoản mở nhiều tab, **when** đăng xuất ở một tab, **then** các tab khác bị chặn ở lần tương tác hoặc tải dữ liệu tiếp theo.

## AUTH-07 — Ngăn đăng ký tài khoản công khai

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** hệ thống không cho người ngoài tự đăng ký, **để** chỉ nhân sự được phê duyệt mới có tài khoản.

### Tiêu chí chấp nhận

1. **Given** khách chưa đăng nhập, **when** truy cập ứng dụng, **then** chỉ có lựa chọn đăng nhập, không có đăng ký công khai.
2. **Given** người dùng không có quyền quản trị, **when** cố tạo tài khoản qua URL hoặc yêu cầu trực tiếp, **then** hệ thống từ chối.
3. **Given** tài khoản mới cần được cấp, **when** thực hiện đúng quy trình, **then** chỉ Tổng Tư Lệnh có thể tạo tài khoản.

## AUTH-08 — Đổi mật khẩu cá nhân

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> **Là một** người dùng đã đăng nhập, **tôi muốn** đổi mật khẩu của mình, **để** bảo vệ tài khoản khi mật khẩu cũ không còn an toàn.

### Tiêu chí chấp nhận

1. **Given** mật khẩu hiện tại đúng và mật khẩu mới hợp lệ, **when** người dùng xác nhận đổi, **then** hệ thống cập nhật mật khẩu và báo thành công.
2. **Given** mật khẩu hiện tại sai hoặc mật khẩu mới không đạt yêu cầu, **when** người dùng xác nhận, **then** hệ thống từ chối và nêu cách sửa.
3. **Given** hai yêu cầu đổi mật khẩu đến gần như đồng thời, **when** một yêu cầu thành công trước, **then** yêu cầu còn lại được đánh giá theo trạng thái mới và không ghi đè ngoài ý muốn.

### Quy tắc nghiệp vụ

- Mật khẩu không được hiển thị lại, ghi vào audit payload hoặc log nghiệp vụ.

## AUTH-09 — Khôi phục quyền truy cập khi quên mật khẩu

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> **Là một** người dùng quên mật khẩu, **tôi muốn** có quy trình khôi phục được kiểm soát, **để** lấy lại quyền truy cập mà không cần tạo tài khoản mới.

### Tiêu chí chấp nhận

1. **Given** người dùng yêu cầu khôi phục, **when** cung cấp số điện thoại, **then** hệ thống không tiết lộ số đó có tài khoản hay không.
2. **Given** yêu cầu được xác minh bởi kênh hoặc người có thẩm quyền, **when** đặt mật khẩu mới, **then** mật khẩu cũ không còn sử dụng được.
3. **Given** mã hoặc liên kết khôi phục hết hạn hay đã dùng, **when** người dùng thử lại, **then** hệ thống từ chối và hướng dẫn tạo yêu cầu mới.

## AUTH-10 — Theo dõi sự kiện bảo mật tài khoản

**Vai trò:** Quản Trị Vận Hành, Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> **Là một** người giám sát được cấp quyền, **tôi muốn** xem lịch sử sự kiện bảo mật tài khoản, **để** phát hiện truy cập bất thường và truy vết thay đổi quan trọng.

### Tiêu chí chấp nhận

1. **Given** có sự kiện đăng nhập, đăng xuất, đổi mật khẩu hoặc khóa tài khoản, **when** sự kiện hoàn tất, **then** hệ thống ghi thời gian, tác nhân, loại sự kiện và kết quả phù hợp.
2. **Given** người dùng thường, **when** cố xem hoặc sửa nhật ký bảo mật, **then** hệ thống từ chối theo quyền.
3. **Given** ghi audit gặp lỗi, **when** thao tác bảo mật quan trọng được thực hiện, **then** hệ thống xử lý theo chính sách an toàn và không giả báo thành công khi cần audit bắt buộc.

### Quy tắc nghiệp vụ

- Audit log không cho người dùng thường sửa hoặc xóa; không lưu mật khẩu, token hoặc khóa bí mật.
