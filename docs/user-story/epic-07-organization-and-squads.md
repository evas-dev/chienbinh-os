# Epic 07 — Tổ Chức Và Tiểu Đội

## Mục tiêu Epic

Giúp công ty quản lý cơ cấu mặt trận, đơn vị và tiểu đội rõ ràng; bảo đảm mỗi nhân sự có vị trí hợp lệ, quyền quản lý đúng phạm vi, điểm đội công bằng và mọi thay đổi tổ chức đều có lịch sử đối soát.

## SQU-01 — Xem cơ cấu tổ chức và tiểu đội

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một Tổng Tư Lệnh, tôi muốn xem các tiểu đội, vị trí và quân số, để nắm cơ cấu vận hành toàn công ty.

### Tiêu chí chấp nhận

1. **Given** có dữ liệu tiểu đội, **when** mở trang Tổ đội, **then** hệ thống hiển thị đội trưởng, đội phó, thành viên, quân số và tổng EXP đội.
2. **Given** một vị trí chưa có người, **when** xem tiểu đội, **then** hệ thống thể hiện vị trí trống mà không gán nhầm thành viên.
3. **Given** người dùng không phải Tổng Tư Lệnh, **when** truy cập trang quản trị toàn công ty, **then** hệ thống từ chối theo quyền.

### Quy tắc nghiệp vụ

- Dữ liệu hiển thị phải phản ánh cơ cấu đang có hiệu lực.
- Tài khoản inactive không được tính là thành viên hoạt động nếu chính sách quy định loại trừ.

## SQU-02 — Tạo và cập nhật tiểu đội

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn tạo hoặc cập nhật thông tin tiểu đội, để cơ cấu phản ánh đúng tổ chức thực tế.

### Tiêu chí chấp nhận

1. **Given** tên đội, mặt trận và thông tin bắt buộc hợp lệ, **when** tạo tiểu đội, **then** hệ thống ghi nhận đội mới ở đúng phạm vi.
2. **Given** tên hoặc mã đội bị trùng trong phạm vi áp dụng, **when** lưu, **then** hệ thống cảnh báo và không tạo bản ghi thứ hai.
3. **Given** đội đã có lịch sử thành tích, **when** đổi tên hoặc thông tin mô tả, **then** lịch sử cũ vẫn truy vết về cùng tiểu đội.

### Quy tắc nghiệp vụ

- Không xóa cứng tiểu đội đã phát sinh thành viên hoặc thành tích.
- Mỗi tiểu đội thuộc một mặt trận tại một thời điểm.

## SQU-03 — Bổ nhiệm đội trưởng và đội phó

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn bổ nhiệm đội trưởng và đội phó đủ điều kiện, để mỗi tiểu đội có trách nhiệm chỉ huy rõ ràng.

### Tiêu chí chấp nhận

1. **Given** nhân sự đang hoạt động và thuộc phạm vi phù hợp, **when** bổ nhiệm vào vị trí trống, **then** hệ thống ghi nhận vị trí và ngày hiệu lực.
2. **Given** một người đã giữ vị trí khác trong cùng tiểu đội, **when** bổ nhiệm thêm, **then** hệ thống từ chối hoặc yêu cầu kết thúc vị trí cũ trước.
3. **Given** người được chọn thuộc tiểu đội khác, **when** bổ nhiệm, **then** hệ thống cảnh báo xung đột thành viên và không tự chuyển âm thầm.

### Quy tắc nghiệp vụ

- Một người không đồng thời giữ nhiều vị trí trong cùng tiểu đội.
- Bổ nhiệm phải có người thực hiện và thời điểm hiệu lực.

## SQU-04 — Quản lý thành viên đúng phạm vi

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người chỉ huy, tôi muốn thêm hoặc đề xuất thành viên trong phạm vi được giao, để tổ chức được cập nhật mà không vượt quyền.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh thao tác, **when** chọn nhân sự toàn công ty, **then** hệ thống cho phép quản lý theo chính sách chung.
2. **Given** Tư Lệnh thao tác, **when** chọn nhân sự ngoài mặt trận hoặc đơn vị mình quản lý, **then** hệ thống từ chối.
3. **Given** quyền của Tư Lệnh chỉ cho phép đề xuất, **when** gửi thay đổi, **then** hệ thống tạo đề xuất chờ duyệt thay vì áp dụng ngay.

### Quy tắc nghiệp vụ

- Phạm vi phải được kiểm tra theo cơ cấu có hiệu lực tại thời điểm thao tác.
- Không ai được tự nâng quyền tổ chức cho chính mình.

