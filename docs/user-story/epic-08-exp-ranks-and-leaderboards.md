# Epic 08 — EXP, Quân Hàm Và Bảng Xếp Hạng

## Mục tiêu Epic

Giúp mỗi người hiểu EXP và quân hàm của mình, tạo bảng xếp hạng minh bạch theo nhiều phạm vi, đồng thời bảo đảm điểm được ghi qua sổ cái, không cộng trùng, có thể hoàn tác và khiếu nại khi sai.

## EXP-01 — Xem EXP và quân hàm cá nhân

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Hiện có

> Là một người dùng, tôi muốn xem tổng EXP và quân hàm hiện tại của mình, để biết thành tích tích lũy lâu dài.

### Tiêu chí chấp nhận

1. **Given** người dùng đã đăng nhập, **when** mở Sở chỉ huy, **then** hệ thống hiển thị tổng EXP và quân hàm tương ứng.
2. **Given** tổng EXP thay đổi hợp lệ, **when** tải lại hồ sơ, **then** quân hàm được xác định theo ngưỡng đang hiệu lực.
3. **Given** dữ liệu quân hàm thiếu hoặc không hợp lệ, **when** mở hồ sơ, **then** hệ thống không hiển thị quân hàm sai và báo lỗi an toàn.

### Quy tắc nghiệp vụ

- EXP tích lũy trọn đời, không reset theo mùa.
- Quân hàm lấy từ cấu hình ngưỡng, không gán tùy ý cho từng người.

## EXP-02 — Theo dõi tiến độ lên quân hàm

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Hiện có

> Là một người dùng, tôi muốn biết còn bao nhiêu EXP để lên quân hàm tiếp theo, để có mục tiêu phấn đấu rõ ràng.

### Tiêu chí chấp nhận

1. **Given** còn quân hàm cao hơn, **when** xem hồ sơ, **then** hệ thống hiển thị tiến độ và số EXP còn thiếu.
2. **Given** người dùng đã đạt quân hàm cao nhất, **when** xem tiến độ, **then** hệ thống thể hiện đã đạt mức cao nhất thay vì số âm hoặc ngưỡng không tồn tại.
3. **Given** hai ngưỡng quân hàm bị trùng hoặc sai thứ tự, **when** tính tiến độ, **then** hệ thống đánh dấu cấu hình cần rà soát.

### Quy tắc nghiệp vụ

- Ngưỡng quân hàm phải tăng dần và không chồng lấn.
- Cách làm tròn tiến độ phải nhất quán trên mọi màn hình.

## EXP-03 — Xem sổ cái EXP cá nhân

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn xem từng khoản cộng hoặc trừ EXP của mình, để đối chiếu tổng điểm và hiểu lý do thay đổi.

### Tiêu chí chấp nhận

1. **Given** người dùng có biến động EXP, **when** mở lịch sử, **then** hệ thống hiển thị số tăng giảm, lý do, nguồn tham chiếu và thời gian.
2. **Given** một khoản đã được hoàn tác, **when** xem lịch sử, **then** cả bút toán gốc và bút toán đảo vẫn hiển thị.
3. **Given** người dùng mở sổ cái của người khác không thuộc quyền, **when** truy cập, **then** hệ thống từ chối.

### Quy tắc nghiệp vụ

- `exp_log` là sổ cái nguồn sự thật.
- Không sửa trực tiếp tổng EXP trên hồ sơ.

## EXP-04 — Ghi EXP từ nghiệp vụ hợp lệ

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Hệ Thống, tôi muốn ghi EXP từ nhiệm vụ, khen thưởng hoặc kỷ luật có nguồn rõ ràng, để tổng EXP phản ánh đúng sự kiện nghiệp vụ.

### Tiêu chí chấp nhận

1. **Given** một sự kiện đủ điều kiện cộng hoặc trừ EXP, **when** nghiệp vụ hoàn tất, **then** hệ thống tạo bút toán với số điểm, lý do, nguồn và tác nhân.
2. **Given** giá trị EXP không khớp cấu hình nghiệp vụ, **when** ghi nhận, **then** hệ thống từ chối và không thay đổi tổng điểm.
3. **Given** ghi sổ thất bại, **when** nghiệp vụ kết thúc, **then** hệ thống không để trạng thái nghiệp vụ và tổng EXP lệch nhau.

### Quy tắc nghiệp vụ

- EXP nhiệm vụ lấy từ cấu hình nhiệm vụ.
- Mọi bút toán phải có nguồn tham chiếu khi nguồn tồn tại.

