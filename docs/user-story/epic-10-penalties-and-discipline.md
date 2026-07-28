# Epic 10 — Kỷ Luật Và Xử Phạt

## Mục tiêu Epic

Giúp cấp chỉ huy áp dụng kỷ luật đúng phạm vi, có căn cứ và nhất quán; bảo đảm mọi án phạt có sổ cái, lịch sử, khả năng hoàn tác và quy trình khiếu nại để tránh xử phạt trùng, sai hoặc thiếu công bằng.

## PEN-01 — Xem danh mục hình thức xử phạt

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một người chỉ huy, tôi muốn xem danh mục vi phạm và hình thức xử phạt, để chọn biện pháp đúng chính sách.

### Tiêu chí chấp nhận

1. **Given** danh mục xử phạt tồn tại, **when** mở trang Kỷ luật, **then** hệ thống hiển thị tên, mức độ, EXP bị trừ và hậu quả kèm theo.
2. **Given** một hình thức không còn hiệu lực, **when** xem danh mục mới, **then** hệ thống không cho áp dụng mới nhưng vẫn giữ lịch sử cũ.
3. **Given** danh mục không tải được, **when** mở trang, **then** hệ thống báo lỗi thay vì hiển thị danh mục trống như chính sách thật.

### Quy tắc nghiệp vụ

- Mỗi hình thức phải có mã vi phạm duy nhất.
- Thay đổi chính sách không tự động hồi tố án phạt cũ.

## PEN-02 — Áp dụng xử phạt đúng phạm vi

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người chỉ huy, tôi muốn áp dụng hình thức kỷ luật cho nhân sự thuộc thẩm quyền, để xử lý vi phạm mà không vượt quyền.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh chọn nhân sự hợp lệ, mã vi phạm và lý do, **when** xác nhận, **then** hệ thống ghi nhận án phạt.
2. **Given** Tư Lệnh chọn người ngoài phạm vi quản lý, **when** xác nhận, **then** hệ thống từ chối.
3. **Given** người chỉ huy chọn chính mình hoặc tài khoản không còn hoạt động, **when** áp dụng, **then** hệ thống từ chối và ghi nhận lần thử không hợp lệ.

### Quy tắc nghiệp vụ

- Không ai được tự xử phạt chính mình.
- Tư Lệnh chỉ xử phạt trong phạm vi được phép.

## PEN-03 — Ghi nhận lý do và bằng chứng vi phạm

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người chỉ huy, tôi muốn ghi lý do và bằng chứng cho án phạt, để quyết định có căn cứ và có thể rà soát.

### Tiêu chí chấp nhận

1. **Given** hình thức yêu cầu lý do, **when** nội dung trống hoặc quá mơ hồ, **then** hệ thống yêu cầu bổ sung trước khi ghi nhận.
2. **Given** có bằng chứng được phép đính kèm, **when** tạo án phạt, **then** hệ thống liên kết bằng chứng với vụ việc và giới hạn người xem theo quyền.
3. **Given** nội dung chứa dữ liệu không an toàn, **when** hiển thị lại, **then** hệ thống bảo vệ người xem và không làm lộ thông tin nội bộ.

### Quy tắc nghiệp vụ

- Án phạt phải có mã vi phạm, lý do, người áp dụng và thời gian.
- Bằng chứng nhạy cảm chỉ dành cho vai trò có thẩm quyền.

## PEN-04 — Xem hồ sơ kỷ luật cá nhân

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một người dùng, tôi muốn xem hồ sơ kỷ luật của mình, để biết án phạt, lý do và người áp dụng.

### Tiêu chí chấp nhận

1. **Given** người dùng có án phạt, **when** mở hồ sơ, **then** hệ thống hiển thị hình thức, EXP bị trừ, hậu quả, lý do, người áp dụng và ngày.
2. **Given** người dùng chưa có án phạt, **when** mở hồ sơ, **then** hệ thống hiển thị trạng thái hồ sơ sạch dễ hiểu.
3. **Given** người dùng cố xem hồ sơ kỷ luật riêng của người khác, **when** truy cập trực tiếp, **then** hệ thống từ chối nếu không có quyền.

