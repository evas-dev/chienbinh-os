# Epic 09 — Khen Thưởng, Huy Hiệu Và Phần Thưởng

## Mục tiêu Epic

Giúp tổ chức ghi nhận thành tích đúng người, đúng phạm vi và công bằng; tách rõ đề xuất, phê duyệt, trao huy hiệu và chi trả phần thưởng; bảo đảm không trao trùng, có lịch sử, sổ cái, hoàn tác và khiếu nại.

## REW-01 — Đề xuất khen thưởng trong phạm vi

**Vai trò:** Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một Tư Lệnh, tôi muốn đề xuất Chiến Sỹ thuộc phạm vi quản lý để khen thưởng, để thành tích nổi bật được cấp cao xem xét.

### Tiêu chí chấp nhận

1. **Given** Chiến Sỹ đang hoạt động và thuộc phạm vi của Tư Lệnh, **when** chọn huy hiệu và nhập lý do, **then** hệ thống ghi nhận đề xuất chờ duyệt.
2. **Given** người được chọn ngoài phạm vi, **when** gửi đề xuất, **then** hệ thống từ chối dù dữ liệu có thể xuất hiện từ danh sách cũ.
3. **Given** lý do trống hoặc huy hiệu không hợp lệ, **when** gửi, **then** hệ thống yêu cầu bổ sung mà không tạo đề xuất.

### Quy tắc nghiệp vụ

- Tư Lệnh không được tự đề xuất khen chính mình.
- Đề xuất chưa tạo huy hiệu hoặc phần thưởng.

## REW-02 — Duyệt hoặc từ chối đề xuất khen thưởng

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một Tổng Tư Lệnh, tôi muốn duyệt hoặc từ chối đề xuất khen thưởng, để quyết định trao thưởng có kiểm soát.

### Tiêu chí chấp nhận

1. **Given** đề xuất đang chờ duyệt, **when** Tổng Tư Lệnh chấp thuận, **then** hệ thống chuyển trạng thái và trao quyền lợi theo cấu hình.
2. **Given** đề xuất đang chờ duyệt, **when** Tổng Tư Lệnh từ chối, **then** hệ thống lưu kết quả và không trao huy hiệu hoặc phần thưởng.
3. **Given** đề xuất đã có kết quả, **when** duyệt hoặc từ chối lần nữa, **then** hệ thống ngăn xử lý trùng.

### Quy tắc nghiệp vụ

- Không ai được tự duyệt đề xuất do mình tạo khi chính sách cấm.
- Mỗi đề xuất chỉ có một kết quả hiệu lực tại một thời điểm.

## REW-03 — Xem huy hiệu đã đạt và chưa đạt

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> Là một người dùng, tôi muốn xem kho huy hiệu và các huy hiệu mình đã đạt, để biết thành tích được ghi nhận và mục tiêu tiếp theo.

### Tiêu chí chấp nhận

1. **Given** danh mục huy hiệu tồn tại, **when** mở hồ sơ, **then** hệ thống phân biệt huy hiệu đã sở hữu và chưa đạt.
2. **Given** người dùng vừa được trao huy hiệu, **when** tải lại hồ sơ, **then** huy hiệu xuất hiện với thông tin phù hợp.
3. **Given** danh mục huy hiệu không tải được, **when** mở hồ sơ, **then** hệ thống báo lỗi thay vì hiển thị sai rằng người dùng không có huy hiệu.

### Quy tắc nghiệp vụ

- Chỉ hiển thị huy hiệu được phép công bố.
- Huy hiệu bị thu hồi phải thể hiện theo trạng thái và lịch sử đã chốt.

## REW-04 — Ngăn đề xuất và trao huy hiệu trùng

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Hệ Thống, tôi muốn ngăn đề xuất hoặc trao cùng huy hiệu từ cùng nguồn nhiều lần, để thành tích không bị nhân đôi.

### Tiêu chí chấp nhận