## EXP-05 — Ngăn cộng hoặc trừ EXP trùng

**Vai trò:** Hệ Thống  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một Hệ Thống, tôi muốn ngăn cùng một sự kiện ghi EXP nhiều lần, để không ai được lợi hoặc chịu thiệt do yêu cầu lặp.

### Tiêu chí chấp nhận

1. **Given** một nguồn đã tạo bút toán EXP, **when** cùng yêu cầu được gửi lại, **then** hệ thống trả kết quả nhất quán mà không tạo bút toán mới.
2. **Given** hai yêu cầu giống nhau xảy ra gần đồng thời, **when** xử lý, **then** chỉ một bút toán nguồn được chấp nhận.
3. **Given** hai sự kiện khác nhau có cùng số EXP, **when** ghi sổ, **then** hệ thống vẫn cho phép vì nguồn tham chiếu khác nhau.

### Quy tắc nghiệp vụ

- Dữ liệu trùng xác định theo loại nguồn, nguồn tham chiếu và loại biến động.
- Không dùng tên người hoặc số điểm làm khóa duy nhất.

## EXP-06 — Xem bảng xếp hạng nhiều phạm vi

**Vai trò:** Tổng Tư Lệnh, Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn xem xếp hạng cá nhân, tiểu đội và mặt trận theo quyền, để biết vị trí thi đua của mình.

### Tiêu chí chấp nhận

1. **Given** người dùng có quyền xem, **when** chọn phạm vi cá nhân, tiểu đội hoặc mặt trận, **then** hệ thống hiển thị thứ hạng và điểm mùa tương ứng.
2. **Given** Chiến Sỹ mở bảng xếp hạng, **when** xem danh sách, **then** hệ thống chỉ hiển thị thông tin thi đua được công bố, không lộ dữ liệu riêng.
3. **Given** người dùng không thuộc phạm vi nào, **when** xem bảng hạng, **then** hệ thống vẫn hiển thị trạng thái phù hợp mà không đánh dấu nhầm “Bạn”.

### Quy tắc nghiệp vụ

- Bảng xếp hạng dùng điểm mùa, không dùng tổng EXP trọn đời.
- Quyền xem toàn công ty và chi tiết cá nhân phải tách biệt.

## EXP-07 — Xếp hạng công bằng khi bằng điểm

**Vai trò:** Hệ Thống  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một Hệ Thống, tôi muốn áp dụng quy tắc hòa điểm và điều kiện tham gia minh bạch, để bảng xếp hạng công bằng.

### Tiêu chí chấp nhận

1. **Given** hai đối tượng có cùng điểm mùa, **when** xếp hạng, **then** hệ thống áp dụng tiêu chí phụ đã công bố hoặc đồng hạng.
2. **Given** tài khoản inactive hoặc bị loại khỏi kỳ thi đua, **when** tổng hợp, **then** hệ thống xử lý theo chính sách mà không làm thay đổi lịch sử kỳ cũ.
3. **Given** tiểu đội có quân số khác nhau, **when** so sánh, **then** hệ thống dùng cách tính đã công bố và đánh dấu ngoại lệ có ảnh hưởng.

### Quy tắc nghiệp vụ

- Quy tắc hòa điểm phải được chốt trước khi kết thúc mùa.
- Không thay đổi tiêu chí hồi tố nếu chưa có quyết định được ghi nhận.

## EXP-08 — Quản lý vòng đời điểm mùa

**Vai trò:** Tổng Tư Lệnh  
**Ưu tiên:** P1  
**Trạng thái:** Cần hoàn thiện

> Là một Tổng Tư Lệnh, tôi muốn mở, chốt và reset điểm mùa theo chiến dịch, để mọi người có cơ hội thi đua lại mà lịch sử vẫn còn.

### Tiêu chí chấp nhận

1. **Given** mùa mới được mở, **when** bắt đầu tính điểm, **then** điểm mùa mới xuất phát theo quy tắc đã công bố còn tổng EXP giữ nguyên.
2. **Given** mùa còn khiếu nại chưa xử lý, **when** yêu cầu chốt, **then** hệ thống cảnh báo các vụ việc còn mở trước khi xác nhận.
3. **Given** mùa đã chốt, **when** xem lại, **then** thứ hạng, điểm và thành viên theo kỳ vẫn được bảo toàn.

### Quy tắc nghiệp vụ

- Reset điểm mùa không được xóa bút toán lịch sử.
- Mỗi biến động điểm mùa phải đối chiếu được với nguồn nghiệp vụ.

