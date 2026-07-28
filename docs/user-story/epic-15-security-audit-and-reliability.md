# Epic 15 — Bảo Mật, Audit Và Độ Tin Cậy

## Mục tiêu epic

Bảo vệ dữ liệu và quyền truy cập, tạo khả năng truy vết quyết định, duy trì dịch vụ trước lỗi và thay đổi; giúp người có trách nhiệm phát hiện, phục hồi và giải trình sự cố mà không làm sai dữ liệu nghiệp vụ.

## SEC-01 — Mất quyền ngay khi tài khoản bị khóa

**Vai trò:** Tổng Tư Lệnh, Người dùng bị khóa  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn tài khoản bị khóa mất quyền ngay lập tức, để ngăn tiếp tục đọc hoặc thay đổi dữ liệu bằng phiên cũ.

### Tiêu chí chấp nhận

1. **Given** tài khoản đang hoạt động, **when** Tổng Tư Lệnh khóa tài khoản, **then** mọi yêu cầu mới của tài khoản đó bị từ chối ngay.
2. **Given** người dùng còn phiên đăng nhập cũ, **when** tải trang hoặc gửi thao tác sau khi bị khóa, **then** hệ thống không trả dữ liệu nghiệp vụ.
3. **Given** tài khoản được mở lại hợp lệ, **when** người dùng xác thực lại, **then** quyền được khôi phục theo vai trò hiện tại.

### Quy tắc nghiệp vụ

- Chỉ Tổng Tư Lệnh được khóa hoặc mở tài khoản.
- Mọi lần khóa, mở phải có audit log.

## SEC-02 — Thực thi quyền tại server và database

**Vai trò:** Chủ sở hữu dữ liệu, Người quản lý  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một chủ sở hữu dữ liệu, tôi muốn quyền được kiểm tra ở lớp đáng tin cậy, để việc sửa giao diện hoặc gọi trực tiếp API không vượt quyền.

### Tiêu chí chấp nhận

1. **Given** Tư Lệnh thao tác trong phạm vi quản lý, **when** gửi yêu cầu hợp lệ, **then** hệ thống cho phép.
2. **Given** Tư Lệnh thao tác ngoài phạm vi, **when** gọi trực tiếp route, action hoặc database function, **then** hệ thống từ chối.
3. **Given** Chiến Sỹ cố tự duyệt, tự khen hoặc tự phạt, **when** gửi thao tác, **then** hệ thống từ chối dù nút không xuất hiện trên giao diện.

### Quy tắc nghiệp vụ

- Không ai được tự duyệt, tự khen hoặc tự xử phạt.
- RLS/RPC và kiểm tra server phải phản ánh cùng ma trận quyền.

## SEC-03 — Giữ bí mật hệ thống khỏi trình duyệt và lỗi

**Vai trò:** Người dùng hệ thống  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một người dùng, tôi muốn khóa bí mật và thông tin nội bộ không xuất hiện trên trình duyệt hoặc thông báo lỗi, để tài khoản và dữ liệu được bảo vệ.

### Tiêu chí chấp nhận

1. **Given** ứng dụng chạy trên trình duyệt, **when** người dùng kiểm tra mã tải xuống hoặc request, **then** service role key không xuất hiện.
2. **Given** database hoặc server phát sinh lỗi, **when** trả phản hồi cho người dùng, **then** hệ thống không lộ SQL, stack trace, khóa hoặc cấu trúc nội bộ nhạy cảm.
3. **Given** cấu hình bí mật bị thiếu, **when** chức năng quản trị được gọi, **then** hệ thống dừng an toàn và hướng vận hành kiểm tra cấu hình.

### Quy tắc nghiệp vụ

- Service role chỉ được dùng phía server cho mục đích cần thiết.

## SEC-04 — Ngăn nội dung nhập gây hại

**Vai trò:** Người xem nội dung do người dùng tạo  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người xem nội dung, tôi muốn dữ liệu nhập được hiển thị an toàn, để không bị thực thi mã độc hoặc chuyển hướng lừa đảo.

### Tiêu chí chấp nhận