### Quy tắc nghiệp vụ

- Hồ sơ cá nhân không đồng nghĩa với quyền xem toàn bộ bằng chứng nội bộ.
- Ngày giờ hiển thị theo `Asia/Ho_Chi_Minh`.

## PEN-05 — Ngăn xử phạt trùng

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Hệ Thống, tôi muốn ngăn cùng một vụ vi phạm bị ghi án phạt nhiều lần ngoài chính sách, để người vi phạm không bị trừ điểm trùng.

### Tiêu chí chấp nhận

1. **Given** cùng yêu cầu xử phạt bị gửi lại do mất kết nối, **when** xử lý, **then** hệ thống chỉ tạo một án phạt và một lần trừ điểm.
2. **Given** vụ việc đã có án phạt hiệu lực, **when** tạo thêm cùng mã và cùng nguồn, **then** hệ thống cảnh báo bản ghi có thể trùng.
3. **Given** hành vi tái phạm là sự kiện mới có bằng chứng riêng, **when** áp dụng, **then** hệ thống cho phép và liên kết đúng vụ việc mới.

### Quy tắc nghiệp vụ

- Phát hiện trùng dựa trên người bị phạt, mã vi phạm, nguồn vụ việc và thời điểm liên quan.
- Không coi mọi vi phạm cùng mã là một sự kiện duy nhất.

## PEN-06 — Ghi sổ cái án phạt và EXP

**Vai trò:** Hệ Thống, Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người có thẩm quyền, tôi muốn án phạt và khoản trừ EXP được ghi sổ đồng bộ, để hồ sơ kỷ luật và tổng điểm luôn đối chiếu được.

### Tiêu chí chấp nhận

1. **Given** án phạt hợp lệ được áp dụng, **when** hoàn tất, **then** hệ thống tạo bản ghi kỷ luật và bút toán EXP có cùng nguồn tham chiếu.
2. **Given** ghi bút toán EXP thất bại, **when** áp dụng án phạt, **then** hệ thống không để hồ sơ ghi phạt nhưng tổng điểm chưa đổi mà không có cảnh báo xử lý.
3. **Given** xem sổ cái, **when** chọn một khoản trừ, **then** người có quyền truy vết được tới mã vi phạm và quyết định nguồn.

### Quy tắc nghiệp vụ

- `exp_log` là sổ cái nguồn sự thật cho thay đổi EXP.
- Không sửa trực tiếp tổng EXP để thực hiện xử phạt.

## PEN-07 — Hoàn tác án phạt sai

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn hoàn tác án phạt được xác định sai, để khôi phục quyền lợi mà vẫn giữ lịch sử quyết định.

### Tiêu chí chấp nhận

1. **Given** án phạt còn hiệu lực và có căn cứ hoàn tác, **when** xác nhận với lý do, **then** hệ thống tạo quyết định đảo và hoàn lại EXP hoặc quyền lợi liên quan.
2. **Given** án phạt đã được hoàn tác, **when** yêu cầu lần nữa, **then** hệ thống không hoàn lại trùng.
3. **Given** án phạt đã ảnh hưởng quân hàm hoặc xếp hạng, **when** hoàn tác, **then** các kết quả liên quan được tính lại nhất quán.

### Quy tắc nghiệp vụ

- Không xóa án phạt hoặc bút toán gốc.
- Hoàn tác phải ghi lý do, người phê duyệt và tác động liên quan.

