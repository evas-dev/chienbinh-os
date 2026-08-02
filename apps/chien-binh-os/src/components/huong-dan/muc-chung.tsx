import { EmojiIcon } from "@/components/chung/emoji-icon";
import {
  Bang,
  CongThuc,
  DanhSach,
  Luu,
  Muc,
  P,
  SoDoBuoc,
  Th,
  Td,
  The,
  TieuDePhu,
} from "@/components/huong-dan/khoi";

/**
 * Các mục dùng chung cho mọi vai trò: 1. Giới thiệu, 2. Đăng nhập,
 * 3. Ba vai trò, 4. Bốn con số. Nội dung port nguyên văn từ
 * docs/huong-dan-su-dung.md.
 */

export function MucGioiThieu() {
  return (
    <Muc id="gioi-thieu" so={1} tieuDe="CHIẾN BINH OS là gì?">
      <P>
        Là công cụ nội bộ để <b>vận hành công ty như một cuộc chiến</b>: công việc được giao thành
        &quot;nhiệm vụ&quot;, làm xong thì nộp cho quản lý duyệt, được duyệt thì cộng điểm. Điểm
        tích lũy dẫn tới <b>thăng quân hàm</b>, <b>huân chương</b> và <b>chia quỹ thưởng cuối kỳ</b>
        .
      </P>
      <P>Nói ngắn gọn, một vòng làm việc gồm 4 bước:</P>
      <SoDoBuoc
        buoc={[
          "Quản lý giao nhiệm vụ",
          "Bạn nhận",
          "Bạn làm & nộp kết quả",
          "Quản lý duyệt → Cộng điểm",
        ]}
      />
    </Muc>
  );
}

export function MucDangNhap() {
  return (
    <Muc id="dang-nhap" so={2} tieuDe="Đăng nhập">
      <DanhSach
        soThuTu
        items={[
          <>
            Mở{" "}
            <a href="https://chien-binh-os.vercel.app" target="_blank" rel="noopener">
              https://chien-binh-os.vercel.app
            </a>
          </>,
          <>
            Nhập <b>số điện thoại</b> (không phải email) và <b>mật khẩu</b>
          </>,
          <>
            Bấm{" "}
            <b>
              Vào trận <EmojiIcon glyph="⚔" />
            </b>
          </>,
        ]}
      />
      <P>
        Mật khẩu mặc định khi mới được cấp tài khoản là{" "}
        <b>
          <code>123456</code>
        </b>
        .
      </P>
      <P>
        <b>Đăng xuất:</b> góc trên bên phải, cạnh tên bạn, bấm <b>Đăng xuất</b>.
      </P>

      <TieuDePhu>Nếu đăng nhập không được</TieuDePhu>
      <Bang>
        <thead>
          <tr>
            <Th>Bạn thấy dòng chữ</Th>
            <Th>Nghĩa là</Th>
            <Th>Làm gì</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>
              <em>&quot;Sai số điện thoại hoặc mật khẩu, chiến binh!&quot;</em>
            </Td>
            <Td>Nhập sai một trong hai</Td>
            <Td>Kiểm tra lại số điện thoại, gõ lại mật khẩu</Td>
          </tr>
          <tr>
            <Td dam>
              <em>&quot;Tài khoản của bạn đã bị ngưng hoạt động...&quot;</em>
            </Td>
            <Td>Tài khoản đã bị khoá</Td>
            <Td>Liên hệ Tổng Tư Lệnh</Td>
          </tr>
          <tr>
            <Td dam>
              <em>&quot;Tài khoản của bạn không còn quyền truy cập...&quot;</em>
            </Td>
            <Td>Đang dùng thì bị khoá giữa buổi</Td>
            <Td>Liên hệ Tổng Tư Lệnh</Td>
          </tr>
        </tbody>
      </Bang>

      <Luu kieu="canh_bao" nhan="Lưu ý quan trọng">
        <P>
          hệ thống <b>chưa có chức năng tự đổi mật khẩu</b> và{" "}
          <b>không có &quot;Quên mật khẩu&quot;</b>. Nếu quên mật khẩu, bạn phải nhờ người quản trị
          hệ thống đặt lại giúp.
        </P>
      </Luu>
    </Muc>
  );
}