1. **Given** đã có đề xuất đang chờ cho cùng người, huy hiệu và nguồn, **when** gửi lại, **then** hệ thống dẫn tới đề xuất hiện có thay vì tạo bản mới.
2. **Given** huy hiệu duy nhất đã được trao từ nguồn đó, **when** duyệt lại yêu cầu lặp, **then** hệ thống không cấp thêm lần nữa.
3. **Given** huy hiệu cho phép đạt nhiều lần từ các kỳ khác nhau, **when** nguồn và kỳ khác nhau hợp lệ, **then** hệ thống ghi nhận theo quy tắc của huy hiệu.

### Quy tắc nghiệp vụ

- Tính duy nhất phải xét người nhận, huy hiệu, nguồn và kỳ áp dụng.
- Không dùng tên huy hiệu làm căn cứ duy nhất để phát hiện trùng.

## REW-05 — Áp dụng tiêu chí khen thưởng công bằng

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người chỉ huy, tôi muốn xem tiêu chí và bằng chứng trước khi đề xuất hoặc duyệt, để quyết định khen thưởng công bằng.

### Tiêu chí chấp nhận

1. **Given** huy hiệu có điều kiện rõ ràng, **when** đề xuất, **then** hệ thống hiển thị tiêu chí và mức đáp ứng của người được đề xuất.
2. **Given** dữ liệu bằng chứng chưa đủ hoặc có tranh chấp, **when** duyệt, **then** hệ thống cảnh báo cần rà soát thay vì khuyến nghị trao tự động.
3. **Given** hai người có thành tích tương đương, **when** xét thưởng, **then** người duyệt thấy cùng bộ tiêu chí và cùng kỳ so sánh.

### Quy tắc nghiệp vụ

- Tiêu chí phải được công bố trước thời điểm xét thưởng nếu dùng cho thi đua định kỳ.
- Không dùng dữ liệu ngoài phạm vi hoặc ngoài kỳ mà không nêu rõ.

## REW-06 — Ghi sổ cái phần thưởng

**Vai trò:** Hệ Thống, Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Đề xuất

> Là một người có thẩm quyền, tôi muốn mỗi phần thưởng có bút toán nguồn và trạng thái, để biết quyền lợi đã được ghi nhận, cấp phát hay thu hồi.

### Tiêu chí chấp nhận

1. **Given** đề xuất được duyệt và có phần thưởng kèm theo, **when** ghi nhận, **then** hệ thống tạo bút toán với người nhận, loại thưởng, giá trị, nguồn và thời gian.
2. **Given** phần thưởng đang chờ cấp, **when** xem sổ cái, **then** hệ thống phân biệt chờ cấp, đã cấp, đã sử dụng và đã thu hồi.
3. **Given** cùng nguồn được xử lý lại, **when** ghi thưởng, **then** hệ thống không tạo bút toán trùng.

### Quy tắc nghiệp vụ

- Huy hiệu và phần thưởng vật chất là hai quyền lợi riêng, phải đối soát riêng.
- Không sửa số dư hoặc trạng thái bằng cách xóa lịch sử.

## REW-07 — Đổi huy hiệu hoặc quyền lợi thành phần thưởng

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P2  
**Trạng thái:** Đề xuất

> Là một người sở hữu quyền lợi, tôi muốn gửi yêu cầu đổi phần thưởng theo chính sách, để thành tích mang lại giá trị sử dụng rõ ràng.

### Tiêu chí chấp nhận

1. **Given** người dùng có đủ quyền lợi và phần thưởng còn khả dụng, **when** gửi yêu cầu đổi, **then** hệ thống ghi nhận yêu cầu và giữ quyền lợi theo chính sách.
2. **Given** quyền lợi không đủ hoặc đã được dùng, **when** gửi yêu cầu, **then** hệ thống từ chối và nêu lý do.
3. **Given** yêu cầu đổi bị gửi lặp, **when** xử lý, **then** hệ thống chỉ giữ hoặc trừ quyền lợi một lần.

### Quy tắc nghiệp vụ

- Chính sách đổi phải nêu rõ giá trị, thời hạn và điều kiện hủy.
- Không cho phép số dư quyền lợi âm.

