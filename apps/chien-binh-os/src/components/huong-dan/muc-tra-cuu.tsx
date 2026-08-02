import { Bang, CauHoi, Luu, Muc, P, Td, Th, TieuDePhu } from "@/components/huong-dan/khoi";

/**
 * Các mục tra cứu / FAQ / hạn chế: 8. Bảng tra cứu, 9. Câu hỏi thường gặp,
 * 10. Những hạn chế đã biết. Nội dung port nguyên văn từ
 * docs/huong-dan-su-dung.md.
 */

export function MucTraCuu() {
  return (
    <Muc id="tra-cuu" so={8} tieuDe="Bảng tra cứu">
      <TieuDePhu>8.1. Mười tám bậc quân hàm</TieuDePhu>
      <Bang>
        <thead>
          <tr>
            <Th>Bậc</Th>
            <Th canhPhai>EXP cần</Th>
            <Th>Bậc</Th>
            <Th canhPhai>EXP cần</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Tân Thủ</Td>
            <Td so>0</Td>
            <Td dam>Thiếu Tá</Td>
            <Td so>5.400</Td>
          </tr>
          <tr>
            <Td dam>Binh Nhì</Td>
            <Td so>150</Td>
            <Td dam>Trung Tá</Td>
            <Td so>6.500</Td>
          </tr>
          <tr>
            <Td dam>Binh Nhất</Td>
            <Td so>350</Td>
            <Td dam>Thượng Tá</Td>
            <Td so>7.700</Td>
          </tr>
          <tr>
            <Td dam>Hạ Sĩ</Td>
            <Td so>500</Td>
            <Td dam>Đại Tá</Td>
            <Td so>9.000</Td>
          </tr>
          <tr>
            <Td dam>Trung Sĩ</Td>
            <Td so>900</Td>
            <Td dam>Thiếu Tướng</Td>
            <Td so>10.500</Td>
          </tr>
          <tr>
            <Td dam>Thượng Sĩ</Td>
            <Td so>1.400</Td>
            <Td dam>Trung Tướng</Td>
            <Td so>12.500</Td>
          </tr>
          <tr>
            <Td dam>Thiếu Úy</Td>
            <Td so>2.000</Td>
            <Td dam>Thượng Tướng</Td>
            <Td so>15.000</Td>
          </tr>
          <tr>
            <Td dam>Trung Úy</Td>
            <Td so>2.700</Td>
            <Td dam>Đại Tướng</Td>
            <Td so>18.000</Td>
          </tr>
          <tr>
            <Td dam>Thượng Úy</Td>
            <Td so>3.500</Td>
            <Td dam>—</Td>
            <Td so>—</Td>
          </tr>
          <tr>
            <Td dam>Đại Úy</Td>
            <Td so>4.400</Td>
            <Td dam>—</Td>
            <Td so>—</Td>
          </tr>
        </tbody>
      </Bang>

      <TieuDePhu>8.2. Bảy huân chương</TieuDePhu>
      <Bang>
        <thead>
          <tr>
            <Th>Huân chương</Th>
            <Th>Đạt khi nào</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>🔥 Máu Lửa</Td>
            <Td>Hoàn thành nhiệm vụ đầu tiên</Td>
          </tr>
          <tr>
            <Td dam>💼 Hợp Đồng Lớn</Td>
            <Td>Ký hợp đồng giá trị cao</Td>
          </tr>
          <tr>
            <Td dam>📈 Bùng Nổ View</Td>
            <Td>Bài đạt mốc view khủng</Td>
          </tr>
          <tr>
            <Td dam>💡 Cải Tiến</Td>
            <Td>Sáng kiến giúp tổ chức tốt hơn</Td>
          </tr>
          <tr>
            <Td dam>🛡 Hậu Phương Vững</Td>
            <Td>Không lỗi vận hành trong tháng</Td>
          </tr>
          <tr>
            <Td dam>⚡ Bất Bại 7 Ngày</Td>
            <Td>7 ngày liên tiếp hoàn thành nhiệm vụ</Td>
          </tr>
          <tr>
            <Td dam>👑 Danh Tướng</Td>
            <Td>Đứng #1 bảng xếp hạng mùa</Td>
          </tr>
        </tbody>
      </Bang>

      <TieuDePhu>8.3. Đổi huân chương lấy thưởng</TieuDePhu>
      <Bang>
        <thead>
          <tr>
            <Th>Phần thưởng</Th>
            <Th canhPhai>Cần</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Nghỉ phép 1 ngày</Td>
            <Td so>3 huân chương</Td>
          </tr>
          <tr>
            <Td dam>Nghỉ phép 2 ngày</Td>
            <Td so>6 huân chương</Td>
          </tr>
          <tr>
            <Td dam>Tiền đào tạo / khóa học</Td>
            <Td so>4 huân chương</Td>
          </tr>
          <tr>
            <Td dam>Quà / hiện vật</Td>
            <Td so>2 huân chương</Td>
          </tr>
          <tr>
            <Td dam>Chương trình đào tạo VIP</Td>
            <Td so>Huân chương 👑</Td>
          </tr>
        </tbody>
      </Bang>

      <Luu kieu="canh_bao" nhan="Lưu ý">
        <P>
          Hệ thống <b>không có nút &quot;đổi thưởng&quot;</b>. Đây là bảng giá tham chiếu — việc đổi
          thực hiện ngoài hệ thống, làm việc trực tiếp với quản lý.
        </P>
      </Luu>
    </Muc>
  );
}

