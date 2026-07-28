# Epic 02 — Sở Chỉ Huy Và Hồ Sơ

## Mục tiêu epic

Cung cấp điểm vào phù hợp từng vai trò, giúp người dùng nắm tình hình công việc và thành tích cá nhân; giúp Tổng Tư Lệnh theo dõi toàn công ty bằng thông tin rõ, nhất quán và dễ tiếp cận.

## CMD-01 — Xem Sở chỉ huy cá nhân

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tư Lệnh hoặc Chiến Sỹ, **tôi muốn** xem tổng quan cá nhân sau khi đăng nhập, **để** biết vị trí, thành tích và công việc cần chú ý.

### Tiêu chí chấp nhận

1. **Given** người dùng đã đăng nhập, **when** mở Sở chỉ huy, **then** hệ thống hiển thị đúng tên, vai trò, đơn vị và mặt trận của người đó.
2. **Given** dữ liệu thành tích tồn tại, **when** trang tải xong, **then** hệ thống hiển thị EXP, điểm mùa, quân hàm và số huy hiệu đúng tài khoản.
3. **Given** người dùng không có quyền xem hồ sơ người khác, **when** thay đổi URL hoặc yêu cầu dữ liệu trực tiếp, **then** hệ thống không trả về dữ liệu ngoài phạm vi.

## CMD-02 — Xem tiến độ lên quân hàm

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> **Là một** người dùng, **tôi muốn** xem tiến độ tới quân hàm tiếp theo, **để** hiểu mình cần thêm bao nhiêu EXP.

### Tiêu chí chấp nhận

1. **Given** người dùng chưa đạt quân hàm cao nhất, **when** xem hồ sơ tóm tắt, **then** hệ thống hiển thị quân hàm hiện tại, mốc tiếp theo và EXP còn thiếu.
2. **Given** EXP thay đổi sau một phê duyệt, **when** người dùng tải lại Sở chỉ huy, **then** tiến độ phản ánh dữ liệu mới từ sổ cái EXP.
3. **Given** chưa có cấu hình quân hàm phù hợp, **when** trang hiển thị, **then** hệ thống dùng trạng thái an toàn, không hiển thị số âm hoặc lỗi kỹ thuật.

## CMD-03 — Xem nhiệm vụ cần làm hôm nay

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người thực hiện công việc, **tôi muốn** thấy nhiệm vụ ngày chưa hoàn thành ngay tại Sở chỉ huy, **để** ưu tiên hành động.

### Tiêu chí chấp nhận

1. **Given** có nhiệm vụ ngày chưa hoàn thành, **when** mở Sở chỉ huy, **then** hệ thống hiển thị các nhiệm vụ được giao cho chính người dùng.
2. **Given** không có nhiệm vụ ngày, **when** mở Sở chỉ huy, **then** hệ thống hiển thị trạng thái trống và hướng tới Bảng nhiệm vụ.
3. **Given** truy vấn nhiệm vụ gặp lỗi, **when** trang tải, **then** hệ thống không mô tả lỗi đó thành “chưa có nhiệm vụ”.

## CMD-04 — Xem thành tích và kỷ luật cá nhân

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> **Là một** người dùng, **tôi muốn** xem huy hiệu và lịch sử kỷ luật của mình, **để** hiểu thành tích và trách nhiệm cá nhân.

### Tiêu chí chấp nhận

1. **Given** người dùng có huy hiệu, **when** mở Sở chỉ huy, **then** hệ thống hiển thị đúng huy hiệu được cấp cho người đó.
2. **Given** người dùng có bản ghi kỷ luật, **when** xem thông tin, **then** hệ thống hiển thị nội dung được phép và không làm lộ hồ sơ của người khác.
3. **Given** không có huy hiệu hoặc kỷ luật, **when** mở từng khu vực, **then** hệ thống hiển thị trạng thái trống dễ hiểu.

## CMD-05 — Xem Sở chỉ huy toàn công ty

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** xem tổng quan toàn công ty, **để** phát hiện điểm mạnh, chậm tiến độ và cảnh báo cần xử lý.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh đã đăng nhập, **when** mở Sở chỉ huy, **then** hệ thống hiển thị chỉ số tổng hợp và tiến độ theo phòng ban.
2. **Given** có chỉ số dưới ngưỡng hoặc bất thường, **when** trang hiển thị, **then** cảnh báo được phân biệt rõ bằng chữ và ký hiệu, không chỉ bằng màu.
3. **Given** Tư Lệnh hoặc Chiến Sỹ cố mở dữ liệu toàn công ty, **when** gửi yêu cầu, **then** hệ thống từ chối tại server hoặc database.