export function MucVaiTro() {
  return (
    <Muc id="vai-tro" so={3} tieuDe="Ba vai trò trong hệ thống">
      <Bang>
        <thead>
          <tr>
            <Th>Vai trò</Th>
            <Th>Là ai</Th>
            <Th>Việc chính</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Chiến Sỹ</Td>
            <Td>Nhân viên</Td>
            <Td>Nhận nhiệm vụ, làm, nộp kết quả</Td>
          </tr>
          <tr>
            <Td dam>Tư Lệnh</Td>
            <Td>Quản lý / trưởng phòng</Td>
            <Td>Giao nhiệm vụ cho nhân viên, duyệt kết quả, đề xuất khen, xử phạt</Td>
          </tr>
          <tr>
            <Td dam>Tổng Tư Lệnh</Td>
            <Td>CEO</Td>
            <Td>
              Giao mục tiêu cho quản lý, quản trị nhân sự, duyệt khen thưởng, thiết lập quỹ thưởng
            </Td>
          </tr>
        </tbody>
      </Bang>

      <P>
        Ngoài ra mỗi người thuộc một <b>mặt trận</b>:
      </P>
      <DanhSach
        items={[
          <>
            <b>Tiền Tuyến</b> — Marketing, Sale
          </>,
          <>
            <b>Hậu Phương</b> — Dev, CSKH, Kế toán, HR
          </>,
        ]}
      />

      <Luu kieu="meo" nhan="Nguyên tắc xuyên suốt">
        <P>
          Tư Lệnh chỉ được thao tác (giao việc, khen, phạt) với nhân sự <b>cùng mặt trận</b> với
          mình. Tổng Tư Lệnh thì không bị giới hạn này.
        </P>
      </Luu>

      <TieuDePhu>Menu — ai thấy trang nào</TieuDePhu>
      <Bang>
        <thead>
          <tr>
            <Th>Trang trên menu</Th>
            <Th canhGiua>Chiến Sỹ</Th>
            <Th canhGiua>Tư Lệnh</Th>
            <Th canhGiua>Tổng Tư Lệnh</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Sở chỉ huy (trang chủ)</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Bảng nhiệm vụ</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Yêu cầu hỗ trợ</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Quân hàm & Huân chương</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Nhật ký chiến công</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Cẩm nang</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Mục tiêu tháng</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Đề xuất khen</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Bảng xếp hạng</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Xử phạt</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Quản trị nhân sự</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Tiểu đội</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
          <tr>
            <Td dam>Quỹ thưởng</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>—</Td>
            <Td canhGiua>
              <The mau="xanh">✔</The>
            </Td>
          </tr>
        </tbody>
      </Bang>

      <P>
        Trên <b>điện thoại</b>, menu này cuộn ngang — kéo qua phải để thấy các mục còn lại.
      </P>
    </Muc>
  );
}

export function MucBonConSo() {
  return (
    <Muc id="bon-con-so" so={4} tieuDe="Bốn con số bạn cần hiểu">
      <P>Đây là phần dễ nhầm nhất. Đọc kỹ bảng này một lần là dùng được cả năm.</P>

      <Bang>
        <thead>
          <tr>
            <Th>Con số</Th>
            <Th>Ý nghĩa</Th>
            <Th>Điều cần nhớ</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>
              EXP <The mau="vang">điểm quân công</The>
            </Td>
            <Td>
              Đo <b>khối lượng công việc</b> bạn đã làm
            </Td>
            <Td>
              Tích luỹ <b>trọn đời, không bao giờ reset</b>. Dùng để thăng quân hàm và chia quỹ
              thưởng.
            </Td>
          </tr>
          <tr>
            <Td dam>Điểm mùa</Td>
            <Td>
              Điểm <b>thi đua</b> trên Bảng xếp hạng
            </Td>
            <Td>
              <b>Reset mỗi kỳ (3–6 tháng)</b> để ai cũng có cơ hội lật ngược. Bằng <b>60% số EXP</b>{" "}
              bạn nhận được.
            </Td>
          </tr>
          <tr>
            <Td dam>Quân hàm</Td>
            <Td>
              Cấp bậc, từ <em>Tân Thủ</em> lên <em>Đại Tướng</em>
            </Td>
            <Td>
              Thuần <b>danh vọng</b>. Chỉ lên, <b>không bao giờ tụt</b> — kể cả khi bạn bị trừ EXP.
            </Td>
          </tr>
          <tr>
            <Td dam>Huân chương</Td>
            <Td>
              Thưởng cho <b>kết quả nổi bật</b>
            </Td>
            <Td>Đổi ra tiền đào tạo / quà / ngày phép (đổi bên ngoài hệ thống).</Td>
          </tr>
        </tbody>
      </Bang>

      <P>
        <b>Quỹ thưởng cuối kỳ</b> chia theo công thức:
      </P>
      <CongThuc>Tiền của bạn = (EXP của bạn ÷ Tổng EXP toàn đội) × Quỹ thưởng</CongThuc>

      <Luu kieu="meo" nhan="Nói ngắn gọn">
        <P>
          Nghĩa là: <b>EXP là thứ quyết định tiền</b>, quân hàm chỉ là danh dự, điểm mùa chỉ để đua
          vui trong kỳ.
        </P>
      </Luu>
    </Muc>
  );
}
