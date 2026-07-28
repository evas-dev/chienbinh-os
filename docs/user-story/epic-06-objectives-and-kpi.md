# Epic 06 — Mục Tiêu Và KPI

## Mục tiêu Epic

Giúp cấp chỉ huy giao mục tiêu đúng phạm vi, giúp người thực hiện hiểu cách đo kết quả, và bảo đảm mọi thay đổi KPI có lịch sử minh bạch, công bằng, có thể đối soát hoặc hoàn tác khi sai.

## KPI-01 — Xem KPI thuộc phạm vi của mình

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một người dùng, tôi muốn xem KPI liên quan tới trách nhiệm của mình, để biết mục tiêu cần theo dõi mà không thấy dữ liệu ngoài thẩm quyền.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh đã đăng nhập, **when** mở Mục tiêu tháng, **then** hệ thống hiển thị KPI toàn công ty.
2. **Given** Tư Lệnh đã đăng nhập, **when** mở Mục tiêu tháng, **then** hệ thống chỉ hiển thị mục tiêu được giao cho mình và phạm vi mình quản lý.
3. **Given** Chiến Sỹ đã đăng nhập, **when** xem mục tiêu liên quan, **then** hệ thống không hiển thị KPI riêng của đơn vị khác.

### Quy tắc nghiệp vụ

- Tài khoản inactive không được xem KPI.
- Quyền xem tuân theo phạm vi tổ chức đang có hiệu lực.

## KPI-02 — Giao chỉ tiêu KPI theo kỳ

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn giao chỉ tiêu KPI cho người chịu trách nhiệm theo tháng và năm, để mục tiêu công ty có chủ sở hữu rõ ràng.

### Tiêu chí chấp nhận

1. **Given** người nhận thuộc phạm vi công ty và đang hoạt động, **when** Tổng Tư Lệnh nhập chỉ tiêu hợp lệ, **then** hệ thống lưu mục tiêu với chủ sở hữu, kỳ, đơn vị, mục tiêu và trọng số.
2. **Given** tổng trọng số hoặc giá trị mục tiêu không hợp lệ, **when** gửi giao KPI, **then** hệ thống từ chối và nêu rõ nội dung cần sửa.
3. **Given** người gửi không có quyền hoặc chọn chính mình trong nghiệp vụ bị cấm, **when** giao KPI, **then** hệ thống từ chối và ghi nhận lần thử không hợp lệ.

### Quy tắc nghiệp vụ

- KPI phải gắn với tháng, năm và chủ sở hữu.
- Chỉ tiêu tự cập nhật phải có khóa đo lường rõ ràng.

## KPI-03 — Bẻ mục tiêu thành nhiệm vụ thực hiện

**Vai trò:** Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một Tư Lệnh, tôi muốn chuyển mục tiêu được giao thành nhiệm vụ cụ thể cho Chiến Sỹ, để đội ngũ biết việc cần làm hằng ngày.

### Tiêu chí chấp nhận

1. **Given** Tư Lệnh có mục tiêu đang hiệu lực, **when** chọn mẫu hoặc tạo nhiệm vụ phù hợp, **then** hệ thống cho phép giao cho Chiến Sỹ thuộc phạm vi quản lý.
2. **Given** phạm vi không có Chiến Sỹ phù hợp, **when** Tư Lệnh muốn giao nhiệm vụ, **then** hệ thống hiển thị trạng thái trống và hướng xử lý dễ hiểu.
3. **Given** người nhận nằm ngoài phạm vi, **when** Tư Lệnh gửi giao nhiệm vụ, **then** hệ thống từ chối dù người đó xuất hiện từ dữ liệu cũ.

### Quy tắc nghiệp vụ

- Nhiệm vụ phát sinh phải truy vết được về mục tiêu hoặc chỉ tiêu nguồn khi có liên kết.
- Tư Lệnh không được dùng việc bẻ mục tiêu để giao ngoài phạm vi.

## KPI-04 — Theo dõi tiến độ KPI có trọng số

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một người chịu trách nhiệm KPI, tôi muốn xem tiến độ từng chỉ tiêu và tiến độ tổng hợp có trọng số, để biết mức hoàn thành thực tế.

### Tiêu chí chấp nhận

1. **Given** KPI có nhiều chỉ tiêu, **when** mở chi tiết, **then** hệ thống hiển thị kết quả hiện tại, mục tiêu, đơn vị, trọng số và tỷ lệ hoàn thành từng chỉ tiêu.
2. **Given** một chỉ tiêu vượt mục tiêu, **when** tính tiến độ hoàn thành chuẩn, **then** phần đóng góp của chỉ tiêu không làm sai công thức tổng hợp đã công bố.
3. **Given** chỉ tiêu có mục tiêu bằng không hoặc thiếu dữ liệu, **when** tính tiến độ, **then** hệ thống không hiển thị kết quả sai và cảnh báo dữ liệu cần xử lý.