1. **Given** nội dung chứa HTML hoặc script không được phép, **when** hiển thị, **then** hệ thống escape hoặc sanitize trước khi đưa ra màn hình.
2. **Given** liên kết do người dùng nhập, **when** người khác mở, **then** hệ thống chặn giao thức nguy hiểm và thể hiện đích đến rõ ràng.
3. **Given** dữ liệu quá dài hoặc sai định dạng, **when** gửi vào hệ thống, **then** hệ thống từ chối tại ranh giới tin cậy với lỗi dễ hiểu.

### Quy tắc nghiệp vụ

- Kiểm tra phía client chỉ hỗ trợ trải nghiệm; server/database quyết định chấp nhận dữ liệu.

## SEC-05 — Ghi audit cho thao tác quan trọng

**Vai trò:** Tổng Tư Lệnh, Quản Trị Vận Hành được cấp quyền  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người chịu trách nhiệm kiểm soát, tôi muốn thao tác quan trọng được ghi audit đầy đủ, để truy vết ai làm gì, khi nào và trên đối tượng nào.

### Tiêu chí chấp nhận

1. **Given** có thao tác duyệt, từ chối, thu hồi, đổi quyền, đổi quỹ hoặc phục hồi dữ liệu, **when** giao dịch thành công, **then** audit ghi loại sự kiện, người thực hiện, thời gian và nguồn tham chiếu.
2. **Given** thao tác thất bại trước khi thay đổi nghiệp vụ, **when** xem audit, **then** hệ thống không ghi nhầm là thành công.
3. **Given** sự kiện chứa dữ liệu nhạy cảm, **when** ghi audit, **then** payload chỉ giữ thông tin cần điều tra và che bí mật.

### Quy tắc nghiệp vụ

- Audit không thay thế sổ cái EXP hoặc bản ghi nghiệp vụ nguồn.
- Thời gian audit lưu theo chuẩn thống nhất và hiển thị theo giờ Việt Nam khi cần.

## SEC-06 — Tra cứu audit theo quyền

**Vai trò:** Tổng Tư Lệnh, Quản Trị Vận Hành được cấp quyền  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người điều tra được cấp quyền, tôi muốn lọc audit theo thời gian, người thực hiện, loại sự kiện và đối tượng, để tìm nguyên nhân mà không đọc toàn bộ log.

### Tiêu chí chấp nhận

1. **Given** người dùng có quyền audit, **when** lọc theo khoảng thời gian và loại sự kiện, **then** hệ thống trả đúng các bản ghi phù hợp.
2. **Given** Tư Lệnh chỉ có quyền trong phạm vi đơn vị, **when** tra cứu audit, **then** hệ thống chỉ trả dữ liệu được phép hoặc từ chối toàn bộ theo chính sách.
3. **Given** người dùng thường, **when** truy cập chức năng audit, **then** hệ thống từ chối tại server/database.

### Quy tắc nghiệp vụ

- Mặc định dùng khoảng thời gian giới hạn để tránh truy vấn quá rộng.

## SEC-07 — Bảo toàn và lưu giữ audit

**Vai trò:** Tổng Tư Lệnh, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người kiểm soát, tôi muốn audit không bị người dùng thường sửa hoặc xóa và được lưu đủ lâu, để bằng chứng điều tra còn đáng tin cậy.

### Tiêu chí chấp nhận

1. **Given** audit đã được tạo, **when** người dùng ứng dụng cố sửa hoặc xóa, **then** hệ thống từ chối.
2. **Given** bản ghi đạt thời hạn lưu, **when** chính sách lưu trữ chạy, **then** dữ liệu được lưu trữ hoặc xóa theo phê duyệt và có bằng chứng thực hiện.
3. **Given** audit được xuất để điều tra, **when** hoàn tất, **then** lần xuất và người thực hiện cũng được ghi lại.

### Quy tắc nghiệp vụ

- Thời hạn lưu phải phù hợp yêu cầu pháp lý và nội bộ.
- Quyền quản trị ứng dụng không mặc nhiên cho phép xóa audit.

## SEC-08 — Sao lưu dữ liệu định kỳ

**Vai trò:** Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một Quản Trị Vận Hành, tôi muốn dữ liệu được sao lưu theo lịch và được xác nhận thành công, để có điểm phục hồi khi xảy ra mất mát.

