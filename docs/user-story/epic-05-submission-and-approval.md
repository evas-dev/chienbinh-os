# Epic 05 — Nộp Kết Quả Và Phê Duyệt

## Mục tiêu epic

Cho phép người thực hiện nộp bằng chứng công việc, người giao đánh giá đúng thẩm quyền và hệ thống cập nhật thành tích chính xác, không cộng trùng, có thể thu hồi và truy vết đầy đủ.

## SUB-01 — Nộp kết quả nhiệm vụ đang làm

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người thực hiện nhiệm vụ, **tôi muốn** nộp kết quả công việc, **để** người giao xem xét và ghi nhận hoàn thành.

### Tiêu chí chấp nhận

1. **Given** nhiệm vụ thuộc người dùng và đang ở trạng thái đang làm, **when** gửi kết quả hợp lệ, **then** hệ thống tạo một bản nộp chờ duyệt và chuyển nhiệm vụ sang chờ đánh giá.
2. **Given** nhiệm vụ thuộc người khác hoặc không ở trạng thái đang làm, **when** gửi kết quả trực tiếp, **then** hệ thống từ chối và không tạo bản nộp.
3. **Given** yêu cầu nộp gặp lỗi, **when** hệ thống phản hồi, **then** nội dung đã nhập chưa gửi thành công không bị mất nếu có thể phục hồi an toàn.

## SUB-02 — Nhập số liệu kết quả theo loại nhiệm vụ

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người thực hiện nhiệm vụ, **tôi muốn** nhập các số liệu kết quả phù hợp, **để** người duyệt có căn cứ đánh giá và cập nhật mục tiêu.

### Tiêu chí chấp nhận

1. **Given** nhiệm vụ yêu cầu chỉ số cụ thể, **when** mở biểu mẫu nộp, **then** hệ thống hiển thị đúng trường số liệu liên quan.
2. **Given** số liệu âm, không phải số hoặc vượt giới hạn nghiệp vụ, **when** gửi kết quả, **then** hệ thống từ chối và chỉ rõ trường cần sửa.
3. **Given** chỉ số không áp dụng cho nhiệm vụ, **when** người dùng gửi thêm dữ liệu ngoài danh mục, **then** hệ thống bỏ qua an toàn hoặc từ chối theo quy tắc đã chốt.

## SUB-03 — Đính kèm ghi chú hoặc bằng chứng

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> **Là một** người thực hiện nhiệm vụ, **tôi muốn** gửi ghi chú, liên kết hoặc mã tham chiếu, **để** chứng minh kết quả đã báo cáo.

### Tiêu chí chấp nhận

1. **Given** có bằng chứng bổ sung, **when** người dùng nhập ghi chú hoặc liên kết và gửi, **then** người duyệt xem được nội dung cùng bản nộp.
2. **Given** nội dung có ký tự đặc biệt hoặc mã HTML, **when** hiển thị cho người duyệt, **then** hệ thống escape hoặc sanitize an toàn.
3. **Given** bằng chứng là tùy chọn, **when** người dùng không nhập, **then** vẫn có thể nộp nếu các dữ liệu bắt buộc khác hợp lệ.

## SUB-04 — Ngăn tạo bản nộp trùng

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> **Là một** hệ thống phê duyệt, **tôi muốn** ngăn bản nộp trùng do bấm nhiều lần hoặc mạng gửi lại, **để** người duyệt không xử lý cùng kết quả nhiều lần.

### Tiêu chí chấp nhận

1. **Given** một bản nộp đã được tạo cho lượt hiện tại, **when** cùng yêu cầu được gửi lại, **then** hệ thống trả về kết quả trước hoặc từ chối mà không tạo dòng mới.
2. **Given** hai yêu cầu nộp đến đồng thời, **when** hệ thống xử lý, **then** chỉ một bản nộp chờ duyệt được tạo cho cùng nhiệm vụ và lượt.
3. **Given** bản nộp trước đã bị từ chối và nhiệm vụ được mở lại, **when** người dùng nộp lại, **then** hệ thống tạo đúng lượt tiếp theo thay vì coi là bản trùng.