### Quy tắc nghiệp vụ

- Công thức tổng hợp phải nhất quán trong mọi màn hình.
- Người xem phải biết dữ liệu được cập nhật đến thời điểm nào.

## KPI-05 — Cập nhật kết quả từ nguồn nghiệp vụ

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Hệ Thống, tôi muốn cập nhật kết quả KPI từ các nghiệp vụ đã được xác nhận, để số liệu phản ánh công việc thực tế mà nhân sự không tự sửa.

### Tiêu chí chấp nhận

1. **Given** kết quả nhiệm vụ liên kết KPI được duyệt, **when** nghiệp vụ hoàn tất, **then** kết quả KPI tăng đúng chỉ tiêu và đúng đơn vị.
2. **Given** cùng một kết quả được gửi lại, **when** hệ thống xử lý lần nữa, **then** KPI không bị cộng trùng.
3. **Given** nguồn dữ liệu bị từ chối hoặc thu hồi, **when** cập nhật KPI, **then** hệ thống giữ hoặc hoàn tác số liệu theo trạng thái cuối cùng hợp lệ.

### Quy tắc nghiệp vụ

- Chiến Sỹ không được tự sửa kết quả KPI.
- Mỗi thay đổi phải có nguồn tham chiếu và lý do.

## KPI-06 — Ngăn KPI và chỉ tiêu trùng

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Hệ Thống, tôi muốn phát hiện dữ liệu KPI trùng trong cùng kỳ và cùng nguồn, để báo cáo không bị nhân đôi.

### Tiêu chí chấp nhận

1. **Given** đã có KPI của một chủ sở hữu trong cùng tháng và năm, **when** tạo lại cùng bộ nhận diện, **then** hệ thống cảnh báo bản ghi đã tồn tại thay vì tạo mới âm thầm.
2. **Given** yêu cầu giao chỉ tiêu bị gửi lặp do mất kết nối, **when** hệ thống nhận lại, **then** chỉ có một kết quả nghiệp vụ được ghi nhận.
3. **Given** hai chỉ tiêu giống tên nhưng khác mục đích đo hợp lệ, **when** người có quyền xác nhận, **then** hệ thống cho phép và giữ thông tin phân biệt rõ ràng.

### Quy tắc nghiệp vụ

- Dữ liệu trùng được xác định theo chủ sở hữu, kỳ, khóa đo lường và nguồn tham chiếu.
- Không tự gộp hai chỉ tiêu nếu chưa có xác nhận nghiệp vụ.

## KPI-07 — Xem lịch sử KPI theo kỳ

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn xem KPI hiện tại và các kỳ trước theo quyền, để đánh giá xu hướng và đối chiếu cam kết cũ.

### Tiêu chí chấp nhận

1. **Given** có nhiều kỳ KPI, **when** chọn tháng và năm, **then** hệ thống hiển thị đúng mục tiêu và kết quả của kỳ đó.
2. **Given** kỳ được chọn không có KPI, **when** xem, **then** hệ thống hiển thị trạng thái trống thay vì lấy nhầm kỳ gần nhất.
3. **Given** người dùng không có quyền xem kỳ của người khác, **when** mở bằng đường dẫn trực tiếp, **then** hệ thống từ chối truy cập.

### Quy tắc nghiệp vụ

- Kỳ đã chốt phải giữ nguyên ảnh chụp số liệu dùng để đánh giá.
- Ngày giờ hiển thị theo `Asia/Ho_Chi_Minh`.

## KPI-08 — Điều chỉnh hoặc hoàn tác KPI sai

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn điều chỉnh hoặc hoàn tác KPI bị giao sai, để sửa lỗi mà không làm mất lịch sử quyết định.

### Tiêu chí chấp nhận

1. **Given** KPI chưa chốt kỳ và chưa phát sinh kết quả, **when** chỉnh thông tin hợp lệ, **then** hệ thống áp dụng giá trị mới và lưu lý do thay đổi.
2. **Given** KPI đã phát sinh kết quả hoặc ảnh hưởng đánh giá, **when** yêu cầu hoàn tác, **then** hệ thống yêu cầu xác nhận tác động trước khi thực hiện.
3. **Given** hoàn tác thành công, **when** xem lịch sử, **then** hệ thống hiển thị giá trị trước, giá trị sau, người thực hiện và lý do.