## SQU-05 — Ngăn thành viên và vị trí trùng

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Hệ Thống, tôi muốn ngăn một người xuất hiện trùng hoặc thuộc nhiều tiểu đội cùng lúc, để quân số và điểm đội chính xác.

### Tiêu chí chấp nhận

1. **Given** nhân sự đã thuộc một tiểu đội đang hiệu lực, **when** thêm vào tiểu đội khác, **then** hệ thống từ chối và chỉ rõ xung đột.
2. **Given** cùng yêu cầu thêm thành viên được gửi lặp, **when** xử lý, **then** hệ thống chỉ ghi nhận một tư cách thành viên.
3. **Given** người vừa là đội trưởng vừa xuất hiện trong danh sách thành viên thường, **when** tổng hợp quân số, **then** hệ thống phát hiện dữ liệu trùng và không tính hai lần.

### Quy tắc nghiệp vụ

- Một người chỉ thuộc một tiểu đội tại một thời điểm.
- Vị trí chỉ huy và thành viên thường không được nhân đôi trong cùng kỳ hiệu lực.

## SQU-06 — Kiểm soát giới hạn quân số công bằng

**Vai trò:** Tổng Tư Lệnh, Hệ Thống  
**Ưu tiên:** —  
**Trạng thái:** Đã bỏ (02/08/2026)

> ~~Là một Tổng Tư Lệnh, tôi muốn giới hạn quân số được áp dụng nhất quán, để các tiểu đội thi đua trong điều kiện công bằng.~~

Trần quân số đã được gỡ bỏ theo yêu cầu nghiệp vụ: một tiểu đội được phép có
bao nhiêu thành viên tuỳ ý. Toàn bộ tiêu chí chấp nhận của story này (chặn khi
đủ suất, tranh chấp suất cuối, ngoại lệ quân số) không còn đối tượng áp dụng.

### Quy tắc nghiệp vụ

- Không giới hạn số thành viên trong một tiểu đội.
- Ràng buộc "một người chỉ thuộc một tiểu đội" vẫn giữ nguyên — xem SQU-05.
- Vì các đội có thể chênh lệch quân số, **tổng EXP đội ở Bảng xếp hạng · Cấp 2
  không còn là phép so sánh công bằng**; cân nhắc đổi sang EXP trung bình nếu
  quân số giữa các đội lệch nhiều.

## SQU-07 — Chuyển thành viên giữa các tiểu đội

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn chuyển nhân sự giữa các tiểu đội theo ngày hiệu lực, để tái tổ chức mà không làm sai lịch sử thành tích.

### Tiêu chí chấp nhận

1. **Given** nhân sự đang thuộc đội cũ, **when** chuyển sang đội mới hợp lệ, **then** tư cách cũ kết thúc và tư cách mới bắt đầu theo thời điểm đã chọn.
2. **Given** đội mới đã đủ quân số, **when** xác nhận chuyển, **then** hệ thống từ chối và giữ nguyên đội cũ.
3. **Given** chuyển đội giữa kỳ thi đua, **when** tính điểm, **then** hệ thống áp dụng quy tắc phân bổ đã công bố thay vì tính trùng cho hai đội.

### Quy tắc nghiệp vụ

- Không được có khoảng thời gian thành viên đồng thời thuộc hai đội.
- Thành tích quá khứ giữ theo cơ cấu có hiệu lực lúc phát sinh, trừ khi chính sách quy định khác.

## SQU-08 — Hoàn tác thay đổi cơ cấu sai

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn hoàn tác bổ nhiệm hoặc chuyển đội bị sai, để sửa tổ chức mà vẫn giữ dấu vết quyết định.

### Tiêu chí chấp nhận

1. **Given** thay đổi chưa làm phát sinh nghiệp vụ phụ thuộc, **when** hoàn tác với lý do, **then** cơ cấu trở về trạng thái trước đó.
2. **Given** thay đổi đã ảnh hưởng điểm đội hoặc quyền phê duyệt, **when** yêu cầu hoàn tác, **then** hệ thống hiển thị tác động cần xử lý trước khi xác nhận.
3. **Given** hoàn tác thành công, **when** xem lịch sử, **then** cả thay đổi gốc và lần hoàn tác vẫn còn hiển thị.

### Quy tắc nghiệp vụ

- Không xóa cứng lịch sử thành viên và vị trí.
- Hoàn tác không được tạo khoảng thời gian chồng lấn tư cách thành viên.

