# Epic 13 — Feed, Cẩm Nang Và Minh Bạch

## Mục tiêu epic

Tạo kênh cập nhật thành tích và cẩm nang dễ hiểu, an toàn, đúng quyền; giúp người dùng biết sự kiện nào đã xảy ra, cách hệ thống tính điểm và lý do của các quyết định ảnh hưởng tới mình.

## FEE-01 — Xem hoạt động gần nhất trên feed

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự, tôi muốn xem các hoạt động gần nhất của toàn đội, để nắm thành tích và thay đổi đáng chú ý.

### Tiêu chí chấp nhận

1. **Given** người dùng đã đăng nhập, **when** mở Nhật ký chiến công, **then** hệ thống hiển thị tối đa 50 hoạt động gần nhất theo thứ tự mới trước.
2. **Given** feed không có dữ liệu, **when** mở trang, **then** hệ thống hiển thị trạng thái trống dễ hiểu.
3. **Given** dữ liệu feed tải lỗi, **when** mở trang, **then** hệ thống hiển thị lỗi và không mô tả sai thành “chưa có hoạt động”.

### Quy tắc nghiệp vụ

- Chỉ tài khoản đang hoạt động và đã đăng nhập được đọc feed.

## FEE-02 — Hiển thị nội dung feed an toàn

**Vai trò:** Người xem feed  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người xem feed, tôi muốn mọi nội dung được hiển thị an toàn, để không bị mã độc hoặc nội dung giả mạo tác động.

### Tiêu chí chấp nhận

1. **Given** sự kiện chứa dữ liệu do người dùng nhập, **when** hiển thị trên feed, **then** dữ liệu được escape hoặc sanitize theo danh sách định dạng cho phép.
2. **Given** nội dung chứa script, thuộc tính sự kiện hoặc liên kết nguy hiểm, **when** hiển thị, **then** hệ thống loại bỏ phần nguy hiểm và không thực thi mã.
3. **Given** nội dung không thể làm sạch an toàn, **when** tải feed, **then** hệ thống thay bằng mô tả an toàn và ghi nhận lỗi cho vận hành.

### Quy tắc nghiệp vụ

- Không tin cậy HTML lưu sẵn trong database.
- Không hiển thị SQL, stack trace hoặc khóa bí mật trên feed.

## FEE-03 — Giữ đúng phạm vi riêng tư trên feed

**Vai trò:** Nhân sự được nhắc tới  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự, tôi muốn feed chỉ công bố thông tin phù hợp, để thành tích được ghi nhận mà dữ liệu riêng tư không bị lộ.

### Tiêu chí chấp nhận

1. **Given** sự kiện là thành tích được phép công bố, **when** tạo feed, **then** hệ thống chỉ hiển thị tên, loại thành tích và thông tin cần thiết.
2. **Given** sự kiện chứa số điện thoại, nội dung hỗ trợ, bằng chứng nhiệm vụ hoặc tiền thưởng cá nhân, **when** tạo feed, **then** hệ thống không đưa dữ liệu đó vào nội dung công khai.
3. **Given** quyền của người xem thay đổi, **when** tải feed, **then** dữ liệu trả về tuân theo quyền hiện tại chứ không dựa vào giao diện đã lưu.

### Quy tắc nghiệp vụ

- Feed không thay thế audit log.
- Dữ liệu cá nhân chỉ được công bố theo mục đích và chính sách đã duyệt.

## FEE-04 — Tin cậy nguồn sự kiện trên feed

**Vai trò:** Người xem feed  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người xem feed, tôi muốn mỗi hoạt động phản ánh giao dịch nghiệp vụ đã hoàn tất, để không thấy thành tích chưa được ghi nhận hoặc bị ghi trùng.

### Tiêu chí chấp nhận

1. **Given** nhiệm vụ được duyệt thành công, **when** giao dịch hoàn tất, **then** feed hiển thị đúng một sự kiện với người và EXP liên quan.
2. **Given** giao dịch nghiệp vụ thất bại hoặc bị rollback, **when** tải feed, **then** không có sự kiện thành công sai lệch.
3. **Given** cùng yêu cầu được gửi lặp, **when** hệ thống xử lý idempotent, **then** feed không tạo nhiều sự kiện giống nhau.

### Quy tắc nghiệp vụ

- Sự kiện feed phải có nguồn tham chiếu để đối chiếu khi cần.

## FEE-05 — Lọc và xem thêm lịch sử feed

**Vai trò:** Người xem feed  
**Ưu tiên:** P2  
**Trạng thái:** Đề xuất

> Là một người xem feed, tôi muốn lọc theo loại hoạt động và xem thêm lịch sử, để tìm thông tin liên quan mà không phải đọc toàn bộ danh sách.

### Tiêu chí chấp nhận

1. **Given** feed có nhiều loại sự kiện, **when** chọn bộ lọc nhiệm vụ, khen thưởng, quân hàm hoặc kỷ luật, **then** hệ thống chỉ hiển thị loại phù hợp.
2. **Given** có hơn một trang dữ liệu, **when** chọn xem thêm, **then** hệ thống tải trang tiếp theo mà không lặp hoặc bỏ sót sự kiện.
3. **Given** bộ lọc không có kết quả, **when** áp dụng, **then** hệ thống hiển thị trạng thái trống và cho phép xóa bộ lọc.

### Quy tắc nghiệp vụ