export function MucCauHoi() {
  return (
    <Muc id="cau-hoi" so={9} tieuDe="Câu hỏi thường gặp">
      <div className="space-y-2">
        <CauHoi hoi="Tôi quên mật khẩu, làm sao?">
          <P>
            Hệ thống chưa có &quot;Quên mật khẩu&quot; và bạn không tự đổi được. Liên hệ người quản
            trị hệ thống để đặt lại.
          </P>
        </CauHoi>
        <CauHoi hoi="Tôi được duyệt nhiệm vụ Daily ghi +60 EXP nhưng chỉ nhận 40?">
          <P>
            Đúng, không phải lỗi. Nhiệm vụ Daily và Bonus đều cộng đúng 40 EXP; con số trên thẻ chỉ
            là hiển thị. Nhiệm vụ tuần thì cộng đúng số ghi trên thẻ.
          </P>
        </CauHoi>
        <CauHoi hoi="Tôi bị phạt trừ EXP, quân hàm có tụt không?">
          <P>
            Không. Quân hàm đã đạt là <b>vĩnh viễn</b>. Điểm mùa cũng không bị trừ. Chỉ EXP giảm (và
            không xuống dưới 0).
          </P>
        </CauHoi>
        {/* Nhãn nút thật là "Nhận" + icon kiếm; prop `hoi` chỉ nhận string nên
            bỏ emoji thay vì nhét glyph không khớp giao diện. */}
        <CauHoi hoi="Tôi bấm nút Nhận nhưng báo lỗi?">
          <P>
            Có thể nhiệm vụ đó không giao cho bạn (&quot;Chỉ người được giao nhiệm vụ mới được
            nhận&quot;), hoặc bạn đã nhận rồi — bấm F5 để tải lại trang.
          </P>
        </CauHoi>
        <CauHoi hoi="Nộp báo cáo bị từ chối thì mất EXP không?">
          <P>
            Không. Từ chối <b>không cộng cũng không trừ</b> EXP. Bạn chỉ cần sửa theo lý do rồi nộp
            lại.
          </P>
        </CauHoi>
        <CauHoi hoi="Tôi hết 4 lượt yêu cầu hỗ trợ mà cần xin nghỉ gấp?">
          <P>
            Nút sẽ bị vô hiệu hoá tới đầu tháng sau. Trao đổi trực tiếp với quản lý ngoài hệ thống.
          </P>
        </CauHoi>
        <CauHoi hoi="Sao tôi không thấy trang mà đồng nghiệp có?">
          <P>
            Menu hiện theo vai trò (xem bảng ở mục 3). Nếu gõ URL vào trang không đúng vai trò, bạn
            bị đưa về trang chủ mà không có thông báo.
          </P>
        </CauHoi>
        <CauHoi hoi="Tại sao trên điện thoại tôi không thấy hết menu?">
          <P>Menu cuộn ngang trên màn hình nhỏ — kéo sang phải.</P>
        </CauHoi>
        <CauHoi hoi="Trước đây lần đầu vào hay phải chờ lâu, giờ còn không?">
          <P>
            Không còn nữa. Trước đây bản online chạy trên máy chủ tự &quot;ngủ&quot; sau 15 phút nên
            lần vào đầu tiên phải chờ khoảng 1 phút. Hệ thống đã chuyển sang nền tảng khác, giờ vào
            lúc nào cũng sẵn sàng ngay.
          </P>
        </CauHoi>
      </div>
    </Muc>
  );
}

export function MucHanChe() {
  return (
    <Muc id="han-che" so={10} tieuDe="Hạn chế đã biết">
      <P>Ghi lại để không mất thời gian đi tìm chức năng không tồn tại:</P>
      <Bang>
        <thead>
          <tr>
            <Th>Hạn chế</Th>
            <Th>Cách xử lý tạm</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Không tự đổi mật khẩu, không có &quot;Quên mật khẩu&quot;</Td>
            <Td>Nhờ quản trị đặt lại</Td>
          </tr>
          <tr>
            <Td dam>Không đổi được tiểu đội sau khi tài khoản đã tạo</Td>
            <Td>Nhờ quản trị sửa trong cơ sở dữ liệu</Td>
          </tr>
          <tr>
            <Td dam>Không sửa tay được con số hiện tại của KPI</Td>
            <Td>Luôn chọn &quot;khóa đo lường tự động&quot; khi giao KPI</Td>
          </tr>
          <tr>
            <Td dam>Không xoá / hoàn tác được án phạt</Td>
            <Td>Cân nhắc kỹ trước khi bấm phạt</Td>
          </tr>
          <tr>
            <Td dam>Không có nút đổi huân chương lấy thưởng</Td>
            <Td>Làm việc trực tiếp với quản lý</Td>
          </tr>
          <tr>
            <Td dam>Chưa có thông báo (email / tin nhắn) khi có việc mới</Td>
            <Td>Chủ động mở app kiểm tra hàng ngày</Td>
          </tr>
          <tr>
            <Td dam>Nhật ký hiện lý do từ chối / án phạt cho quản lý phòng và Tổng Tư Lệnh đọc</Td>
            <Td>Viết lý do khách quan, gọn</Td>
          </tr>
        </tbody>
      </Bang>
    </Muc>
  );
}
