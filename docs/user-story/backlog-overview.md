# Tổng Quan Backlog User Story

## Quy mô

- **17 epic nghiệp vụ**.
- **202 user stories**.
- **136 story P0** — bắt buộc hoặc rủi ro cao.
- **61 story P1** — quan trọng sau luồng lõi.
- **5 story P2** — mở rộng trải nghiệm.

## Phân loại trạng thái

| Trạng thái | Số story | Ý nghĩa |
|---|---:|---|
| Hiện có | 60 | Luồng đã có trong ứng dụng, vẫn cần kiểm thử và đối chiếu nghiệp vụ |
| Cần hoàn thiện | 83 | Chức năng có một phần hoặc còn thiếu điều kiện an toàn |
| Đề xuất | 59 | Năng lực nên bổ sung để hệ thống vận hành đầy đủ hơn |

## Độ phủ theo Epic

| Epic | Story | Trọng tâm |
|---|---:|---|
| Đăng nhập và tài khoản | 10 | Xác thực, phiên, khóa tài khoản, phục hồi truy cập |
| Sở chỉ huy và hồ sơ | 10 | Dashboard theo vai trò, hồ sơ, empty/error states |
| Quản trị nhân sự | 12 | Tạo, sửa, khóa, tìm kiếm, lịch sử thay đổi |
| Nhiệm vụ và chiến dịch | 16 | Tạo, giao, nhận, cây nhiệm vụ, deadline, tiến độ |
| Nộp kết quả và phê duyệt | 16 | Submission, duyệt, từ chối, thu hồi, idempotency |
| Mục tiêu và KPI | 12 | Giao KPI, metric key, trọng số, cập nhật tiến độ |
| Tổ chức và tiểu đội | 12 | Thành viên, đội trưởng, giới hạn quân số, lịch sử |
| EXP, quân hàm và xếp hạng | 12 | Ledger, điểm mùa, rank, leaderboard, điều chỉnh |
| Khen thưởng và phần thưởng | 11 | Đề xuất, duyệt, huy hiệu, thu hồi, công bằng |
| Kỷ luật và xử phạt | 11 | Vi phạm, EXP âm, bằng chứng, khiếu nại, thu hồi |
| Yêu cầu hỗ trợ | 11 | Tạo, giới hạn tháng, phản hồi, nghỉ phép, đóng băng điểm |
| Quỹ thưởng | 10 | Cấu hình, mô phỏng, phân bổ, khóa kỳ, lịch sử |
| Feed và minh bạch | 10 | Nhật ký, nội dung an toàn, cẩm nang, quyền riêng tư |
| Thông báo và nhắc việc | 10 | In-app, deadline, review, hỗ trợ, tùy chọn nhận tin |
| Bảo mật và độ tin cậy | 14 | RLS, quyền, XSS, audit, backup, recovery, concurrency |
| Báo cáo và vận hành | 10 | Báo cáo, export, health, migration, giám sát |
| Lịch làm việc và chấm công | 15 | Full-time, part-time, đăng ký tuần, khóa lịch, ngày nghỉ và điểm |

## Thứ tự triển khai đề xuất

### Đợt 1 — Khóa an toàn nền tảng

- Authentication và khóa tài khoản.
- Quyền server/database.
- Chặn tự nâng quyền hồ sơ.
- Tắt đăng ký công khai.
- Sanitize nội dung feed.
- Audit log và thao tác idempotent.
- Baseline migration, backup và restore.

### Đợt 2 — Khép kín nghiệp vụ lõi

- Tạo, giao, nhận và nộp nhiệm vụ.
- Duyệt, từ chối và thu hồi kết quả.
- EXP ledger, KPI và huy hiệu được cập nhật/hoàn tác đồng bộ.
- Phân quyền Tư Lệnh theo phạm vi quản lý.
- Tạo tài khoản nhân sự không để lại user mồ côi.

### Đợt 3 — Điều hành và minh bạch

- Dashboard theo vai trò.
- Tiểu đội, bảng xếp hạng, khen thưởng và kỷ luật.
- Yêu cầu hỗ trợ và quỹ thưởng.
- Feed hoạt động, thông báo và nhắc hạn.

### Đợt 4 — Vận hành dài hạn

- Báo cáo và xuất dữ liệu.
- Theo dõi sức khỏe hệ thống.
- Chính sách lưu trữ và quyền riêng tư.
- Disaster recovery và kiểm thử phục hồi định kỳ.

## Quy ước ưu tiên

- **P0:** thiếu story này có thể sai dữ liệu, vượt quyền hoặc chặn luồng chính.
- **P1:** cần để vận hành hiệu quả, minh bạch và ít thao tác thủ công.
- **P2:** cải thiện trải nghiệm hoặc chuẩn bị cho quy mô lớn hơn.

## Kiểm tra chất lượng đã thực hiện

- 202/202 story có vai trò.
- 202/202 story có ưu tiên.
- 202/202 story có trạng thái.
- 202/202 story có câu “Là một… tôi muốn… để…”.
- 202/202 story có ít nhất 3 tiêu chí Given–When–Then.
- Không có ID story trùng.
- Không có liên kết tài liệu bị thiếu.
- Mọi file epic dưới 800 dòng.

## Câu hỏi cần BA/PO chốt

- Phạm vi quản lý của Tư Lệnh dựa trên mặt trận, phòng ban hay tiểu đội?
- Khi thu hồi duyệt, huy hiệu và KPI có luôn bị hoàn tác không?
- Quân hàm cao nhất đã đạt có được giữ khi EXP giảm không?
- EXP nhiệm vụ ngày lấy đúng cấu hình hay dùng mức cố định?
- Quỹ thưởng phân bổ theo EXP tổng, điểm mùa hay công thức kết hợp?
- Người dùng có được khiếu nại xử phạt trực tiếp trên hệ thống không?
- Có cho phép nhiều Tổng Tư Lệnh hay chỉ một tài khoản duy nhất?
