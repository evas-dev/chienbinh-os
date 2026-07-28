# Epic 16 — Báo Cáo Và Vận Hành

## Mục tiêu epic

Giúp lãnh đạo và vận hành xem số liệu đúng phạm vi, hiểu độ mới và nguồn dữ liệu, xuất báo cáo an toàn, theo dõi tình trạng hệ thống và hành động khi dữ liệu hoặc dịch vụ có vấn đề.

## OPS-01 — Xem tổng quan điều hành toàn công ty

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn xem tổng quan mục tiêu, nhiệm vụ, KPI, EXP và yêu cầu hỗ trợ, để nhận biết khu vực cần quyết định.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh đã đăng nhập, **when** mở báo cáo tổng quan, **then** hệ thống hiển thị số liệu toàn công ty theo kỳ được chọn.
2. **Given** một nguồn dữ liệu lỗi, **when** tải tổng quan, **then** hệ thống đánh dấu phần lỗi và không biến lỗi thành số 0.
3. **Given** người dùng không có quyền toàn công ty, **when** truy cập báo cáo, **then** hệ thống từ chối tại server/database.

### Quy tắc nghiệp vụ

- Mỗi chỉ số phải có định nghĩa và nguồn dữ liệu rõ ràng.

## OPS-02 — Xem báo cáo trong phạm vi quản lý

**Vai trò:** Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tư Lệnh, tôi muốn xem báo cáo của đơn vị mình quản lý, để theo dõi tiến độ mà không thấy dữ liệu ngoài phạm vi.

### Tiêu chí chấp nhận

1. **Given** Tư Lệnh được giao một phạm vi tổ chức, **when** mở báo cáo, **then** hệ thống chỉ tổng hợp nhân sự và công việc trong phạm vi đó.
2. **Given** Tư Lệnh chọn nhân sự ngoài phạm vi qua URL hoặc bộ lọc, **when** truy vấn, **then** hệ thống từ chối hoặc trả tập rỗng an toàn theo chính sách.
3. **Given** phạm vi quản lý thay đổi, **when** tải lại báo cáo, **then** quyền hiện tại được áp dụng ngay.

### Quy tắc nghiệp vụ

- Phạm vi báo cáo dùng cùng nguồn quyền với thao tác nghiệp vụ.

## OPS-03 — Theo dõi yêu cầu hỗ trợ tồn đọng

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người quản lý, tôi muốn xem số yêu cầu hỗ trợ đang chờ và thời gian chờ, để xử lý điểm nghẽn và bảo đảm nhân sự được phản hồi.

### Tiêu chí chấp nhận

1. **Given** có yêu cầu đang chờ, **when** mở báo cáo, **then** hệ thống nhóm theo loại, người nhận, đơn vị và khoảng thời gian chờ.
2. **Given** Tư Lệnh xem báo cáo, **when** dữ liệu thuộc ngoài phạm vi quản lý, **then** hệ thống không hiển thị.
3. **Given** yêu cầu được xử lý, **when** báo cáo làm mới, **then** yêu cầu không còn trong tồn đọng và được tính vào thời gian xử lý.

### Quy tắc nghiệp vụ

- Báo cáo không hiển thị nội dung riêng tư của yêu cầu nếu không cần cho mục đích điều hành.

## OPS-04 — Đối soát quỹ thưởng theo kỳ

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một Tổng Tư Lệnh, tôi muốn đối soát quỹ, tổng EXP hợp lệ và phân bổ theo kỳ, để phát hiện chênh lệch trước khi chi trả.

### Tiêu chí chấp nhận

1. **Given** một kỳ thưởng được chọn, **when** mở báo cáo, **then** hệ thống hiển thị tổng quỹ, tổng EXP hợp lệ, tổng phân bổ và chênh lệch làm tròn.
2. **Given** có bút toán EXP bị thu hồi, **when** tính lại kỳ chưa chốt, **then** báo cáo phản ánh hoàn tác đúng nguồn.
3. **Given** kỳ đã chốt, **when** xem lại, **then** báo cáo dùng ảnh chụp đã phê duyệt thay vì số liệu hiện tại.

### Quy tắc nghiệp vụ

- `exp_log` là nguồn sự thật cho EXP.
- Tổng phân bổ không được vượt quỹ.

## OPS-05 — Xem báo cáo audit và sự kiện an toàn

**Vai trò:** Tổng Tư Lệnh, Quản Trị Vận Hành được cấp quyền  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người kiểm soát, tôi muốn xem báo cáo thao tác nhạy cảm và bất thường, để ưu tiên điều tra rủi ro.

### Tiêu chí chấp nhận

1. **Given** người dùng có quyền, **when** chọn kỳ báo cáo, **then** hệ thống tổng hợp thay đổi quyền, quỹ, phê duyệt, phục hồi và truy cập nhạy cảm.
2. **Given** có sự kiện vượt ngưỡng hoặc ngoài giờ bất thường, **when** xem báo cáo, **then** hệ thống đánh dấu để điều tra nhưng không tự kết luận vi phạm.
3. **Given** người không có quyền audit, **when** truy cập, **then** hệ thống từ chối và không tiết lộ số lượng sự kiện.

### Quy tắc nghiệp vụ

- Báo cáo audit giữ liên kết tới bản ghi nguồn không thể sửa bởi người dùng thường.

## OPS-06 — Xuất báo cáo theo bộ lọc