### Quy tắc nghiệp vụ

- Request gửi lặp không được tạo submission trùng; số lượt phải tăng tuần tự và được bảo vệ khi có đồng thời.

## SUB-05 — Xem kết quả đang chờ duyệt

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người có quyền duyệt, **tôi muốn** xem danh sách kết quả đang chờ mình xử lý, **để** phản hồi kịp thời cho người thực hiện.

### Tiêu chí chấp nhận

1. **Given** có bản nộp thuộc phạm vi, **when** mở khu vực chờ duyệt, **then** hệ thống hiển thị người nộp, nhiệm vụ, lượt nộp, thời gian và nội dung kết quả.
2. **Given** không có bản nộp chờ duyệt, **when** khu vực tải thành công, **then** hệ thống hiển thị trạng thái trống rõ ràng.
3. **Given** truy vấn thất bại, **when** khu vực hiển thị, **then** hệ thống báo lỗi tải dữ liệu, không mô tả là “không có kết quả”.

## SUB-06 — Phê duyệt kết quả nhiệm vụ

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người giao nhiệm vụ hoặc Tổng Tư Lệnh, **tôi muốn** phê duyệt kết quả đạt yêu cầu, **để** ghi nhận nhiệm vụ hoàn thành và thành tích của người thực hiện.

### Tiêu chí chấp nhận

1. **Given** bản nộp đang chờ và người dùng có quyền, **when** chọn Duyệt, **then** bản nộp chuyển thành đã duyệt và nhiệm vụ chuyển thành hoàn thành.
2. **Given** bản nộp đã được xử lý, **when** yêu cầu duyệt lại được gửi, **then** hệ thống từ chối và không cộng thêm thành tích.
3. **Given** thao tác duyệt thất bại giữa chừng, **when** giao dịch kết thúc, **then** trạng thái bản nộp, nhiệm vụ và thành tích không bị lệch nhau.

## SUB-07 — Từ chối kết quả kèm lý do

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người có quyền duyệt, **tôi muốn** từ chối kết quả chưa đạt và nêu lý do, **để** người thực hiện biết cần sửa gì.

### Tiêu chí chấp nhận

1. **Given** bản nộp đang chờ, **when** người duyệt nhập lý do và xác nhận từ chối, **then** bản nộp chuyển thành từ chối và nhiệm vụ quay lại trạng thái có thể tiếp tục làm.
2. **Given** lý do để trống hoặc chỉ có khoảng trắng, **when** xác nhận từ chối, **then** hệ thống không xử lý và yêu cầu nhập lý do.
3. **Given** bản nộp đã được xử lý, **when** gửi yêu cầu từ chối lại, **then** hệ thống từ chối và giữ nguyên dữ liệu.

### Quy tắc nghiệp vụ

- Kết quả chỉ được duyệt hoặc từ chối một lần cho mỗi trạng thái.

## SUB-08 — Kiểm soát quyền phê duyệt

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** hệ thống phê duyệt, **tôi muốn** chỉ cho người giao nhiệm vụ hoặc Tổng Tư Lệnh xử lý kết quả, **để** quyết định được thực hiện đúng thẩm quyền.

### Tiêu chí chấp nhận

1. **Given** Tư Lệnh là người giao nhiệm vụ, **when** xử lý bản nộp của nhiệm vụ đó, **then** hệ thống cho phép.
2. **Given** Tư Lệnh không phải người giao và không có quyền thay thế, **when** cố duyệt hoặc từ chối, **then** hệ thống từ chối.
3. **Given** Tổng Tư Lệnh xử lý bản nộp hợp lệ, **when** xác nhận, **then** hệ thống cho phép theo quyền giám sát toàn công ty.