### Tiêu chí chấp nhận

1. **Given** tới lịch sao lưu, **when** quy trình hoàn tất, **then** hệ thống ghi thời gian, phạm vi, kết quả và thời hạn lưu bản sao.
2. **Given** sao lưu thất bại hoặc quá hạn, **when** vượt ngưỡng cho phép, **then** Quản Trị Vận Hành nhận cảnh báo.
3. **Given** người không có quyền vận hành, **when** cố tải hoặc xóa bản sao, **then** hệ thống từ chối.

### Quy tắc nghiệp vụ

- Bản sao phải được mã hóa và tách quyền khỏi người dùng ứng dụng.
- Không coi bản sao tồn tại là thành công nếu chưa kiểm tra khả năng đọc.

## SEC-09 — Kiểm thử phục hồi từ bản sao

**Vai trò:** Quản Trị Vận Hành, Tổng Tư Lệnh phê duyệt  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một Quản Trị Vận Hành, tôi muốn diễn tập phục hồi và xác minh dữ liệu, để biết bản sao thực sự dùng được trước khi có sự cố.

### Tiêu chí chấp nhận

1. **Given** có bản sao hợp lệ, **when** thực hiện diễn tập trong môi trường cô lập, **then** dữ liệu được phục hồi và các kiểm tra quan trọng đạt yêu cầu.
2. **Given** bản sao lỗi hoặc thiếu, **when** phục hồi, **then** quy trình dừng an toàn, không ghi đè dữ liệu đang hoạt động và phát cảnh báo.
3. **Given** diễn tập hoàn tất, **when** xem báo cáo, **then** hệ thống ghi thời gian phục hồi, mức mất dữ liệu và vấn đề cần khắc phục.

### Quy tắc nghiệp vụ

- Phục hồi production cần phê duyệt, lý do, kế hoạch dừng và phương án quay lui.
- Không dùng dữ liệu production nhạy cảm trong môi trường thử nghiệm nếu chưa được bảo vệ.

## SEC-10 — Thay đổi cấu trúc dữ liệu an toàn

**Vai trò:** Quản Trị Vận Hành, Chủ sở hữu nghiệp vụ  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một chủ sở hữu nghiệp vụ, tôi muốn thay đổi cấu trúc dữ liệu không làm mất hoặc hiểu sai dữ liệu hiện có, để hệ thống tiếp tục hoạt động qua các phiên bản.

### Tiêu chí chấp nhận

1. **Given** có migration mới, **when** chuẩn bị triển khai, **then** phạm vi dữ liệu, tương thích ngược, thời gian gián đoạn và cách quay lui được xác định.
2. **Given** migration gặp lỗi giữa chừng, **when** hệ thống dừng, **then** dữ liệu giữ trạng thái nhất quán hoặc được phục hồi theo kế hoạch.
3. **Given** migration hoàn tất, **when** kiểm tra nghiệp vụ trọng yếu, **then** đăng nhập, quyền, nhiệm vụ, EXP và báo cáo vẫn cho kết quả hợp lệ.

### Quy tắc nghiệp vụ

- Migration phải được thử trên bản sao phù hợp trước production.
- Không xóa cột hoặc dữ liệu nguồn trước khi phiên bản đang chạy ngừng phụ thuộc.

## SEC-11 — Kiểm tra tình trạng dịch vụ

**Vai trò:** Quản Trị Vận Hành, Hệ Thống giám sát  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một Quản Trị Vận Hành, tôi muốn biết ứng dụng và database có sẵn sàng hay không, để phân biệt lỗi giao diện với lỗi dịch vụ nền.

### Tiêu chí chấp nhận

1. **Given** ứng dụng và database hoạt động, **when** kiểm tra sức khỏe, **then** hệ thống trả trạng thái sẵn sàng cùng thời gian kiểm tra.
2. **Given** database không kết nối được, **when** kiểm tra sức khỏe, **then** hệ thống trả trạng thái không sẵn sàng phù hợp thay vì báo thành công.
3. **Given** người ngoài gọi kiểm tra, **when** nhận phản hồi, **then** nội dung không lộ khóa, chuỗi kết nối hoặc chi tiết hạ tầng nhạy cảm.

