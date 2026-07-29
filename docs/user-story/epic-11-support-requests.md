# Epic 11 — Yêu Cầu Hỗ Trợ

## Mục tiêu epic

Giúp mọi nhân sự gửi, theo dõi và xử lý yêu cầu hỗ trợ đúng người, đúng quyền, trong giới hạn tháng; đồng thời bảo vệ nội dung riêng tư và thông báo rõ khi trạng thái thay đổi.

## SUP-01 — Gửi yêu cầu hỗ trợ

**Vai trò:** Chiến Sỹ, Tư Lệnh, Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự, tôi muốn gửi yêu cầu hỗ trợ có nội dung rõ ràng, để vấn đề của tôi được chuyển tới người có thể giải quyết.

### Tiêu chí chấp nhận

1. **Given** người dùng đã đăng nhập và còn lượt trong tháng, **when** chọn loại, người nhận và nhập nội dung hợp lệ, **then** hệ thống tạo yêu cầu ở trạng thái chờ duyệt.
2. **Given** nội dung chỉ gồm khoảng trắng, **when** người dùng gửi, **then** hệ thống từ chối và yêu cầu nhập nội dung.
3. **Given** tài khoản đã bị khóa, **when** gửi yêu cầu, **then** hệ thống từ chối dù phiên đăng nhập cũ vẫn còn.

### Quy tắc nghiệp vụ

- Yêu cầu phải có loại, người gửi, người nhận và nội dung.
- Quyền tạo yêu cầu phải được kiểm tra tại server/database.

## SUP-02 — Chọn đúng loại và người nhận

**Vai trò:** Người gửi yêu cầu  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người gửi yêu cầu, tôi muốn chọn đúng loại hỗ trợ và người nhận phù hợp, để yêu cầu không bị chuyển sai nơi.

### Tiêu chí chấp nhận

1. **Given** người dùng chọn hỗ trợ từ quản lý, nghỉ phép hoặc đề xuất, **when** mở danh sách người nhận, **then** hệ thống chỉ hiển thị quản lý phù hợp.
2. **Given** người dùng chọn hỗ trợ từ nhân sự khác, **when** mở danh sách người nhận, **then** hệ thống hiển thị đồng nghiệp được phép và không hiển thị chính người gửi.
3. **Given** người nhận mặc định không còn hoạt động, **when** mở biểu mẫu, **then** hệ thống yêu cầu chọn người nhận hợp lệ khác.

### Quy tắc nghiệp vụ

- Người nhận mặc định ưu tiên lãnh đạo tiểu đội, sau đó tới Tổng Tư Lệnh.
- Không gửi yêu cầu tới tài khoản inactive.

## SUP-03 — Kiểm soát giới hạn yêu cầu theo tháng

**Vai trò:** Người gửi yêu cầu  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người gửi yêu cầu, tôi muốn biết số lượt còn lại trong tháng, để chủ động sử dụng quyền yêu cầu hợp lý.

### Tiêu chí chấp nhận

1. **Given** người dùng đã gửi ít hơn 4 yêu cầu trong tháng, **when** mở biểu mẫu, **then** hệ thống hiển thị số lượt còn lại.
2. **Given** người dùng đã đạt 4 yêu cầu trong tháng, **when** cố gửi thêm, **then** hệ thống từ chối tại server/database và nêu rõ đã hết hạn mức.
3. **Given** tháng mới bắt đầu theo giờ Việt Nam, **when** người dùng mở trang, **then** hạn mức được tính lại cho tháng mới.

### Quy tắc nghiệp vụ

- Mặc định mỗi người tối đa 4 yêu cầu/tháng, trừ khi cấu hình được thay đổi.
- Yêu cầu đã tạo vẫn được tính vào hạn mức dù sau đó bị hủy.
- Múi giờ tính tháng là `Asia/Ho_Chi_Minh`.

## SUP-04 — Theo dõi yêu cầu đã gửi

**Vai trò:** Người gửi yêu cầu  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người gửi yêu cầu, tôi muốn xem danh sách và trạng thái yêu cầu của mình, để biết yêu cầu đang chờ, đã duyệt hay bị từ chối.

### Tiêu chí chấp nhận

1. **Given** người dùng có yêu cầu đã gửi, **when** mở trang Yêu cầu hỗ trợ, **then** hệ thống hiển thị loại, người nhận, nội dung, ngày tạo và trạng thái.
2. **Given** người dùng không có yêu cầu, **when** mở danh sách, **then** hệ thống hiển thị trạng thái trống dễ hiểu.
3. **Given** truy vấn dữ liệu lỗi, **when** mở danh sách, **then** hệ thống hiển thị lỗi và không mô tả sai thành “chưa có yêu cầu”.