### Quy tắc nghiệp vụ

- Không xóa cứng KPI đã phát sinh nghiệp vụ.
- Hoàn tác phải đảo các ảnh hưởng liên quan theo thứ tự an toàn.

## KPI-09 — Đối soát sổ cái thay đổi KPI

**Vai trò:** Tổng Tư Lệnh, Quản Trị Vận Hành  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người có thẩm quyền, tôi muốn xem sổ cái tăng giảm của từng chỉ tiêu, để giải thích được số kết quả hiện tại hình thành từ đâu.

### Tiêu chí chấp nhận

1. **Given** chỉ tiêu có nhiều lần cập nhật, **when** mở sổ cái, **then** hệ thống liệt kê từng biến động, nguồn, thời gian và người tạo theo thứ tự.
2. **Given** một biến động đã được hoàn tác, **when** đối soát, **then** cả bút toán gốc và bút toán đảo đều còn hiển thị.
3. **Given** người dùng không có quyền vận hành, **when** yêu cầu xem dữ liệu nhạy cảm, **then** hệ thống chỉ hiển thị mức thông tin được phép hoặc từ chối.

### Quy tắc nghiệp vụ

- Số hiện tại phải đối chiếu được từ sổ cái.
- Không sửa hoặc xóa bút toán đã ghi nhận.

## KPI-10 — Bảo đảm đánh giá KPI công bằng

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn các KPI dùng quy tắc đo và trọng số minh bạch, để các cá nhân và đơn vị được đánh giá công bằng.

### Tiêu chí chấp nhận

1. **Given** hai người có cùng loại chỉ tiêu, **when** so sánh kết quả, **then** hệ thống dùng cùng công thức và cùng quy tắc làm tròn.
2. **Given** trọng số hoặc cách đo thay đổi giữa kỳ, **when** áp dụng, **then** hệ thống cảnh báo tác động và không hồi tố nếu chưa được phê duyệt.
3. **Given** dữ liệu nguồn chưa đủ hoặc có bất thường, **when** xếp loại, **then** hệ thống đánh dấu cần rà soát thay vì kết luận bất lợi tự động.

### Quy tắc nghiệp vụ

- Quy tắc chấm phải được công bố trước khi chốt kỳ.
- Không dùng dữ liệu ngoài kỳ hoặc ngoài phạm vi để đánh giá.

## KPI-11 — Khiếu nại kết quả KPI

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người được đánh giá, tôi muốn gửi khiếu nại về số liệu hoặc cách tính KPI, để sai lệch được xem xét trước khi chốt quyền lợi.

### Tiêu chí chấp nhận

1. **Given** KPI còn trong thời hạn khiếu nại, **when** người dùng nêu lý do và bằng chứng, **then** hệ thống ghi nhận yêu cầu với trạng thái chờ xử lý.
2. **Given** khiếu nại đã được tiếp nhận, **when** người xử lý ra kết luận, **then** người gửi xem được kết quả và lý do chấp nhận hoặc từ chối.
3. **Given** cùng nội dung đã có khiếu nại đang mở, **when** gửi lại, **then** hệ thống ngăn tạo trùng và dẫn tới yêu cầu hiện có.

### Quy tắc nghiệp vụ

- Người bị khiếu nại không tự xử lý vụ việc của chính mình.
- Chốt kỳ phải xét các khiếu nại còn mở theo chính sách đã công bố.

## KPI-12 — Phân biệt trạng thái trống, lỗi và dấu vết kiểm toán

**Vai trò:** Người dùng, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn biết khi nào chưa có KPI và khi nào hệ thống gặp lỗi, để không hiểu sai tình trạng công việc.

### Tiêu chí chấp nhận

1. **Given** kỳ được phép xem chưa có KPI, **when** mở trang, **then** hệ thống hiển thị trạng thái trống cùng hướng xử lý phù hợp vai trò.
2. **Given** dữ liệu không tải được, **when** mở hoặc làm mới trang, **then** hệ thống hiển thị thông báo lỗi an toàn và cho phép thử lại.
3. **Given** có thao tác giao, sửa, chốt hoặc hoàn tác KPI, **when** Quản Trị Vận Hành kiểm tra theo quyền, **then** nhật ký kiểm toán thể hiện tác nhân, hành động, thời gian và đối tượng liên quan.

### Quy tắc nghiệp vụ

- Lỗi hệ thống không được hiển thị như “chưa có KPI”.
- Nhật ký kiểm toán không được cho người dùng thường sửa hoặc xóa.
