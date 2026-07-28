# Epic 03 — Quản Trị Nhân Sự

## Mục tiêu epic

Giúp Tổng Tư Lệnh quản lý vòng đời tài khoản nhân sự, cơ cấu phân công và trạng thái hoạt động bằng quy trình có kiểm soát, chống trùng dữ liệu và truy vết được thay đổi.

## ADM-01 — Truy cập khu vực quản trị nhân sự

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** truy cập khu vực quản trị nhân sự, **để** quản lý tài khoản toàn công ty.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh đã đăng nhập, **when** mở khu vực Quản trị nhân sự, **then** hệ thống hiển thị danh sách và hành động được cấp.
2. **Given** Tư Lệnh hoặc Chiến Sỹ, **when** mở URL quản trị trực tiếp, **then** hệ thống từ chối tại server hoặc database.
3. **Given** tài khoản Tổng Tư Lệnh bị ngưng, **when** mở khu vực quản trị, **then** hệ thống chặn như mọi tài khoản inactive khác.

## ADM-02 — Xem danh sách nhân sự

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** xem danh sách nhân sự và trạng thái tài khoản, **để** nắm nguồn lực đang hoạt động.

### Tiêu chí chấp nhận

1. **Given** có hồ sơ nhân sự, **when** mở danh sách, **then** hệ thống hiển thị tên, vai trò, phòng ban, số điện thoại và trạng thái hoạt động.
2. **Given** chưa có nhân sự trong phạm vi đang xem, **when** danh sách tải thành công, **then** hệ thống hiển thị trạng thái trống dễ hiểu.
3. **Given** truy vấn danh sách thất bại, **when** trang hiển thị, **then** hệ thống báo lỗi tải dữ liệu thay vì báo “chưa có nhân sự”.

## ADM-03 — Lọc nhân sự theo phòng ban

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** lọc nhân sự theo phòng ban hoặc xem toàn bộ, **để** rà soát từng đơn vị nhanh hơn.

### Tiêu chí chấp nhận

1. **Given** có nhiều phòng ban, **when** chọn một phòng, **then** danh sách chỉ hiển thị nhân sự thuộc phòng đó.
2. **Given** chọn “Tất cả”, **when** bộ lọc áp dụng, **then** hệ thống hiển thị toàn bộ nhân sự được phép xem.
3. **Given** tên phòng ban chứa dấu hoặc khoảng trắng, **when** mở bộ lọc từ URL, **then** hệ thống giải mã đúng và không cho nội dung bất thường làm hỏng trang.

## ADM-04 — Tạo tài khoản nhân sự

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** tạo tài khoản cho nhân sự đã được phê duyệt, **để** họ có thể đăng nhập và làm việc.

### Tiêu chí chấp nhận

1. **Given** dữ liệu hợp lệ và số điện thoại chưa dùng, **when** Tổng Tư Lệnh xác nhận tạo, **then** hệ thống tạo tài khoản xác thực và hồ sơ nhân sự tương ứng.
2. **Given** người không phải Tổng Tư Lệnh, **when** gửi yêu cầu tạo tài khoản trực tiếp, **then** hệ thống từ chối và không tạo dữ liệu một phần.
3. **Given** bước tạo hồ sơ thất bại sau khi tạo danh tính xác thực, **when** giao dịch kết thúc, **then** hệ thống hoàn tác hoặc báo trạng thái cần xử lý, không để tài khoản mồ côi không được nhận biết.

### Quy tắc nghiệp vụ

- Không cho đăng ký công khai; chỉ Tổng Tư Lệnh được tạo tài khoản.

## ADM-05 — Kiểm tra dữ liệu tài khoản mới

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** dữ liệu tài khoản mới được kiểm tra trước khi lưu, **để** tránh hồ sơ thiếu hoặc không đăng nhập được.

### Tiêu chí chấp nhận

1. **Given** thiếu tên, số điện thoại, phòng ban, mặt trận hoặc vai trò, **when** xác nhận tạo, **then** hệ thống từ chối và chỉ rõ trường cần bổ sung.
2. **Given** số điện thoại không đạt định dạng tối thiểu hoặc mật khẩu quá ngắn, **when** xác nhận tạo, **then** hệ thống không tạo tài khoản.
3. **Given** dữ liệu có khoảng trắng thừa, **when** xác nhận tạo, **then** hệ thống chuẩn hóa dữ liệu trước khi kiểm tra tính hợp lệ.

## ADM-06 — Ngăn số điện thoại trùng

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** mỗi số điện thoại chỉ thuộc một tài khoản, **để** danh tính đăng nhập không bị nhầm lẫn.

### Tiêu chí chấp nhận

1. **Given** số điện thoại đã tồn tại, **when** tạo tài khoản mới, **then** hệ thống từ chối với thông báo dễ hiểu.
2. **Given** hai yêu cầu tạo cùng số điện thoại đến đồng thời, **when** hệ thống xử lý, **then** chỉ một tài khoản được tạo thành công.
3. **Given** yêu cầu bị từ chối do trùng, **when** quay lại biểu mẫu, **then** dữ liệu không nhạy cảm đã nhập vẫn có thể được sửa mà không cần nhập lại toàn bộ.

### Quy tắc nghiệp vụ

- Tính duy nhất của số điện thoại phải được bảo vệ ở database, không chỉ kiểm tra trước trên giao diện.