## SUB-09 — Ngăn tự duyệt kết quả

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** hệ thống kiểm soát nội bộ, **tôi muốn** ngăn người thực hiện tự duyệt kết quả của mình, **để** bảo đảm tính độc lập của phê duyệt.

### Tiêu chí chấp nhận

1. **Given** người duyệt cũng là người nộp, **when** gửi yêu cầu phê duyệt, **then** hệ thống từ chối.
2. **Given** nút duyệt bị ẩn nhưng người dùng gọi hành động trực tiếp, **when** server kiểm tra, **then** dữ liệu vẫn không thay đổi.
3. **Given** Tổng Tư Lệnh là người nộp trong một luồng đặc biệt, **when** xử lý kết quả của chính mình, **then** quy tắc không tự duyệt vẫn được áp dụng.

## SUB-10 — Nộp lại sau khi bị từ chối

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người có kết quả bị từ chối, **tôi muốn** xem lý do và nộp lại sau khi sửa, **để** tiếp tục hoàn thành nhiệm vụ.

### Tiêu chí chấp nhận

1. **Given** bản nộp bị từ chối, **when** người thực hiện xem nhiệm vụ, **then** hệ thống hiển thị lý do từ chối mới nhất.
2. **Given** người thực hiện đã sửa kết quả, **when** nộp lại, **then** hệ thống tạo lượt mới và giữ lịch sử lượt cũ.
3. **Given** nhiều lần từ chối tồn tại, **when** xem nhiệm vụ hiện tại, **then** lý do mới nhất được ưu tiên nhưng lịch sử vẫn truy xuất được theo quyền.

## SUB-11 — Xem lịch sử kết quả đã xử lý

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> **Là một** người tham gia nhiệm vụ, **tôi muốn** xem lịch sử kết quả đã duyệt hoặc từ chối trong phạm vi, **để** theo dõi quyết định và thành tích đã ghi nhận.

### Tiêu chí chấp nhận

1. **Given** người thực hiện có kết quả đã duyệt, **when** xem lịch sử cá nhân, **then** hệ thống hiển thị nhiệm vụ, thời gian duyệt và EXP được cấp.
2. **Given** người giao có kết quả đã xử lý, **when** xem lịch sử duyệt, **then** hệ thống hiển thị trạng thái, người nộp và lý do từ chối nếu có.
3. **Given** người dùng cố xem lịch sử ngoài phạm vi, **when** gửi yêu cầu, **then** hệ thống từ chối tại server hoặc database.

## SUB-12 — Cập nhật EXP, điểm mùa, KPI và huy hiệu khi duyệt

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> **Là một** hệ thống ghi nhận thành tích, **tôi muốn** cập nhật đầy đủ các hệ quả khi kết quả được duyệt, **để** hồ sơ và mục tiêu phản ánh đúng đóng góp.

### Tiêu chí chấp nhận

1. **Given** bản nộp hợp lệ được duyệt, **when** giao dịch hoàn tất, **then** hệ thống ghi EXP và điểm mùa vào sổ cái với lý do, nguồn tham chiếu và người tạo.
2. **Given** nội dung có chỉ số gắn với KPI, **when** duyệt, **then** tiến độ chỉ tiêu liên quan cập nhật đúng và không vượt quy tắc đã chốt.
3. **Given** nhiệm vụ có huy hiệu thưởng duy nhất, **when** duyệt, **then** hệ thống cấp huy hiệu tối đa một lần cho cùng nguồn.

### Quy tắc nghiệp vụ

- EXP phải lấy từ cấu hình nhiệm vụ, không dùng hằng số ngầm; `exp_log` là nguồn sự thật và không sửa trực tiếp tổng EXP trên hồ sơ.

## SUB-13 — Xử lý an toàn khi nhiều người duyệt đồng thời

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> **Là một** hệ thống phê duyệt, **tôi muốn** chỉ một quyết định thắng khi có yêu cầu đồng thời, **để** không cộng EXP hai lần hoặc tạo trạng thái mâu thuẫn.

### Tiêu chí chấp nhận

