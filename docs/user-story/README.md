# User Story — Chiến Binh OS

## Mục đích

Bộ tài liệu mô tả nhu cầu người dùng cho ứng dụng **Chiến Binh OS** tại `apps/chien-binh-os`. Nội dung dùng tiếng Việt dễ hiểu, tập trung giá trị nghiệp vụ, có tiêu chí chấp nhận để BA, PO, developer và tester cùng sử dụng.

Backlog hiện gồm **16 epic và 186 user stories**.

## Phạm vi

- Hệ chính: Next.js 16 + Supabase.
- Vai trò: Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ, hệ thống và quản trị vận hành.
- Bao gồm chức năng hiện có, chức năng cần hoàn thiện và đề xuất mở rộng.
- Không mô tả hệ Express/Vite cũ tại `apps/api` và `apps/web`.

## Cách đọc

Mỗi story có:

- **Mã:** định danh duy nhất.
- **Ưu tiên:** `P0` bắt buộc, `P1` quan trọng, `P2` mở rộng.
- **Trạng thái:** `Hiện có`, `Cần hoàn thiện`, `Đề xuất`.
- **User Story:** “Là một… tôi muốn… để…”.
- **Tiêu chí chấp nhận:** Given–When–Then.
- **Quy tắc nghiệp vụ:** giới hạn và ngoại lệ.

## Tài liệu nền

- [Tổng quan backlog](backlog-overview.md)
- [Mẫu User Story](user-story-template.md)
- [Vai trò và phân quyền](actors-and-permissions.md)
- [Quy tắc nghiệp vụ chung](business-rules.md)

## Danh mục Epic

| Epic | Nội dung |
|---|---|
| [Epic 01](epic-01-authentication-and-account.md) | Đăng nhập và tài khoản |
| [Epic 02](epic-02-command-center-and-profile.md) | Sở chỉ huy và hồ sơ |
| [Epic 03](epic-03-staff-administration.md) | Quản trị nhân sự |
| [Epic 04](epic-04-missions-and-campaigns.md) | Nhiệm vụ và chiến dịch |
| [Epic 05](epic-05-submission-and-approval.md) | Nộp kết quả và phê duyệt |
| [Epic 06](epic-06-objectives-and-kpi.md) | Mục tiêu và KPI |
| [Epic 07](epic-07-organization-and-squads.md) | Tổ chức và tiểu đội |
| [Epic 08](epic-08-exp-ranks-and-leaderboards.md) | EXP, quân hàm và xếp hạng |
| [Epic 09](epic-09-commendations-badges-and-rewards.md) | Khen thưởng, huy hiệu và phần thưởng |
| [Epic 10](epic-10-penalties-and-discipline.md) | Kỷ luật và xử phạt |
| [Epic 11](epic-11-support-requests.md) | Yêu cầu hỗ trợ |
| [Epic 12](epic-12-bonus-fund.md) | Quỹ thưởng |
| [Epic 13](epic-13-feed-guide-and-transparency.md) | Feed, cẩm nang và minh bạch |
| [Epic 14](epic-14-notifications-and-reminders.md) | Thông báo và nhắc việc |
| [Epic 15](epic-15-security-audit-and-reliability.md) | Bảo mật, audit và độ tin cậy |
| [Epic 16](epic-16-reporting-and-operations.md) | Báo cáo và vận hành |

## Definition of Ready

Một story sẵn sàng phát triển khi:

- Vai trò và giá trị nghiệp vụ rõ.
- Phạm vi quyền đã chốt.
- Tiêu chí chấp nhận có thể kiểm thử.
- Quy tắc dữ liệu và ngoại lệ đã xác định.
- Không phụ thuộc câu hỏi nghiệp vụ chưa giải quyết.

## Definition of Done

- Happy path và lỗi quan trọng hoạt động.
- Quyền được kiểm tra phía server/database.
- Có validation tại ranh giới dữ liệu.
- Không tạo dữ liệu trùng khi gửi lại request.
- Có thông báo tiếng Việt dễ hiểu.
- Có log/audit cho thao tác quan trọng.
- Có test phù hợp với mức rủi ro.