## ADM-07 — Gán vai trò và phạm vi tổ chức khi tạo tài khoản

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** gán vai trò, phòng ban và mặt trận cho tài khoản mới, **để** quyền và phạm vi công việc đúng ngay từ đầu.

### Tiêu chí chấp nhận

1. **Given** tạo Chiến Sỹ hoặc Tư Lệnh, **when** chọn vai trò và đơn vị hợp lệ, **then** hồ sơ lưu đúng các giá trị đã chọn.
2. **Given** giá trị vai trò hoặc mặt trận không thuộc danh mục cho phép, **when** yêu cầu được gửi trực tiếp, **then** hệ thống từ chối.
3. **Given** tài khoản được tạo thành công, **when** người đó đăng nhập, **then** điều hướng và quyền dữ liệu phản ánh đúng vai trò đã gán.

## ADM-08 — Gán tiểu đội khi tạo nhân sự

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> **Là một** Tổng Tư Lệnh, **tôi muốn** gán nhân sự vào tiểu đội phù hợp khi tạo tài khoản, **để** giảm bước phân công sau đó.

### Tiêu chí chấp nhận

1. **Given** tiểu đội còn chỗ và phù hợp, **when** chọn tiểu đội lúc tạo tài khoản, **then** nhân sự được ghi nhận trong đúng tiểu đội.
2. **Given** nhân sự đã thuộc tiểu đội khác hoặc tiểu đội đã đủ quân số, **when** yêu cầu gán được xử lý, **then** hệ thống từ chối an toàn và nêu lý do.
3. **Given** nhiều yêu cầu gán vào chỗ cuối cùng đến đồng thời, **when** hệ thống xử lý, **then** giới hạn quân số không bị vượt.

### Quy tắc nghiệp vụ

- Một người chỉ thuộc một tiểu đội tại một thời điểm; giới hạn quân số phải được bảo vệ bằng constraint hoặc transaction an toàn.

## ADM-09 — Ngưng tài khoản nhân sự

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** ngưng tài khoản không còn được phép sử dụng, **để** thu hồi quyền truy cập ngay.

### Tiêu chí chấp nhận

1. **Given** tài khoản nhân sự đang hoạt động, **when** Tổng Tư Lệnh xác nhận ngưng, **then** trạng thái chuyển thành đã ngưng.
2. **Given** tài khoản vừa bị ngưng vẫn còn phiên đăng nhập, **when** người dùng thao tác tiếp, **then** hệ thống chặn đọc và ghi dữ liệu.
3. **Given** hai quản trị viên gửi thay đổi trạng thái gần nhau, **when** hệ thống xử lý, **then** trạng thái cuối được xác định rõ và không hiển thị thành công sai.

## ADM-10 — Kích hoạt lại tài khoản nhân sự

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** kích hoạt lại tài khoản đã ngưng, **để** nhân sự được phép quay lại làm việc bằng danh tính cũ.

### Tiêu chí chấp nhận

1. **Given** tài khoản đang ngưng, **when** Tổng Tư Lệnh kích hoạt lại, **then** trạng thái chuyển thành hoạt động.
2. **Given** tài khoản được kích hoạt lại, **when** người dùng đăng nhập đúng thông tin, **then** hệ thống cho truy cập theo quyền hiện tại.
3. **Given** tài khoản đã hoạt động, **when** yêu cầu kích hoạt lặp được gửi, **then** hệ thống giữ trạng thái hoạt động và không tạo tác dụng phụ trùng.

## ADM-11 — Bảo vệ tài khoản cấp cao và tài khoản đang thao tác

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> **Là một** Tổng Tư Lệnh, **tôi muốn** hệ thống ngăn tự khóa mình hoặc khóa tài khoản Tổng Tư Lệnh, **để** tránh mất quyền quản trị ngoài ý muốn.

### Tiêu chí chấp nhận

1. **Given** Tổng Tư Lệnh đang xem chính mình, **when** tìm hành động ngưng tài khoản, **then** hệ thống không cho thực hiện.
2. **Given** mục tiêu là tài khoản Tổng Tư Lệnh, **when** gửi yêu cầu ngưng trực tiếp, **then** hệ thống từ chối tại database.
3. **Given** giao diện bị sửa hoặc bỏ qua, **when** yêu cầu trái quy tắc đến server, **then** dữ liệu vẫn không thay đổi.

## ADM-12 — Chỉnh sửa và truy vết hồ sơ nhân sự

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> **Là một** Tổng Tư Lệnh, **tôi muốn** cập nhật hồ sơ nhân sự và xem lịch sử thay đổi, **để** dữ liệu tổ chức luôn đúng và có thể kiểm tra lại.

### Tiêu chí chấp nhận

1. **Given** hồ sơ tồn tại, **when** cập nhật tên, phòng ban, mặt trận, vai trò hoặc tiểu đội bằng dữ liệu hợp lệ, **then** hệ thống lưu thay đổi và áp dụng quyền mới.
2. **Given** dữ liệu mới vi phạm quy tắc duy nhất hoặc cơ cấu tiểu đội, **when** xác nhận cập nhật, **then** hệ thống từ chối toàn bộ thay đổi liên quan.
3. **Given** thay đổi hồ sơ hoặc trạng thái hoàn tất, **when** người có quyền xem audit, **then** hệ thống hiển thị tác nhân, thời gian, giá trị trước và sau.

### Quy tắc nghiệp vụ

- Không được sửa trực tiếp EXP, điểm mùa hoặc thành tích nghiệp vụ từ màn hình hồ sơ nhân sự.
