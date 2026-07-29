# Quy Tắc Nghiệp Vụ Chung

## Tài khoản

- Đăng nhập dùng số điện thoại và mật khẩu.
- Số điện thoại phải duy nhất.
- Chỉ Tổng Tư Lệnh được tạo hoặc khóa tài khoản.
- Tài khoản bị khóa phải mất quyền ngay cả khi còn phiên đăng nhập.
- Không cho phép đăng ký công khai nếu mô hình là tài khoản nội bộ.

## Nhiệm vụ

- Nhiệm vụ có người giao, người nhận, mục tiêu, đơn vị, hạn và EXP.
- Người thực hiện không được tự duyệt kết quả.
- Kết quả chỉ được duyệt hoặc từ chối một lần cho mỗi trạng thái.
- Request gửi lặp không được cộng EXP hoặc tạo submission trùng.
- Nhiệm vụ hoàn thành phải phản ánh đúng tiến độ mục tiêu liên quan.

## EXP và điểm mùa

- `exp_log` là sổ cái nguồn sự thật.
- Mọi thay đổi EXP phải có lý do, nguồn tham chiếu và người tạo.
- Không sửa trực tiếp tổng EXP trên hồ sơ.
- Thu hồi duyệt phải hoàn tác EXP, điểm mùa, KPI và phần thưởng liên quan theo quy tắc đã chốt.
- EXP nhiệm vụ phải lấy từ cấu hình nhiệm vụ, không dùng hằng số ngầm.

## KPI

- KPI gắn với chủ sở hữu, tháng và năm.
- Mỗi chỉ tiêu có mục tiêu, đơn vị, kết quả hiện tại và trọng số.
- Chỉ tiêu tự cập nhật phải có `metric_key` rõ ràng.
- Tiến độ tổng hợp tính theo trọng số.
- Nhân sự không tự sửa kết quả KPI.

## Khen thưởng và kỷ luật

- Đề xuất khen thưởng chưa tạo phần thưởng cho tới khi được duyệt.
- Một huy hiệu cùng nguồn chỉ được cấp một lần nếu nghiệp vụ yêu cầu duy nhất.
- Xử phạt phải có mã vi phạm, lý do, người thực hiện và thời gian.
- Tư Lệnh chỉ khen hoặc phạt trong phạm vi quản lý.
- Không được tự khen, tự duyệt hoặc tự phạt.

## Yêu cầu hỗ trợ

- Mỗi người tối đa 4 yêu cầu trong một tháng, trừ khi cấu hình thay đổi.
- Chỉ người gửi được hủy yêu cầu đang chờ.
- Chỉ người nhận hoặc cấp có thẩm quyền được phản hồi.
- Yêu cầu đã xử lý không được xử lý lại.

## Nghỉ phép và điểm

- Chỉ yêu cầu nghỉ đã được duyệt mới được coi là ngày nghỉ hợp lệ.
- Trong ngày nghỉ hợp lệ, mọi khoản cộng hoặc trừ EXP, điểm mùa và điểm KPI của nhân sự đều bị bỏ hoàn toàn.
- Nghiệp vụ khác vẫn có thể hoàn tất nhưng không được tạo bút toán điểm cho nhân sự đang nghỉ.
- Điểm bị bỏ không được cộng bù, trừ bù, chuyển sang ngày khác hoặc tự động tính hồi tố.
- Audit phải ghi lại biến động bị bỏ và lý do nghỉ đã được duyệt.
- Ngày nghỉ được xác định theo `Asia/Ho_Chi_Minh`.

## Loại hình và lịch làm việc

- Nhân sự được phân loại `full-time` hoặc `part-time`.
- Full-time áp dụng lịch cố định và không đăng ký lại hằng tuần.
- Part-time phải đăng ký lịch cho tuần kế tiếp trước `18:00 Chủ Nhật`.
- Tư Lệnh kiểm tra lịch part-time trong phạm vi quản lý; hệ thống tự khóa lịch khi hết hạn.
- Part-time được sửa lịch trước hạn chốt.
- Sau khi khóa, thay đổi phải qua yêu cầu và được Tư Lệnh duyệt.
- Ngày part-time không có trong lịch đã chốt được xem là ngày nghỉ đối với giao nhiệm vụ và tính điểm.
- Mọi khoản cộng hoặc trừ điểm trong ngày không có lịch làm bị bỏ hoàn toàn, không dời hoặc cộng bù.
- Mọi thời điểm dùng `Asia/Ho_Chi_Minh`.

## Tiểu đội

- Một người chỉ thuộc một tiểu đội tại một thời điểm.
- Một người không đồng thời giữ nhiều vị trí trong cùng tiểu đội.
- Giới hạn quân số phải được bảo vệ bằng constraint hoặc transaction an toàn.
- EXP đội không được tính trùng thành viên.

## Ngày giờ

- Múi giờ nghiệp vụ: `Asia/Ho_Chi_Minh`.
- Deadline hiển thị thống nhất trên mọi trang.
- Qua nửa đêm giờ Việt Nam được tính là ngày mới.

## An toàn và độ tin cậy

- Nội dung người dùng nhập phải được escape hoặc sanitize khi hiển thị.
- Lỗi hệ thống phải khác trạng thái không có dữ liệu.
- Thao tác quan trọng phải idempotent.
- Audit log không được cho người dùng thường sửa hoặc xóa.
- Không để lộ SQL, stack trace, khóa bí mật hoặc thông tin nội bộ.
