# Epic 17 — Lịch Làm Việc Và Chấm Công

## Mục tiêu epic

Quản lý hai nhóm nhân sự full-time và part-time; bảo đảm part-time đăng ký lịch trước một tuần, lịch được Tư Lệnh kiểm tra và tự khóa lúc 18:00 Chủ Nhật trước tuần làm việc.

## SCH-01 — Phân loại nhân sự full-time và part-time

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn xác định loại hình làm việc của từng nhân sự, để hệ thống áp dụng đúng quy tắc lịch và điểm.

### Tiêu chí chấp nhận

1. **Given** hồ sơ nhân sự được tạo hoặc chỉnh sửa, **when** lưu, **then** phải chọn `full-time` hoặc `part-time`.
2. **Given** nhân sự đã có loại hình làm việc, **when** mở hồ sơ, **then** hệ thống hiển thị loại hiện tại rõ ràng.
3. **Given** loại hình được thay đổi, **when** lưu thành công, **then** hệ thống ghi người thay đổi, thời gian và giá trị trước/sau.

### Quy tắc nghiệp vụ

- Chỉ Tổng Tư Lệnh được đổi loại hình làm việc.
- Thay đổi không được làm mất lịch sử lịch làm cũ.

## SCH-02 — Áp dụng lịch cố định cho nhân sự full-time

**Vai trò:** Nhân sự full-time  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự full-time, tôi muốn được áp dụng lịch làm cố định, để không phải đăng ký lại mỗi tuần.

### Tiêu chí chấp nhận

1. **Given** nhân sự là full-time, **when** mở lịch tuần, **then** hệ thống hiển thị lịch cố định đã được công ty quy định.
2. **Given** nhân sự full-time, **when** đến kỳ đăng ký lịch part-time, **then** hệ thống không yêu cầu người đó đăng ký.
3. **Given** nhân sự full-time có nghỉ phép đã duyệt, **when** xem lịch, **then** ngày nghỉ được thể hiện thay cho lịch làm thông thường.

## SCH-03 — Đăng ký lịch tuần kế tiếp cho part-time

**Vai trò:** Nhân sự part-time  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự part-time, tôi muốn đăng ký lịch làm cho tuần kế tiếp, để quản lý chủ động xếp công việc và nhân sự.

### Tiêu chí chấp nhận

1. **Given** kỳ đăng ký đang mở, **when** part-time chọn ngày và ca của tuần kế tiếp, **then** hệ thống cho phép lưu lịch dự kiến.
2. **Given** lịch được lưu, **when** mở lại trước hạn chốt, **then** người dùng thấy đúng các ngày và ca đã đăng ký.
3. **Given** người dùng chọn tuần không hợp lệ, **when** gửi đăng ký, **then** hệ thống từ chối và hướng về tuần kế tiếp.

### Quy tắc nghiệp vụ

- Part-time đăng ký trước một tuần.
- Không cho đăng ký lùi cho ngày đã qua.

## SCH-04 — Hiển thị hạn đăng ký lịch

**Vai trò:** Nhân sự part-time  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự part-time, tôi muốn biết rõ hạn đăng ký, để hoàn tất lịch trước khi hệ thống khóa.

### Tiêu chí chấp nhận

1. **Given** kỳ đăng ký đang mở, **when** mở trang lịch, **then** hệ thống hiển thị hạn `18:00 Chủ Nhật` trước tuần làm việc.
2. **Given** còn ít hơn 24 giờ tới hạn, **when** mở hệ thống, **then** người chưa hoàn tất thấy cảnh báo nổi bật.
3. **Given** đã quá hạn, **when** mở biểu mẫu, **then** hệ thống hiển thị lịch đã khóa và hướng dẫn gửi yêu cầu đổi lịch.

## SCH-05 — Kiểm tra lịch đăng ký hợp lệ

**Vai trò:** Nhân sự part-time  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự part-time, tôi muốn hệ thống kiểm tra lịch trước khi lưu, để không đăng ký ca trùng hoặc sai quy định.

### Tiêu chí chấp nhận

1. **Given** hai ca bị trùng thời gian, **when** lưu, **then** hệ thống từ chối và chỉ rõ ca xung đột.
2. **Given** ngày hoặc ca không còn được phép đăng ký, **when** gửi, **then** hệ thống không lưu dữ liệu sai.
3. **Given** lịch hợp lệ, **when** lưu, **then** hệ thống xác nhận và ghi thời gian cập nhật cuối.