**Vai trò:** Người dùng có quyền báo cáo  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người dùng có quyền báo cáo, tôi muốn xuất đúng tập dữ liệu đang xem, để đối soát hoặc làm việc ngoại tuyến mà không sao chép thủ công.

### Tiêu chí chấp nhận

1. **Given** người dùng đã chọn kỳ, phạm vi và bộ lọc, **when** xuất, **then** tệp chứa đúng dữ liệu được phép tương ứng với bộ lọc.
2. **Given** dữ liệu lớn, **when** tạo tệp cần thời gian, **then** hệ thống báo đang xử lý và thông báo khi tệp sẵn sàng.
3. **Given** việc xuất thất bại, **when** người dùng thử lại, **then** hệ thống không tạo nhiều tệp trùng hoặc làm sai dữ liệu nguồn.

### Quy tắc nghiệp vụ

- Tệp phải ghi thời điểm tạo, múi giờ, bộ lọc và trạng thái dự kiến/đã chốt.
- Định dạng xuất cần đọc được bằng công cụ hỗ trợ phổ biến.

## OPS-07 — Bảo vệ dữ liệu trong tệp xuất

**Vai trò:** Người dùng có quyền xuất, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một chủ sở hữu dữ liệu, tôi muốn tệp xuất chỉ chứa thông tin cần thiết và có thời hạn truy cập, để giảm rủi ro lộ dữ liệu cá nhân.

### Tiêu chí chấp nhận

1. **Given** báo cáo không cần số điện thoại hoặc nội dung nhạy cảm, **when** xuất, **then** các trường đó bị loại bỏ hoặc che.
2. **Given** tệp đã hết thời hạn tải, **when** người dùng mở liên kết cũ, **then** hệ thống từ chối và yêu cầu tạo lại nếu còn quyền.
3. **Given** một lần xuất hoàn tất, **when** kiểm tra audit, **then** hệ thống ghi người xuất, mục đích hoặc loại báo cáo, phạm vi và thời gian.

### Quy tắc nghiệp vụ

- Quyền xuất không rộng hơn quyền xem dữ liệu gốc.
- Không gửi tệp nhạy cảm lên feed hoặc kênh công khai.

## OPS-08 — Biết độ mới và chất lượng số liệu

**Vai trò:** Người đọc báo cáo  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người đọc báo cáo, tôi muốn biết số liệu được cập nhật lúc nào và có thiếu nguồn nào không, để không ra quyết định từ dữ liệu cũ hoặc lỗi.

### Tiêu chí chấp nhận

1. **Given** báo cáo tải thành công, **when** hiển thị, **then** hệ thống nêu thời điểm cập nhật gần nhất theo giờ Việt Nam.
2. **Given** một nguồn dữ liệu chậm hoặc lỗi, **when** xem báo cáo, **then** phần liên quan được đánh dấu chưa đầy đủ và nêu nguồn bị ảnh hưởng.
3. **Given** số liệu thay đổi sau khi báo cáo đã mở, **when** người dùng làm mới, **then** hệ thống hiển thị dữ liệu mới và thời điểm cập nhật mới.

### Quy tắc nghiệp vụ

- Lỗi dữ liệu không được thay bằng 0 hoặc trạng thái trống.

## OPS-09 — Theo dõi sức khỏe, sao lưu và migration

**Vai trò:** Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một Quản Trị Vận Hành, tôi muốn xem một bảng tình trạng gồm dịch vụ, database, sao lưu và migration, để biết hạng mục nào cần hành động trước.

### Tiêu chí chấp nhận

1. **Given** hệ thống hoạt động bình thường, **when** mở bảng vận hành, **then** trạng thái health, lần sao lưu gần nhất và phiên bản migration hiện tại được hiển thị.
2. **Given** sao lưu quá hạn, health lỗi hoặc migration dở dang, **when** mở bảng, **then** hạng mục được đánh mức độ và nêu hành động tiếp theo.
3. **Given** người không có quyền vận hành, **when** truy cập bảng, **then** hệ thống từ chối và không lộ chi tiết hạ tầng.

### Quy tắc nghiệp vụ

- Bảng vận hành chỉ đọc; thao tác phục hồi hoặc migration cần quy trình phê duyệt riêng.

## OPS-10 — Nhận và xử lý báo cáo theo cách dễ tiếp cận

**Vai trò:** Người đọc báo cáo, Quản Trị Vận Hành  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một người đọc báo cáo, tôi muốn bảng, biểu đồ, trạng thái và lỗi có cách trình bày dễ tiếp cận, để hiểu và hành động dù dùng bàn phím, trình đọc màn hình hoặc màn hình nhỏ.

### Tiêu chí chấp nhận

1. **Given** báo cáo dùng màu để thể hiện trạng thái, **when** người dùng xem bằng chế độ tương phản hoặc trình đọc màn hình, **then** mỗi trạng thái có nhãn văn bản tương đương.
2. **Given** bảng có nhiều cột, **when** dùng màn hình nhỏ hoặc phóng to, **then** người dùng vẫn xem được tiêu đề, giá trị và mối liên hệ mà không mất nội dung.
3. **Given** báo cáo lỗi hoặc cần phục hồi, **when** thông báo xuất hiện, **then** hệ thống nêu phần bị ảnh hưởng, dữ liệu có còn an toàn không và hành động tiếp theo.

### Quy tắc nghiệp vụ

- Báo cáo phải dùng thuật ngữ nghiệp vụ thống nhất với cẩm nang.
- Không chỉ dùng biểu tượng hoặc màu để truyền đạt mức độ nghiêm trọng.