## REW-08 — Hoàn tác hoặc thu hồi khen thưởng sai

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn hoàn tác quyết định khen thưởng bị sai, để thu hồi quyền lợi đúng cách mà không xóa lịch sử.

### Tiêu chí chấp nhận

1. **Given** quyết định đã trao nhưng được xác định sai, **when** thu hồi với lý do, **then** hệ thống đảo huy hiệu, EXP hoặc phần thưởng liên quan theo quy tắc.
2. **Given** phần thưởng đã được sử dụng hoặc chi trả, **when** yêu cầu thu hồi, **then** hệ thống cảnh báo tác động và áp dụng quy trình xử lý phù hợp.
3. **Given** quyết định đã được thu hồi, **when** yêu cầu lại, **then** hệ thống không thu hồi trùng.

### Quy tắc nghiệp vụ

- Không xóa đề xuất, quyết định hoặc bút toán gốc.
- Thu hồi phải ghi người thực hiện, lý do và các quyền lợi bị ảnh hưởng.

## REW-09 — Xem lịch sử khen thưởng theo quyền

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn xem lịch sử đề xuất, quyết định và phần thưởng theo quyền, để theo dõi trạng thái và đối chiếu thành tích.

### Tiêu chí chấp nhận

1. **Given** Tư Lệnh đã tạo đề xuất, **when** xem lịch sử, **then** hệ thống hiển thị các đề xuất của mình và kết quả xử lý.
2. **Given** Chiến Sỹ được khen hoặc bị thu hồi, **when** xem hồ sơ, **then** hệ thống hiển thị lịch sử cá nhân được phép xem.
3. **Given** người dùng cố xem hồ sơ khen thưởng ngoài phạm vi, **when** truy cập, **then** hệ thống từ chối.

### Quy tắc nghiệp vụ

- Lịch sử phải phân biệt đề xuất, quyết định, trao quyền lợi và thu hồi.
- Nội dung nhạy cảm chỉ hiển thị cho vai trò phù hợp.

## REW-10 — Khiếu nại quyết định khen thưởng

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người liên quan, tôi muốn khiếu nại quyết định trao, từ chối hoặc thu hồi khen thưởng, để vụ việc được xem xét minh bạch.

### Tiêu chí chấp nhận

1. **Given** quyết định còn trong thời hạn khiếu nại, **when** người dùng gửi lý do và bằng chứng, **then** hệ thống ghi nhận vụ việc chờ xử lý.
2. **Given** cùng quyết định đã có khiếu nại đang mở, **when** gửi lại, **then** hệ thống ngăn tạo trùng.
3. **Given** vụ việc có kết luận, **when** người gửi xem, **then** hệ thống hiển thị kết quả, lý do và thay đổi quyền lợi nếu có.

### Quy tắc nghiệp vụ

- Người đề xuất hoặc người ra quyết định không tự giải quyết khiếu nại nếu thiếu cơ chế giám sát.
- Khiếu nại không tự động cấp hoặc thu hồi quyền lợi.

## REW-11 — Xử lý trạng thái trống, lỗi và audit

**Vai trò:** Người dùng, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn phân biệt chưa có đề xuất với lỗi tải dữ liệu và biết thao tác quan trọng được audit, để tin cậy quy trình khen thưởng.

### Tiêu chí chấp nhận

1. **Given** chưa có đề xuất hoặc huy hiệu, **when** mở trang, **then** hệ thống hiển thị trạng thái trống phù hợp vai trò.
2. **Given** dữ liệu không tải hoặc xử lý thất bại, **when** người dùng thao tác, **then** hệ thống báo lỗi an toàn và không hiển thị thành công giả.
3. **Given** có đề xuất, duyệt, từ chối, trao, đổi hoặc thu hồi, **when** kiểm tra audit theo quyền, **then** hệ thống hiển thị tác nhân, hành động, thời gian, đối tượng và kết quả.

### Quy tắc nghiệp vụ

- Lỗi hệ thống không được hiển thị như “chưa có dữ liệu”.
- Audit không được cho người dùng thường sửa hoặc xóa.