1. **Given** hai yêu cầu duyệt cùng bản nộp đến đồng thời, **when** hệ thống xử lý, **then** chỉ một yêu cầu thành công và chỉ một dòng thành tích được tạo.
2. **Given** một yêu cầu duyệt và một yêu cầu từ chối đến đồng thời, **when** một quyết định đã được ghi nhận, **then** yêu cầu còn lại bị từ chối theo trạng thái mới.
3. **Given** client gửi lại yêu cầu sau timeout, **when** quyết định trước đã thành công, **then** hệ thống trả trạng thái đã xử lý mà không lặp tác dụng phụ.

### Quy tắc nghiệp vụ

- Thao tác duyệt, từ chối và thu hồi phải idempotent, có khóa hoặc điều kiện cập nhật bảo vệ trạng thái.

## SUB-14 — Thu hồi kết quả đã duyệt

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** người có quyền duyệt, **tôi muốn** chuyển kết quả đã duyệt sang từ chối kèm lý do, **để** sửa quyết định sai và hoàn tác thành tích liên quan.

### Tiêu chí chấp nhận

1. **Given** bản nộp đang ở trạng thái đã duyệt và người dùng có quyền, **when** nhập lý do thu hồi, **then** bản nộp chuyển sang từ chối và nhiệm vụ mở lại theo quy tắc.
2. **Given** thu hồi thành công, **when** giao dịch hoàn tất, **then** EXP, điểm mùa, KPI và phần thưởng liên quan được hoàn tác đúng số đã cấp.
3. **Given** bản nộp không còn ở trạng thái đã duyệt hoặc đã thu hồi, **when** yêu cầu lặp, **then** hệ thống từ chối và không trừ thành tích thêm lần nữa.

### Quy tắc nghiệp vụ

- Số EXP thu hồi phải dựa trên giá trị đã cấp của bản nộp, không tính lại từ cấu hình có thể đã thay đổi.

## SUB-15 — Ghi audit cho vòng đời bản nộp

**Vai trò:** Quản Trị Vận Hành, Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> **Là một** người giám sát được cấp quyền, **tôi muốn** truy vết việc nộp, duyệt, từ chối và thu hồi, **để** điều tra sai lệch và xác nhận trách nhiệm.

### Tiêu chí chấp nhận

1. **Given** một thao tác vòng đời bản nộp hoàn tất, **when** audit được ghi, **then** hệ thống lưu loại sự kiện, tác nhân, thời gian, bản nộp và dữ liệu nghiệp vụ cần thiết.
2. **Given** người dùng thường, **when** cố sửa hoặc xóa audit log, **then** hệ thống từ chối.
3. **Given** nội dung bản nộp chứa dữ liệu nhạy cảm, **when** ghi audit, **then** hệ thống chỉ lưu dữ liệu cần thiết theo chính sách và không lưu token, khóa bí mật hoặc chi tiết kỹ thuật.

## SUB-16 — Thao tác phê duyệt dễ tiếp cận và tránh nhầm lẫn

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> **Là một** người duyệt, **tôi muốn** thao tác duyệt, từ chối và thu hồi rõ ràng trên mọi thiết bị, **để** giảm quyết định nhầm và sử dụng được bằng công nghệ hỗ trợ.

### Tiêu chí chấp nhận

1. **Given** người duyệt dùng bàn phím, **when** di chuyển qua danh sách và hộp thoại, **then** focus hiển thị rõ, không bị mắc kẹt và nút có tên truy cập đầy đủ.
2. **Given** hành động từ chối hoặc thu hồi có hậu quả, **when** người dùng xác nhận, **then** hệ thống nêu rõ tác động và yêu cầu lý do trước khi thực hiện.
3. **Given** yêu cầu đang xử lý, **when** người dùng bấm lại hoặc mạng chậm, **then** nút được vô hiệu hóa phù hợp và kết quả cuối được thông báo bằng chữ, không chỉ bằng màu hoặc biểu tượng.