## SCH-06 — Chỉnh sửa lịch trước hạn chốt

**Vai trò:** Nhân sự part-time  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự part-time, tôi muốn sửa lịch trước hạn chốt, để cập nhật khả năng làm việc khi kế hoạch cá nhân thay đổi.

### Tiêu chí chấp nhận

1. **Given** chưa tới 18:00 Chủ Nhật, **when** người dùng thêm hoặc bỏ ca, **then** hệ thống cho phép lưu lịch mới.
2. **Given** lịch đã sửa, **when** Tư Lệnh mở danh sách, **then** hệ thống hiển thị phiên bản mới nhất.
3. **Given** hai lần lưu đồng thời, **when** có xung đột, **then** hệ thống cảnh báo và không âm thầm ghi đè thay đổi mới hơn.

## SCH-07 — Tư Lệnh kiểm tra lịch part-time

**Vai trò:** Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tư Lệnh, tôi muốn kiểm tra lịch part-time thuộc phạm vi quản lý, để bảo đảm tuần tới có đủ nhân sự.

### Tiêu chí chấp nhận

1. **Given** part-time đã đăng ký, **when** Tư Lệnh mở lịch tuần tới, **then** hệ thống hiển thị lịch theo ngày, ca và nhân sự.
2. **Given** có ngày thiếu hoặc thừa nhân sự, **when** xem lịch, **then** hệ thống đánh dấu để Tư Lệnh xử lý.
3. **Given** Tư Lệnh truy cập nhân sự ngoài phạm vi, **when** mở lịch, **then** hệ thống từ chối quyền.

## SCH-08 — Tự động chốt lịch lúc 18:00 Chủ Nhật

**Vai trò:** Hệ Thống, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tư Lệnh, tôi muốn lịch tự động được chốt đúng hạn, để có kế hoạch nhân sự ổn định cho tuần mới.

### Tiêu chí chấp nhận

1. **Given** đến 18:00 Chủ Nhật theo giờ Việt Nam, **when** kỳ đăng ký kết thúc, **then** hệ thống khóa lịch tuần kế tiếp.
2. **Given** lịch đã khóa, **when** part-time sửa trực tiếp, **then** hệ thống từ chối.
3. **Given** tác vụ khóa được chạy lại, **when** lịch đã chốt, **then** hệ thống không tạo bản chốt trùng hoặc thay đổi dữ liệu.

### Quy tắc nghiệp vụ

- Thời gian chuẩn: `Asia/Ho_Chi_Minh`.
- Tư Lệnh kiểm tra lịch; hệ thống chịu trách nhiệm khóa đúng hạn.

## SCH-09 — Nhắc part-time chưa đăng ký lịch

**Vai trò:** Nhân sự part-time, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một nhân sự part-time, tôi muốn được nhắc khi chưa đăng ký lịch, để không bỏ lỡ hạn Chủ Nhật.

### Tiêu chí chấp nhận

1. **Given** part-time chưa có lịch tuần tới, **when** gần tới hạn, **then** hệ thống gửi thông báo nhắc.
2. **Given** người dùng đã hoàn tất lịch, **when** tác vụ nhắc chạy, **then** hệ thống không gửi nhắc sai.
3. **Given** đã hết hạn nhưng vẫn thiếu lịch, **when** Tư Lệnh mở danh sách, **then** hệ thống hiển thị người chưa đăng ký.

## SCH-10 — Không xếp việc và không tính điểm ngày không đăng ký

**Vai trò:** Nhân sự part-time, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự part-time, tôi muốn ngày không có trong lịch đã chốt được xem là ngày nghỉ, để không bị giao việc hoặc thay đổi điểm ngoài lịch làm.

### Tiêu chí chấp nhận

1. **Given** part-time không có ca trong lịch đã chốt của một ngày, **when** Tư Lệnh giao nhiệm vụ ngày, **then** hệ thống cảnh báo và không giao mặc định cho ngày đó.
2. **Given** ngày không có lịch làm, **when** phát sinh cộng EXP, điểm mùa hoặc KPI, **then** hệ thống bỏ hoàn toàn phần điểm đó.
3. **Given** ngày không có lịch làm, **when** phát sinh xử phạt hoặc trừ điểm, **then** hệ thống bỏ hoàn toàn phần điểm bị trừ.
4. **Given** điểm đã bị bỏ, **when** sang ngày làm tiếp theo, **then** hệ thống không cộng bù, trừ bù hoặc chuyển điểm.