## SQU-09 — Xem sổ cái điểm và lịch sử đóng góp của tiểu đội

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một thành viên tổ chức, tôi muốn xem tổng điểm đội và sổ cái nguồn đóng góp theo quyền, để hiểu thành tích tập thể được hình thành công bằng.

### Tiêu chí chấp nhận

1. **Given** tiểu đội có nhiều thành viên, **when** xem điểm đội, **then** mỗi người chỉ được tính một lần trong cùng phạm vi và kỳ.
2. **Given** thành viên chuyển đội, **when** xem lịch sử kỳ cũ, **then** đóng góp hiển thị theo quy tắc hiệu lực của kỳ đó.
3. **Given** người xem là Chiến Sỹ, **when** mở chi tiết, **then** hệ thống chỉ hiển thị dữ liệu tập thể được phép, không lộ thông tin riêng của người khác.

### Quy tắc nghiệp vụ

- Điểm đội không được tính trùng đội trưởng, đội phó và thành viên thường.
- Quy tắc cộng điểm phải thống nhất với bảng xếp hạng tiểu đội.
- Tổng điểm đội phải đối chiếu được từ sổ cái đóng góp.

## SQU-10 — Khiếu nại tư cách thành viên hoặc điểm đội

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một thành viên, tôi muốn khiếu nại khi vị trí, tiểu đội hoặc điểm đóng góp của mình bị sai, để quyền lợi được xem xét minh bạch.

### Tiêu chí chấp nhận

1. **Given** người dùng thấy thông tin tổ chức sai, **when** gửi khiếu nại kèm nội dung cụ thể, **then** hệ thống ghi nhận vụ việc và người chịu trách nhiệm xử lý.
2. **Given** khiếu nại đang mở, **when** người dùng gửi lại cùng nội dung, **then** hệ thống ngăn bản ghi trùng và dẫn tới vụ việc hiện có.
3. **Given** có kết luận, **when** người gửi xem lại, **then** hệ thống hiển thị quyết định, lý do và thay đổi phát sinh nếu có.

### Quy tắc nghiệp vụ

- Người có lợi ích trực tiếp không tự phê duyệt kết luận khiếu nại.
- Khiếu nại không tự động thay đổi cơ cấu trước khi được xử lý.

## SQU-11 — Xử lý trạng thái trống và lỗi dữ liệu tổ chức

**Vai trò:** Người dùng, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn phân biệt chưa có tiểu đội với lỗi tải dữ liệu, để không hiểu sai cơ cấu công ty.

### Tiêu chí chấp nhận

1. **Given** một mặt trận chưa có tiểu đội, **when** người có quyền mở trang, **then** hệ thống hiển thị trạng thái trống và hành động phù hợp.
2. **Given** dữ liệu thành viên không tải được, **when** mở trang, **then** hệ thống thông báo lỗi an toàn và không hiển thị tổng quân số sai như dữ liệu thật.
3. **Given** phát hiện thành viên mồ côi hoặc vị trí tham chiếu không tồn tại, **when** Quản Trị Vận Hành kiểm tra, **then** hệ thống nêu bản ghi cần xử lý mà không tự xóa.

### Quy tắc nghiệp vụ

- Lỗi truy vấn không được hiển thị như “không có tiểu đội”.
- Dữ liệu bất nhất phải được cô lập khỏi tính điểm cho tới khi xác minh.

## SQU-12 — Kiểm tra lịch sử và audit cơ cấu

**Vai trò:** Tổng Tư Lệnh, Quản Trị Vận Hành  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người có thẩm quyền, tôi muốn xem lịch sử thay đổi cơ cấu và nhật ký kiểm toán, để biết ai đã thay đổi gì và khi nào.

### Tiêu chí chấp nhận

1. **Given** tiểu đội có thay đổi tên, vị trí hoặc thành viên, **when** xem lịch sử, **then** hệ thống hiển thị trạng thái trước và sau theo thời gian.
2. **Given** có thao tác bị từ chối do vượt quyền hoặc trùng dữ liệu, **when** kiểm tra audit theo quyền, **then** hệ thống ghi nhận sự kiện cần thiết mà không lộ thông tin bí mật.
3. **Given** người dùng thường yêu cầu sửa hoặc xóa audit, **when** thao tác, **then** hệ thống từ chối.

### Quy tắc nghiệp vụ

- Audit phải ghi tác nhân, hành động, đối tượng, thời gian và kết quả.
- Lịch sử tổ chức và audit không được dùng thay thế nhau; mỗi loại giữ mục đích riêng.