## CMD-06 — Điều hướng theo vai trò

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người dùng, **tôi muốn** chỉ thấy khu vực phù hợp vai trò, **để** tập trung vào công việc được phép thực hiện.

### Tiêu chí chấp nhận

1. **Given** người dùng đã đăng nhập, **when** giao diện điều hướng hiển thị, **then** hệ thống chỉ đưa ra mục phù hợp với vai trò.
2. **Given** người dùng nhập trực tiếp URL ngoài quyền, **when** trang kiểm tra quyền, **then** hệ thống chặn truy cập thay vì chỉ ẩn nút.
3. **Given** vai trò tài khoản thay đổi, **when** người dùng truy cập lần tiếp theo, **then** điều hướng và quyền dữ liệu phản ánh vai trò mới.

## CMD-07 — Xem thông tin hồ sơ cá nhân

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> **Là một** người dùng, **tôi muốn** xem thông tin nhận diện và tổ chức của mình, **để** xác nhận hệ thống đang ghi nhận đúng hồ sơ.

### Tiêu chí chấp nhận

1. **Given** hồ sơ đầy đủ, **when** người dùng xem thông tin cá nhân, **then** tên, vai trò, phòng ban, mặt trận và tiểu đội được hiển thị đúng phạm vi.
2. **Given** trường tùy chọn chưa có dữ liệu, **when** hồ sơ hiển thị, **then** hệ thống dùng ký hiệu hoặc thông báo “chưa cập nhật”, không gây hiểu nhầm.
3. **Given** dữ liệu chứa ký tự đặc biệt, **when** hiển thị, **then** nội dung được xử lý an toàn và không thực thi mã ngoài ý muốn.

## CMD-08 — Đề nghị cập nhật hồ sơ cá nhân

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P2  
**Trạng thái:** Đề xuất

> **Là một** người dùng, **tôi muốn** đề nghị sửa thông tin hồ sơ không chính xác, **để** dữ liệu nhân sự được cập nhật qua quy trình có kiểm soát.

### Tiêu chí chấp nhận

1. **Given** người dùng phát hiện thông tin sai, **when** gửi đề nghị kèm nội dung cần sửa, **then** hệ thống ghi nhận yêu cầu và trạng thái xử lý.
2. **Given** người dùng cố tự đổi vai trò, trạng thái hoạt động hoặc EXP, **when** gửi đề nghị, **then** hệ thống không cho thay đổi trực tiếp các trường được bảo vệ.
3. **Given** đề nghị được chấp nhận hoặc từ chối, **when** người dùng xem lại, **then** hệ thống hiển thị kết quả và người xử lý theo quyền.

### Quy tắc nghiệp vụ

- Mọi thay đổi hồ sơ quan trọng phải có tác nhân, thời gian và giá trị trước/sau trong audit log.

## CMD-09 — Phân biệt trạng thái trống và lỗi dữ liệu

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> **Là một** người dùng, **tôi muốn** phân biệt khi chưa có dữ liệu và khi hệ thống gặp lỗi, **để** biết nên bắt đầu tạo dữ liệu hay thử lại sau.

### Tiêu chí chấp nhận

1. **Given** truy vấn thành công nhưng không có bản ghi, **when** khu vực hiển thị, **then** hệ thống đưa ra trạng thái trống phù hợp ngữ cảnh.
2. **Given** truy vấn thất bại, **when** khu vực hiển thị, **then** hệ thống báo không tải được dữ liệu và cung cấp cách thử lại.
3. **Given** chỉ một khu vực gặp lỗi, **when** trang tải, **then** các khu vực còn lại vẫn hiển thị nếu dữ liệu của chúng hợp lệ.

## CMD-10 — Sử dụng Sở chỉ huy trên nhiều thiết bị

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> **Là một** người dùng, **tôi muốn** Sở chỉ huy dễ đọc và thao tác trên điện thoại lẫn máy tính, **để** theo dõi công việc trong mọi bối cảnh.

### Tiêu chí chấp nhận

1. **Given** màn hình hẹp hoặc nội dung tên dài, **when** trang hiển thị, **then** thông tin không che nút, mất nội dung quan trọng hoặc buộc cuộn ngang không cần thiết.
2. **Given** người dùng dùng bàn phím hoặc công nghệ hỗ trợ, **when** duyệt các thẻ và hành động, **then** tiêu đề, trạng thái, tiến độ và nút có tên truy cập rõ.
3. **Given** dữ liệu thay đổi trên thiết bị khác, **when** người dùng tải lại, **then** trang hiển thị trạng thái mới nhất và không trộn dữ liệu cũ với dữ liệu mới.