## PEN-08 — Xem lịch sử kỷ luật theo phạm vi

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Quản Trị Vận Hành  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một người có thẩm quyền, tôi muốn xem lịch sử án phạt theo phạm vi và trạng thái, để theo dõi kỷ luật và đối soát quyết định.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh mở sổ ghi án, **when** lọc theo người, mã, mức độ hoặc thời gian, **then** hệ thống hiển thị dữ liệu toàn công ty theo quyền.
2. **Given** Tư Lệnh mở lịch sử, **when** xem, **then** hệ thống chỉ hiển thị vụ việc thuộc phạm vi quản lý tại thời điểm liên quan.
3. **Given** án phạt đã hoàn tác, **when** xem lịch sử, **then** trạng thái và quyết định đảo được hiển thị rõ, không biến mất.

### Quy tắc nghiệp vụ

- Lịch sử phải giữ cả quyết định đang hiệu lực và đã hoàn tác.
- Dữ liệu bằng chứng nhạy cảm có quyền xem riêng.

## PEN-09 — Áp dụng kỷ luật công bằng và nhất quán

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người chỉ huy, tôi muốn tham chiếu chính sách và tiền lệ phù hợp, để mức xử phạt tương xứng và nhất quán.

### Tiêu chí chấp nhận

1. **Given** cùng loại vi phạm và điều kiện tương đương, **when** chọn mức phạt khác tiền lệ, **then** hệ thống yêu cầu nêu lý do khác biệt.
2. **Given** có tình tiết giảm nhẹ hoặc tăng nặng, **when** quyết định, **then** hệ thống cho phép ghi nhận căn cứ và người phê duyệt.
3. **Given** dữ liệu bằng chứng chưa đủ hoặc đang tranh chấp, **when** áp dụng hình thức nặng, **then** hệ thống cảnh báo cần rà soát theo chính sách.

### Quy tắc nghiệp vụ

- Không phân biệt đối xử theo thông tin không liên quan tới vi phạm.
- Hình thức xử phạt phải nằm trong khung chính sách đang hiệu lực.

## PEN-10 — Khiếu nại án phạt

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người bị xử phạt, tôi muốn gửi khiếu nại và bằng chứng phản hồi, để quyết định được xem xét độc lập.

### Tiêu chí chấp nhận

1. **Given** án phạt còn trong thời hạn khiếu nại, **when** người bị phạt gửi nội dung và bằng chứng, **then** hệ thống ghi nhận vụ việc chờ xử lý.
2. **Given** cùng án phạt đã có khiếu nại đang mở, **when** gửi lại, **then** hệ thống ngăn tạo trùng.
3. **Given** khiếu nại có kết luận, **when** người gửi xem, **then** hệ thống hiển thị lý do giữ nguyên, điều chỉnh hoặc hoàn tác án phạt.

### Quy tắc nghiệp vụ

- Người áp dụng án phạt không tự kết luận khiếu nại của chính quyết định đó.
- Khiếu nại không tự động xóa hoặc đình chỉ án phạt nếu chính sách chưa quy định.

## PEN-11 — Xử lý trạng thái trống, lỗi và audit

**Vai trò:** Người dùng, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn phân biệt hồ sơ sạch với lỗi tải dữ liệu và biết quyết định kỷ luật được audit, để tin cậy thông tin hiển thị.

### Tiêu chí chấp nhận

1. **Given** không có án phạt trong phạm vi, **when** mở hồ sơ hoặc sổ ghi án, **then** hệ thống hiển thị trạng thái trống phù hợp.
2. **Given** dữ liệu không tải hoặc áp dụng phạt thất bại, **when** thao tác, **then** hệ thống báo lỗi an toàn và không hiển thị thành công giả.
3. **Given** có thao tác áp dụng, điều chỉnh, hoàn tác hoặc xử lý khiếu nại, **when** kiểm tra audit theo quyền, **then** hệ thống hiển thị tác nhân, hành động, thời gian, đối tượng và kết quả.

### Quy tắc nghiệp vụ

- Lỗi hệ thống không được hiển thị như “không có vi phạm”.
- Audit không được cho người dùng thường sửa hoặc xóa.