### Quy tắc nghiệp vụ

- Người dùng chỉ xem được yêu cầu do mình gửi hoặc gửi trực tiếp tới mình, trừ người có quyền giám sát.

## SUP-05 — Xem yêu cầu cần xử lý

**Vai trò:** Người nhận yêu cầu, Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người nhận yêu cầu, tôi muốn thấy các yêu cầu gửi tới mình, để xử lý kịp thời và đúng trách nhiệm.

### Tiêu chí chấp nhận

1. **Given** có yêu cầu gửi tới người dùng, **when** mở danh sách đến, **then** hệ thống hiển thị người gửi, loại, nội dung, ngày tạo và trạng thái.
2. **Given** yêu cầu gửi tới người khác, **when** người dùng thường truy cập trực tiếp, **then** hệ thống từ chối quyền xem.
3. **Given** Tổng Tư Lệnh cần giám sát, **when** xem yêu cầu trong toàn công ty, **then** hệ thống cho phép theo quyền được cấp.

### Quy tắc nghiệp vụ

- Tư Lệnh chỉ xem yêu cầu trong phạm vi quản lý hoặc gửi trực tiếp tới mình.
- Nội dung nhạy cảm không xuất hiện trên feed công khai.

## SUP-06 — Duyệt hoặc từ chối một lần

**Vai trò:** Người nhận yêu cầu, Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một người có thẩm quyền, tôi muốn duyệt hoặc từ chối yêu cầu một lần, để kết quả xử lý nhất quán và không bị thay đổi tùy tiện.

### Tiêu chí chấp nhận

1. **Given** yêu cầu đang chờ và gửi tới người xử lý, **when** người đó duyệt, **then** trạng thái chuyển thành đã duyệt.
2. **Given** yêu cầu đang chờ và gửi tới người xử lý, **when** người đó từ chối, **then** trạng thái chuyển thành từ chối.
3. **Given** yêu cầu đã được xử lý, **when** có thao tác lặp hoặc đồng thời, **then** hệ thống từ chối xử lý lại và giữ kết quả đầu tiên.

### Quy tắc nghiệp vụ

- Chỉ người nhận hoặc Tổng Tư Lệnh được phản hồi.
- Thao tác phản hồi phải idempotent.

## SUP-07 — Hủy yêu cầu đang chờ

**Vai trò:** Người gửi yêu cầu  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một người gửi yêu cầu, tôi muốn hủy yêu cầu chưa được xử lý, để loại bỏ yêu cầu không còn cần thiết hoặc gửi nhầm.

### Tiêu chí chấp nhận

1. **Given** yêu cầu do người dùng tạo và đang chờ, **when** chọn hủy, **then** hệ thống xóa hoặc đánh dấu hủy theo chính sách lưu vết.
2. **Given** yêu cầu đã duyệt hoặc từ chối, **when** người gửi chọn hủy, **then** hệ thống từ chối thao tác.
3. **Given** yêu cầu thuộc người khác, **when** người dùng cố hủy, **then** hệ thống từ chối quyền.

### Quy tắc nghiệp vụ

- Chỉ người gửi được hủy yêu cầu đang chờ.
- Hủy không hoàn lại hạn mức tháng đã sử dụng.

## SUP-08 — Nhận thông báo thay đổi trạng thái

**Vai trò:** Người gửi yêu cầu, Người nhận yêu cầu  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một bên tham gia yêu cầu, tôi muốn nhận thông báo khi yêu cầu được gửi, duyệt, từ chối hoặc hủy, để không phải kiểm tra thủ công liên tục.

### Tiêu chí chấp nhận

1. **Given** yêu cầu mới được tạo, **when** giao dịch hoàn tất, **then** người nhận được thông báo có liên kết tới yêu cầu.
2. **Given** yêu cầu được duyệt hoặc từ chối, **when** trạng thái thay đổi, **then** người gửi nhận đúng một thông báo.
3. **Given** gửi thông báo tạm thời thất bại, **when** người dùng mở danh sách, **then** trạng thái nghiệp vụ vẫn đúng và hệ thống có thể gửi lại mà không nhân đôi.

### Quy tắc nghiệp vụ

- Thông báo không được chứa toàn bộ nội dung nhạy cảm của yêu cầu.

## SUP-09 — Bảo vệ riêng tư nội dung hỗ trợ

**Vai trò:** Người gửi yêu cầu  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người gửi yêu cầu, tôi muốn nội dung hỗ trợ chỉ hiển thị cho người có trách nhiệm, để thông tin cá nhân hoặc công việc nhạy cảm không bị lộ.