- Bộ lọc không được mở rộng quyền xem dữ liệu.

## FEE-06 — Truy cập cẩm nang theo vai trò

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự, tôi muốn đọc phần cẩm nang được phép cho vai trò của mình, để hiểu cách làm việc và tự theo dõi kết quả.

### Tiêu chí chấp nhận

1. **Given** nội dung cẩm nang áp dụng cho mọi nhân sự, **when** Tư Lệnh hoặc Chiến Sỹ mở trang, **then** hệ thống cho phép đọc nội dung chung.
2. **Given** nội dung chỉ dành cho Tổng Tư Lệnh, **when** vai trò khác truy cập, **then** hệ thống ẩn hoặc từ chối phần đó tại server.
3. **Given** tài khoản bị khóa, **when** truy cập cẩm nang, **then** hệ thống từ chối dù đường dẫn vẫn tồn tại.

### Quy tắc nghiệp vụ

- Quyền đọc cẩm nang phải được kiểm tra tại server/database, không chỉ ẩn liên kết.

## FEE-07 — Hiểu EXP, huy hiệu và quỹ thưởng

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một nhân sự, tôi muốn hiểu EXP, huy hiệu và quỹ thưởng khác nhau thế nào, để biết hành vi nào ảnh hưởng tới tiến bộ và quyền lợi của mình.

### Tiêu chí chấp nhận

1. **Given** người dùng mở cẩm nang, **when** đọc phần EXP, **then** hệ thống giải thích EXP đo khối lượng và được tích lũy từ nguồn hợp lệ.
2. **Given** người dùng đọc phần huy hiệu, **when** xem ví dụ, **then** hệ thống giải thích huy hiệu ghi nhận kết quả hoặc thành tích theo điều kiện.
3. **Given** người dùng đọc phần quỹ, **when** xem công thức, **then** hệ thống giải thích tiền thưởng phụ thuộc tỷ lệ EXP trong kỳ, không phụ thuộc trực tiếp quân hàm.

### Quy tắc nghiệp vụ

- Nội dung cẩm nang phải phù hợp với business rules đang áp dụng.

## FEE-08 — Biết phiên bản và thời điểm hiệu lực của cẩm nang

**Vai trò:** Người đọc cẩm nang  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người đọc cẩm nang, tôi muốn biết phiên bản và ngày hiệu lực, để phân biệt quy tắc hiện tại với nội dung cũ.

### Tiêu chí chấp nhận

1. **Given** cẩm nang được công bố, **when** mở nội dung, **then** hệ thống hiển thị phiên bản, ngày hiệu lực và đơn vị phê duyệt.
2. **Given** quy tắc thay đổi, **when** phiên bản mới có hiệu lực, **then** người dùng mặc định thấy phiên bản hiện hành.
3. **Given** người có quyền cần đối chiếu, **when** mở lịch sử, **then** hệ thống cho phép xem phiên bản cũ nhưng đánh dấu hết hiệu lực.

### Quy tắc nghiệp vụ

- Không sửa âm thầm nội dung đã có hiệu lực; thay đổi phải tạo phiên bản mới.

## FEE-09 — Xem lý do quyết định ảnh hưởng tới mình

**Vai trò:** Chiến Sỹ, Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự, tôi muốn xem lý do và nguồn tham chiếu của quyết định ảnh hưởng tới EXP, huy hiệu hoặc kỷ luật của mình, để có thể kiểm tra và trao đổi khi cần.

### Tiêu chí chấp nhận

1. **Given** EXP của người dùng thay đổi, **when** mở chi tiết, **then** hệ thống hiển thị số thay đổi, lý do, thời gian và nguồn nghiệp vụ.
2. **Given** người dùng nhận huy hiệu hoặc xử phạt, **when** xem chi tiết, **then** hệ thống hiển thị quy tắc áp dụng và người có thẩm quyền.
3. **Given** người dùng cố xem chi tiết riêng của người khác, **when** không có quyền quản lý, **then** hệ thống từ chối.

### Quy tắc nghiệp vụ

- `exp_log` là nguồn sự thật cho thay đổi EXP.
- Không hiển thị thông tin điều tra hoặc dữ liệu cá nhân không cần thiết.

## FEE-10 — Đọc feed và cẩm nang bằng công cụ hỗ trợ

**Vai trò:** Người dùng có nhu cầu tiếp cận  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng có nhu cầu tiếp cận, tôi muốn feed và cẩm nang hoạt động với bàn phím, trình đọc màn hình và chế độ phóng to, để tiếp nhận thông tin bình đẳng.

### Tiêu chí chấp nhận

1. **Given** người dùng điều hướng bằng bàn phím, **when** duyệt feed và cẩm nang, **then** thứ tự focus rõ ràng và không có vùng bị mắc kẹt.
2. **Given** biểu tượng hoặc màu thể hiện loại sự kiện, **when** trình đọc màn hình đọc nội dung, **then** hệ thống có nhãn văn bản tương đương và không chỉ dựa vào màu.
3. **Given** người dùng phóng to nội dung, **when** xem trên màn hình hẹp, **then** văn bản vẫn đọc được và bảng có cách cuộn hoặc trình bày thay thế.

### Quy tắc nghiệp vụ

- Thời gian tương đối phải có ngữ cảnh đủ hiểu hoặc cho phép xem ngày giờ đầy đủ theo giờ Việt Nam.