### Quy tắc nghiệp vụ

- Health check không yêu cầu đăng nhập nhưng chỉ công bố thông tin tối thiểu.

## SEC-12 — Phát hiện và cảnh báo bất thường

**Vai trò:** Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một Quản Trị Vận Hành, tôi muốn nhận cảnh báo khi dịch vụ lỗi, tỷ lệ lỗi tăng hoặc thao tác nhạy cảm bất thường, để can thiệp trước khi ảnh hưởng lan rộng.

### Tiêu chí chấp nhận

1. **Given** health check thất bại liên tiếp hoặc tỷ lệ lỗi vượt ngưỡng, **when** điều kiện cảnh báo đạt, **then** người trực vận hành nhận cảnh báo có mức độ và thời điểm bắt đầu.
2. **Given** hoạt động đăng nhập thất bại hoặc vượt quyền tăng bất thường, **when** vượt ngưỡng an toàn, **then** hệ thống cảnh báo mà không khóa nhầm hàng loạt người dùng hợp lệ.
3. **Given** chỉ số trở lại bình thường, **when** tình trạng ổn định đủ thời gian, **then** cảnh báo được đóng hoặc giảm mức và lưu lịch sử.

### Quy tắc nghiệp vụ

- Cảnh báo phải chống trùng và có người chịu trách nhiệm tiếp nhận.

## SEC-13 — Phục hồi dịch vụ sau sự cố

**Vai trò:** Quản Trị Vận Hành, Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người chịu trách nhiệm vận hành, tôi muốn có quy trình phục hồi có thứ tự ưu tiên, để đưa chức năng quan trọng trở lại mà không làm sai dữ liệu.

### Tiêu chí chấp nhận

1. **Given** sự cố đang diễn ra, **when** kích hoạt phục hồi, **then** hệ thống ưu tiên đăng nhập, quyền truy cập và dữ liệu nghiệp vụ cốt lõi trước chức năng phụ.
2. **Given** người dùng gửi lại thao tác trong thời gian chập chờn, **when** dịch vụ phục hồi, **then** thao tác quan trọng không bị cộng EXP, duyệt hoặc chi trả trùng.
3. **Given** dịch vụ đã trở lại, **when** kết thúc sự cố, **then** người có trách nhiệm xác minh dữ liệu, thông báo người dùng và lưu báo cáo nguyên nhân.

### Quy tắc nghiệp vụ

- Không tuyên bố phục hồi hoàn tất chỉ dựa trên health check; phải kiểm tra hành trình nghiệp vụ chính.
- Mọi sửa dữ liệu sau sự cố cần nguồn tham chiếu và audit.

## SEC-14 — Bảo vệ quyền riêng tư và dữ liệu cá nhân

**Vai trò:** Nhân sự, Tổng Tư Lệnh, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự, tôi muốn dữ liệu cá nhân chỉ được dùng và hiển thị đúng mục đích, để quyền riêng tư của tôi được bảo vệ trong vận hành và báo cáo.

### Tiêu chí chấp nhận

1. **Given** người dùng xem danh sách hoặc báo cáo, **when** số điện thoại hay dữ liệu nhạy cảm không cần thiết, **then** hệ thống che hoặc không trả về trường đó.
2. **Given** người có thẩm quyền cần truy cập dữ liệu cá nhân để xử lý nghiệp vụ, **when** mở dữ liệu, **then** phạm vi truy cập phù hợp và sự kiện nhạy cảm được audit.
3. **Given** có yêu cầu cung cấp, chỉnh sửa hoặc xử lý dữ liệu cá nhân theo chính sách, **when** được phê duyệt, **then** hệ thống thực hiện có kiểm soát và không phá vỡ sổ cái, audit hoặc nghĩa vụ lưu giữ.

### Quy tắc nghiệp vụ

- Chỉ thu thập và xuất dữ liệu cần cho mục đích đã xác định.
- Xóa hoặc ẩn danh phải tôn trọng yêu cầu pháp lý, audit và tính toàn vẹn nghiệp vụ.