### Quy tắc nghiệp vụ

- Ngày không đăng ký trong lịch đã chốt tương đương ngày nghỉ đối với quy tắc điểm.
- Audit vẫn ghi nguồn nghiệp vụ và lý do bỏ điểm.

## SCH-11 — Công bố lịch tuần đã chốt

**Vai trò:** Nhân sự, Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một thành viên đội ngũ, tôi muốn xem lịch tuần đã chốt, để chủ động sắp xếp công việc.

### Tiêu chí chấp nhận

1. **Given** lịch đã khóa, **when** nhân sự mở lịch, **then** hệ thống hiển thị lịch chính thức của bản thân.
2. **Given** Tư Lệnh mở lịch đội, **when** có quyền, **then** hệ thống hiển thị lịch nhân sự thuộc phạm vi quản lý.
3. **Given** có thay đổi ngoại lệ được duyệt, **when** mở lại lịch, **then** hệ thống hiển thị phiên bản mới và dấu hiệu đã thay đổi.

## SCH-12 — Gửi yêu cầu đổi lịch sau khi chốt

**Vai trò:** Nhân sự part-time  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một nhân sự part-time, tôi muốn gửi yêu cầu đổi lịch sau khi chốt, để xử lý trường hợp bất khả kháng mà không tự ý sửa lịch.

### Tiêu chí chấp nhận

1. **Given** lịch đã khóa, **when** part-time cần đổi ca, **then** hệ thống cho tạo yêu cầu kèm lý do.
2. **Given** yêu cầu chưa được duyệt, **when** xem lịch, **then** lịch chính thức vẫn giữ nguyên.
3. **Given** yêu cầu bị từ chối, **when** người dùng xem kết quả, **then** hệ thống hiển thị trạng thái và lý do.

## SCH-13 — Duyệt thay đổi lịch ngoại lệ

**Vai trò:** Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tư Lệnh, tôi muốn duyệt hoặc từ chối yêu cầu đổi lịch, để giữ ổn định nhân sự nhưng vẫn xử lý được trường hợp đặc biệt.

### Tiêu chí chấp nhận

1. **Given** có yêu cầu đổi lịch, **when** Tư Lệnh duyệt, **then** lịch chính thức được cập nhật và lưu người duyệt.
2. **Given** ca mới gây xung đột, **when** duyệt, **then** hệ thống cảnh báo và không cập nhật lịch sai.
3. **Given** yêu cầu đã xử lý, **when** thao tác lặp, **then** hệ thống không thay đổi lịch lần nữa.

## SCH-14 — Xử lý nghỉ phép trùng lịch làm

**Vai trò:** Nhân sự, Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một nhân sự có lịch làm, tôi muốn ngày nghỉ được duyệt cập nhật vào lịch, để quản lý không tiếp tục phân công tôi trong ngày đó.

### Tiêu chí chấp nhận

1. **Given** nghỉ phép được duyệt và trùng ngày có lịch, **when** cập nhật hoàn tất, **then** ca đó được đánh dấu nghỉ.
2. **Given** ngày nghỉ đã được ghi nhận, **when** giao nhiệm vụ hoặc tính điểm, **then** hệ thống áp dụng quy tắc không giao việc và bỏ điểm.
3. **Given** yêu cầu nghỉ bị từ chối, **when** xem lịch, **then** lịch làm ban đầu vẫn giữ nguyên.

## SCH-15 — Lưu lịch sử thay đổi lịch làm

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người có thẩm quyền, tôi muốn xem lịch sử đăng ký và thay đổi lịch, để giải quyết tranh chấp về ca làm và điểm.

### Tiêu chí chấp nhận

1. **Given** lịch được tạo, sửa, khóa hoặc đổi ngoại lệ, **when** kiểm tra lịch sử, **then** hệ thống hiển thị người thao tác, thời gian và nội dung trước/sau.
2. **Given** một khoản điểm bị bỏ vì không có lịch làm, **when** đối soát, **then** audit liên kết được tới lịch đã chốt của ngày đó.
3. **Given** người không có quyền truy cập audit, **when** mở lịch sử, **then** hệ thống từ chối và không trả dữ liệu.

### Quy tắc nghiệp vụ

- Lịch sử đã chốt không được người dùng thường sửa hoặc xóa.
- Mọi ngày giờ dùng `Asia/Ho_Chi_Minh`.