### Tiêu chí chấp nhận

1. **Given** yêu cầu có nội dung nhạy cảm, **when** người không liên quan truy cập, **then** hệ thống không trả về dữ liệu.
2. **Given** nội dung chứa ký tự hoặc mã có thể gây hại, **when** hiển thị, **then** hệ thống hiển thị như văn bản an toàn và không thực thi mã.
3. **Given** người có quyền giám sát xem yêu cầu, **when** dữ liệu cá nhân không cần thiết, **then** hệ thống che hoặc lược bỏ theo phạm vi quyền.

### Quy tắc nghiệp vụ

- Không đưa nội dung yêu cầu lên feed toàn công ty.
- Không ghi nội dung nhạy cảm đầy đủ vào log lỗi.

## SUP-10 — Tiếp tục hành trình khi gặp lỗi hoặc trở ngại truy cập

**Vai trò:** Người dùng yêu cầu hỗ trợ  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn biểu mẫu dễ sử dụng và giữ được nội dung khi gặp lỗi tạm thời, để tôi không mất công nhập lại hoặc bị chặn bởi cách trình bày.

### Tiêu chí chấp nhận

1. **Given** người dùng thao tác bằng bàn phím hoặc trình đọc màn hình, **when** mở và gửi biểu mẫu, **then** mọi trường, lỗi và nút đều có tên và thứ tự điều hướng rõ ràng.
2. **Given** gửi yêu cầu thất bại do mạng hoặc dịch vụ, **when** hệ thống báo lỗi, **then** nội dung đã nhập được giữ lại để thử lại.
3. **Given** yêu cầu đã được tạo nhưng phản hồi tới giao diện bị gián đoạn, **when** người dùng thử lại, **then** hệ thống không tạo bản ghi trùng và hướng người dùng tới yêu cầu đã có.

### Quy tắc nghiệp vụ

- Lỗi hệ thống phải khác trạng thái không có dữ liệu.
- Khôi phục thao tác không được làm tăng sai hạn mức tháng.

## SUP-11 — Không tính điểm trong ngày nghỉ đã được duyệt

**Vai trò:** Nhân sự nghỉ phép, Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự đang nghỉ hợp lệ, tôi muốn hệ thống không cộng hoặc trừ điểm trong ngày nghỉ, để thành tích không bị ảnh hưởng trong ngày tôi không làm việc.

### Tiêu chí chấp nhận

1. **Given** yêu cầu nghỉ đã được duyệt và bao gồm ngày nghiệp vụ hiện tại, **when** phát sinh thao tác cộng EXP, điểm mùa hoặc điểm KPI cho nhân sự, **then** hệ thống bỏ hoàn toàn phần điểm phát sinh đó.
2. **Given** nhân sự đang trong ngày nghỉ được duyệt, **when** phát sinh thao tác xử phạt hoặc điều chỉnh giảm điểm, **then** hệ thống bỏ hoàn toàn phần điểm bị trừ.
3. **Given** thao tác nghiệp vụ có nội dung khác ngoài điểm, **when** được xử lý trong ngày nghỉ, **then** hệ thống vẫn có thể hoàn tất nội dung nghiệp vụ nhưng không tạo bút toán cộng hoặc trừ điểm cho nhân sự.
4. **Given** một biến động điểm bị bỏ do ngày nghỉ, **when** ngày nghỉ kết thúc, **then** hệ thống không cộng bù, không trừ bù và không chuyển biến động sang ngày làm việc tiếp theo.
5. **Given** biến động điểm bị bỏ, **when** người có quyền kiểm tra lịch sử, **then** audit ghi nguồn nghiệp vụ, nhân sự, ngày nghỉ và lý do “Không tính điểm do nghỉ đã được duyệt”.

### Quy tắc nghiệp vụ

- Chỉ ngày nghỉ đã được duyệt mới kích hoạt quy tắc không tính điểm.
- Ngày nghiệp vụ xác định theo múi giờ `Asia/Ho_Chi_Minh`.
- Điểm bị bỏ là vĩnh viễn: không lưu hàng chờ, không dời ngày và không tự động tính hồi tố.
- Không tạo bút toán trong `exp_log` cho phần điểm bị bỏ; audit log vẫn phải lưu quyết định bỏ điểm.
- Nếu quyết định nghỉ bị thay đổi sau đó, hệ thống không tự động khôi phục điểm; điều chỉnh ngoại lệ phải qua quy trình có thẩm quyền và audit riêng.
