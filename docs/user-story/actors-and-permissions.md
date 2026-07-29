# Vai Trò Và Phân Quyền

## Tổng Tư Lệnh

Người điều hành cấp cao nhất.

- Xem dữ liệu toàn công ty.
- Quản trị tài khoản nhân sự.
- Tạo chiến dịch và giao mục tiêu cấp công ty.
- Duyệt khen thưởng.
- Quản lý tiểu đội và quỹ thưởng.
- Xử lý hoặc giám sát mọi nghiệp vụ quan trọng.

## Tư Lệnh

Người quản lý nhóm, phòng ban hoặc mặt trận.

- Giao nhiệm vụ cho nhân sự thuộc phạm vi quản lý.
- Duyệt kết quả nhiệm vụ mình giao.
- Giao và theo dõi KPI trong phạm vi quản lý.
- Đề xuất khen thưởng.
- Áp dụng kỷ luật trong phạm vi được phép.
- Tiếp nhận yêu cầu hỗ trợ từ cấp dưới.
- Kiểm tra và xử lý lịch part-time thuộc phạm vi quản lý.

## Chiến Sỹ

Nhân sự thực hiện công việc.

- Xem và nhận nhiệm vụ.
- Nộp báo cáo kết quả.
- Xem KPI, EXP, quân hàm và huy hiệu của mình.
- Gửi và theo dõi yêu cầu hỗ trợ.
- Part-time đăng ký lịch làm cho tuần kế tiếp trước hạn chốt.
- Full-time xem lịch cố định và ngày nghỉ đã được duyệt.
- Xem feed thành tích và cẩm nang được phép.

## Quản Trị Vận Hành

Vai trò nghiệp vụ đề xuất, không nhất thiết là tài khoản riêng trong phiên bản hiện tại.

- Kiểm tra tình trạng dịch vụ và dữ liệu.
- Xem audit log theo quyền được cấp.
- Thực hiện sao lưu và phục hồi.
- Không được tự ý thay đổi thành tích nghiệp vụ.

## Hệ Thống

Tác nhân tự động.

- Tính EXP, điểm mùa và quân hàm.
- Gửi thông báo, cảnh báo và nhắc hạn.
- Ghi audit log.
- Ngăn thao tác trùng và dữ liệu không hợp lệ.

## Ma Trận Quyền Tổng Quát

| Chức năng | Tổng Tư Lệnh | Tư Lệnh | Chiến Sỹ |
|---|---:|---:|---:|
| Xem dashboard cá nhân | Có | Có | Có |
| Xem dashboard toàn công ty | Có | Không | Không |
| Tạo tài khoản | Có | Không | Không |
| Tạo chiến dịch | Có | Không | Không |
| Tạo nhiệm vụ | Có | Trong phạm vi | Không |
| Nhận và nộp nhiệm vụ | Theo nghiệp vụ | Có | Có |
| Duyệt kết quả | Có | Nhiệm vụ mình giao | Không |
| Giao KPI | Có | Trong phạm vi | Không |
| Đề xuất khen | Có | Trong phạm vi | Không |
| Duyệt khen | Có | Không | Không |
| Xử phạt | Có | Trong phạm vi | Không |
| Quản lý tiểu đội | Có | Đề xuất | Không |
| Cấu hình quỹ thưởng | Có | Không | Không |
| Gửi yêu cầu hỗ trợ | Có | Có | Có |

## Nguyên tắc phân quyền

- Quyền phải được kiểm tra tại server/database, không chỉ ẩn nút.
- Tài khoản inactive không được đọc hoặc ghi dữ liệu.
- Không ai được tự duyệt, tự khen hoặc tự xử phạt chính mình.
- Tư Lệnh chỉ thao tác trong phạm vi tổ chức đã được giao.
- Service role không được xuất hiện ở trình duyệt.