## EXP-09 — Hoàn tác EXP và điểm mùa

**Vai trò:** Hệ Thống, Tổng Tư Lệnh  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người có thẩm quyền, tôi muốn hoàn tác khoản EXP hoặc điểm mùa phát sinh từ quyết định sai, để các bảng điểm trở về đúng trạng thái.

### Tiêu chí chấp nhận

1. **Given** một phê duyệt, khen thưởng hoặc xử phạt bị thu hồi hợp lệ, **when** hoàn tác, **then** hệ thống tạo bút toán đảo đúng giá trị liên quan.
2. **Given** bút toán đã được hoàn tác trước đó, **when** yêu cầu hoàn tác lần nữa, **then** hệ thống không đảo trùng.
3. **Given** hoàn tác ảnh hưởng quân hàm hoặc bảng xếp hạng, **when** hoàn tất, **then** các kết quả liên quan được tính lại nhất quán.

### Quy tắc nghiệp vụ

- Không sửa hoặc xóa bút toán gốc.
- Bút toán đảo phải tham chiếu sự kiện và lý do hoàn tác.

## EXP-10 — Khiếu nại điểm và thứ hạng

**Vai trò:** Tư Lệnh, Chiến Sỹ  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người tham gia thi đua, tôi muốn khiếu nại khoản điểm hoặc thứ hạng bị sai, để kết quả được xem xét trước khi trao quyền lợi.

### Tiêu chí chấp nhận

1. **Given** còn thời hạn khiếu nại, **when** người dùng chọn khoản điểm hoặc kỳ xếp hạng và nêu lý do, **then** hệ thống ghi nhận vụ việc.
2. **Given** cùng khoản điểm đã có khiếu nại đang mở, **when** gửi lại, **then** hệ thống ngăn tạo trùng.
3. **Given** khiếu nại được giải quyết, **when** người gửi xem kết quả, **then** hệ thống hiển thị kết luận và bút toán điều chỉnh nếu có.

### Quy tắc nghiệp vụ

- Người tạo bút toán bị khiếu nại không tự kết luận vụ việc nếu không có cơ chế giám sát.
- Việc xử lý không được xóa lịch sử điểm ban đầu.

## EXP-11 — Xử lý bảng hạng trống và lỗi tính điểm

**Vai trò:** Người dùng, Quản Trị Vận Hành  
**Ưu tiên:** P0  
**Trạng thái:** Cần hoàn thiện

> Là một người dùng, tôi muốn phân biệt chưa có điểm với lỗi tính hoặc tải dữ liệu, để không hiểu sai kết quả thi đua.

### Tiêu chí chấp nhận

1. **Given** mùa chưa có người phát sinh điểm, **when** mở bảng hạng, **then** hệ thống hiển thị trạng thái trống dễ hiểu.
2. **Given** một nguồn dữ liệu không tải được, **when** tổng hợp xếp hạng, **then** hệ thống không công bố bảng hạng thiếu như kết quả hoàn chỉnh.
3. **Given** tổng hồ sơ lệch với sổ cái, **when** Quản Trị Vận Hành đối soát, **then** hệ thống đánh dấu sai lệch và hỗ trợ xác định phạm vi ảnh hưởng.

### Quy tắc nghiệp vụ

- Lỗi hệ thống không được hiển thị như “0 điểm”.
- Dữ liệu chưa hoàn chỉnh phải có trạng thái cảnh báo rõ.

## EXP-12 — Audit cấu hình quân hàm và điểm

**Vai trò:** Tổng Tư Lệnh, Quản Trị Vận Hành  
**Ưu tiên:** P1  
**Trạng thái:** Đề xuất

> Là một người có thẩm quyền, tôi muốn xem audit của thay đổi ngưỡng quân hàm, mùa và bút toán điểm, để kiểm soát các quyết định ảnh hưởng quyền lợi.

### Tiêu chí chấp nhận

1. **Given** cấu hình quân hàm hoặc mùa thay đổi, **when** xem audit, **then** hệ thống hiển thị giá trị trước, giá trị sau, tác nhân và thời gian.
2. **Given** có thao tác cộng, trừ hoặc hoàn tác điểm, **when** kiểm tra, **then** audit liên kết được với bút toán và nguồn nghiệp vụ.
3. **Given** người dùng thường yêu cầu sửa audit, **when** thao tác, **then** hệ thống từ chối.

### Quy tắc nghiệp vụ

- Audit không thay thế sổ cái EXP.
- Audit và sổ cái đều không cho phép người dùng thường sửa hoặc xóa.
