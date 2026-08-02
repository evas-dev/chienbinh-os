import { EmojiIcon } from "@/components/chung/emoji-icon";
import {
  Bang,
  DanhSach,
  Luu,
  Muc,
  P,
  Td,
  Th,
  The,
  TieuDeBuoc,
  TieuDePhu,
} from "@/components/huong-dan/khoi";

/** Mục 7 của cẩm nang — dành riêng cho Tổng Tư Lệnh (CEO). */
export function MucTongTuLenh() {
  return (
    <Muc
      id="tong-tu-lenh"
      so={7}
      tieuDe="Dành cho Tổng Tư Lệnh"
      vaiTro="tong_tu_lenh"
      nhan={<The mau="do">Tổng Tư Lệnh</The>}
    >
      <P>
        CEO thấy <b>13 mục menu</b> — đầy đủ nhất. Dưới đây là 5 việc riêng của CEO.
      </P>

      <TieuDePhu>7.1. Trang chủ — Báo cáo tổng quan công ty</TieuDePhu>
      <P>
        Trang chủ của CEO <b>khác hoàn toàn</b> của nhân sự. Bạn thấy:
      </P>
      <DanhSach
        items={[
          <>
            <b>4 ô số lớn</b>: Doanh số (kèm %), Khách hàng mới, Hoàn thành mục tiêu (% trung bình
            có trọng số), Cảnh báo (xanh = 0, đỏ = có vấn đề)
          </>,
          <>
            <b>Tiến độ trọng số theo phòng ban</b> — mỗi trưởng phòng một dòng, kèm nhãn:{" "}
            <The mau="xanh">Vượt/Đạt</The> (≥100%) · <The mau="vang">Sắp đạt</The> (≥80%) ·{" "}
            <The mau="xam">Đang chạy</The> (≥60%) · <The mau="do">Chậm tiến độ</The> ({"<60%"})
          </>,
          <>
            <b>Chỉ số khách hàng &amp; tài chính</b> — doanh số, khách hàng mới, lead, công nợ thu
            hồi, CSAT
          </>,
          <>
            <b>Cảnh báo so với cùng kỳ</b> — tự nêu tên phòng nào đang dưới 60%
          </>,
        ]}
      />

      <TieuDePhu>7.2. Giao mục tiêu KPI</TieuDePhu>
      <P>
        Vào <b>Mục tiêu</b>. Trang liệt kê <b>mọi Tư Lệnh</b>, mỗi người 1 thẻ cho tuần hiện tại —
        ai chưa được giao KPI tuần này thì thẻ ghi <em>“Chưa có chỉ tiêu nào.”</em>. Bấm{" "}
        <b>
          <EmojiIcon glyph="➕" /> Giao thêm KPI
        </b>{" "}
        trong thẻ của họ:
      </P>
      <Bang>
        <thead>
          <tr>
            <Th>Ô</Th>
            <Th>Ghi chú</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Tên chỉ tiêu</Td>
            <Td>Bắt buộc</Td>
          </tr>
          <tr>
            <Td dam>Con số mục tiêu</Td>
            <Td>Phải lớn hơn 0</Td>
          </tr>
          <tr>
            <Td dam>Đơn vị</Td>
            <Td>Ví dụ: KH, view, video</Td>
          </tr>
          <tr>
            <Td dam>Trọng số (%)</Td>
            <Td>Từ 1 đến 100 — quyết định chỉ tiêu này nặng bao nhiêu trong tổng %</Td>
          </tr>
          <tr>
            <Td dam>Khóa đo lường tự động</Td>
            <Td>
              Chọn để KPI <b>tự tăng</b> khi trưởng phòng duyệt phiếu có số liệu tương ứng
            </Td>
          </tr>
        </tbody>
      </Bang>
      <P>
        Sáu lựa chọn khóa đo lường: <em>Không tự động</em> (cập nhật thủ công) hoặc tự động theo{" "}
        <b>Số lead / Số view / Số video / Số bài viết / Số bài web-SEO</b>.
      </P>
      <Luu kieu="meo" nhan="Nên làm">
        <P>
          Nên luôn chọn khóa đo lường tự động nếu chỉ tiêu đó đo được từ phiếu nộp. Nếu chọn{" "}
          <em>&quot;Không tự động&quot;</em>, con số phải cập nhật bằng tay — mà giao diện{" "}
          <b>chưa có chỗ để sửa tay</b>.
        </P>
      </Luu>
      <P>
        Nếu tuần đó người này đã có chỉ tiêu trùng, hệ thống hiện cảnh báo vàng và bạn phải bấm{" "}
        <b>Vẫn tạo thêm</b> để xác nhận.
      </P>
      <P>
        Bạn cũng có nút{" "}
        <b>
          <EmojiIcon glyph="➕" /> Giao việc trực tiếp cho nhân sự
        </b>{" "}
        để giao thẳng, không qua trưởng phòng.
      </P>

      <TieuDePhu>7.3. Duyệt khen thưởng</TieuDePhu>
      <P>
        Vào <b>Đề xuất khen</b> — bạn thấy đề xuất của <b>toàn công ty</b>.
      </P>
      <Bang>
        <thead>
          <tr>
            <Th>Nút</Th>
            <Th>Khi nào</Th>
            <Th>Kết quả</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>
              Trao <EmojiIcon glyph="🏅" />
            </Td>
            <Td>Đề xuất đang chờ</Td>
            <Td>
              Gắn huân chương vào hồ sơ nhân sự. <b>Không cộng EXP.</b>
            </Td>
          </tr>
          <tr>
            <Td dam>Từ chối</Td>
            <Td>Đề xuất đang chờ</Td>
            <Td>Đóng đề xuất, không cần nhập gì</Td>
          </tr>
          <tr>
            <Td dam>
              <EmojiIcon glyph="↩️" /> Thu hồi
            </Td>
            <Td>Đã trao</Td>
            <Td>
              Đánh dấu huân chương bị thu hồi. <b>Bắt buộc nhập lý do</b>. Lịch sử vẫn được giữ
            </Td>
          </tr>
        </tbody>
      </Bang>
      <Luu kieu="canh_bao" nhan="Lưu ý">
        <P>
          Không tự duyệt đề xuất do chính mình tạo. Một người chỉ giữ 1 lần mỗi loại huân chương —
          muốn trao lại phải thu hồi trước.
        </P>
      </Luu>

      <TieuDePhu>7.4. Quản trị nhân sự</TieuDePhu>
      <P>
        Vào <b>Quản trị nhân sự</b>. Có dãy nút lọc theo phòng ban (mặc định mở <b>Marketing</b>),
        và nút <b>Tất cả</b>.
      </P>

      <TieuDeBuoc>a) Ngưng / Kích hoạt tài khoản</TieuDeBuoc>
      <P>
        Mỗi dòng nhân sự có nút <b>Ngưng</b> (hoặc <b>Kích hoạt</b> nếu đang ngưng).{" "}
        <b>Bấm là chạy ngay, không có hộp xác nhận.</b>
      </P>
      <P>
        Người bị ngưng: không đăng nhập được, không nhận được nhiệm vụ mới, và nếu đang dùng dở thì
        bị đẩy ra ở lần bấm tiếp theo.
      </P>
      <P>
        Bạn <b>không ngưng được chính mình</b> (dòng của bạn hiện chữ <em>&quot;Bạn&quot;</em>) và{" "}
        <b>không ngưng được Tổng Tư Lệnh</b> khác (hiện chữ <em>&quot;CEO&quot;</em>).
      </P>

      <TieuDeBuoc>b) Tạo tài khoản nhân sự</TieuDeBuoc>
      <P>
        Bấm{" "}
        <b>
          <EmojiIcon glyph="➕" /> Tạo tài khoản
        </b>
        :
      </P>
      <Bang>
        <thead>
          <tr>
            <Th>Ô</Th>
            <Th canhGiua>Bắt buộc</Th>
            <Th>Ghi chú</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Họ tên</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td>—</Td>
          </tr>
          <tr>
            <Td dam>Số điện thoại (đăng nhập)</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td>Từ 8 số trở lên, chưa ai dùng</Td>
          </tr>
          <tr>
            <Td dam>Mật khẩu</Td>
            <Td canhGiua>—</Td>
            <Td>
              Điền sẵn <code>123456</code>, từ 4 ký tự
            </Td>
          </tr>
          <tr>
            <Td dam>Phòng ban</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td>
              Marketing / Sale <em>(Tiền tuyến)</em>; Dev / CSKH / Kế toán / HR{" "}
              <em>(Hậu phương)</em> — mặt trận tự suy ra
            </Td>
          </tr>
          <tr>
            <Td dam>Cấp bậc hệ thống</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td>
              <em>Chiến sỹ</em> hoặc <em>Tư lệnh</em>. <b>Không tạo được Tổng Tư Lệnh</b>
            </Td>
          </tr>
          <tr>
            <Td dam>Tiểu đội</Td>
            <Td canhGiua>—</Td>
            <Td>
              Tuỳ chọn, để <em>— Chưa gán —</em> nếu chưa cần
            </Td>
          </tr>
        </tbody>
      </Bang>
      <P>
        Tạo xong, thông báo hiện lại <b>tên · số điện thoại · mật khẩu</b> để bạn đọc cho nhân sự.
        Họ đăng nhập được ngay.
      </P>
      <P>
        Nếu có gì chưa đúng, hệ thống báo rõ bằng tiếng Việt — ví dụ{" "}
        <em>“Số điện thoại này đã có tài khoản, hãy dùng số khác”</em>,{" "}
        <em>“Số điện thoại phải có ít nhất 8 số”</em>, <em>“Phải nhập họ tên”</em>,{" "}
        <em>“Mật khẩu phải có ít nhất 4 ký tự”</em>. Sửa theo thông báo rồi bấm lại;{" "}
        <b>không có tài khoản nào bị tạo dở</b> khi báo lỗi.
      </P>

      <TieuDePhu>7.5. Quỹ thưởng</TieuDePhu>
      <P>
        Vào <b>Quỹ thưởng</b>.
      </P>
      <P>
        <b>Bên trái — Thiết lập quỹ:</b> nhập <b>Quỹ thưởng (VNĐ)</b>, chọn <b>Chu kỳ chia</b> (
        <b>3 tháng</b> hoặc <b>6 tháng</b>), bấm <b>Lưu cấu hình quỹ</b>. Lưu ngay, không có xác
        nhận.
      </P>
      <P>
        <b>Bên phải — Bảng chia thưởng cuối kỳ:</b> tự tính lại tức thì, xếp từ EXP cao xuống thấp,
        mỗi người hiện số tiền và <b>% quỹ</b>.
      </P>
      <P>
        Bảng chia thưởng <b>không tính Tổng Tư Lệnh</b> — CEO không được chia quỹ.
      </P>

      <TieuDePhu>7.6. Tiểu đội</TieuDePhu>
      <P>
        Chỉ để xem. Hai khối <b>TIỀN TUYẾN</b> và <b>HẬU PHƯƠNG</b>, mỗi tiểu đội một thẻ hiện đội
        trưởng, đội phó, thành viên, kèm <b>QUÂN SỐ</b>, <b>TỔNG EXP</b>, <b>TB / NGƯỜI</b>.
      </P>
      <P>
        Cơ cấu: <b>1 đội trưởng + 1 đội phó + không giới hạn thành viên</b>. Mỗi người chỉ thuộc{" "}
        <b>1 tiểu đội</b>.
      </P>
      <Luu kieu="canh_bao" nhan="Hạn chế đã biết">
        <P>
          Trang này <b>không có nút thêm/xoá/đổi thành viên</b>. Cách duy nhất qua giao diện để gán
          tiểu đội là chọn ô <em>&quot;Tiểu đội&quot;</em> <b>lúc tạo tài khoản mới</b>. Muốn đổi
          tiểu đội của người đã có tài khoản, phải nhờ người quản trị sửa trong cơ sở dữ liệu.
        </P>
      </Luu>
    </Muc>
  );
}
