import { EmojiIcon } from "@/components/chung/emoji-icon";
import {
  Bang,
  DanhSach,
  Luu,
  Muc,
  P,
  Th,
  Td,
  The,
  TieuDeBuoc,
  TieuDePhu,
} from "@/components/huong-dan/khoi";

/** Mục 5 của cẩm nang — Dành cho Chiến Sỹ (nhân viên). */
export function MucChienSy() {
  return (
    <Muc
      id="chien-sy"
      so={5}
      tieuDe="Dành cho Chiến Sỹ"
      vaiTro="chien_sy"
      nhan={<The mau="xanh">Chiến Sỹ</The>}
    >
      <TieuDePhu>5.1. Trang chủ — Sở chỉ huy</TieuDePhu>
      <P>Vào app là thấy ngay 4 khối:</P>
      <DanhSach
        soThuTu
        items={[
          <>
            <b>Hồ sơ của bạn</b> — tên, phòng ban, tiểu đội, quân hàm hiện tại, EXP, còn bao nhiêu
            EXP nữa thì lên cấp, số huân chương, điểm mùa.
          </>,
          <>
            <b>Nhiệm vụ hôm nay</b> — các nhiệm vụ Daily/Bonus chưa xong. Làm ngay tại đây được,
            không cần vào trang khác.
          </>,
          <>
            <b>Kho huân chương</b> — huân chương nào bạn đã có (sáng) và chưa có (mờ).
          </>,
          <>
            <b>Hồ sơ kỷ luật</b> — các án phạt của bạn. Sạch thì hiện{" "}
            <em>“Chưa có vi phạm nào — hồ sơ kỷ luật sạch 🛡”</em>.
          </>,
        ]}
      />

      <TieuDePhu>5.2. Việc hàng ngày: nhận → làm → nộp</TieuDePhu>
      <P>
        Vào <b>Bảng nhiệm vụ</b>. Nhiệm vụ được chia 3 nhóm:
      </P>
      <DanhSach
        items={[
          <>
            <b>Nhiệm vụ tuần — KPI</b>: chỉ tiêu giao cứng, tính cuối tuần
          </>,
          <>
            <b>Nhiệm vụ Daily</b>: lặp lại mỗi ngày
          </>,
          <>
            <b>Nhiệm vụ Bonus</b>: nhiệm vụ bổ sung để bứt phá
          </>,
        ]}
      />
      <P>
        Mỗi nhiệm vụ có <b>4 trạng thái</b>, và nút bấm đổi theo trạng thái:
      </P>
      <Bang>
        <thead>
          <tr>
            <Th>Trạng thái</Th>
            <Th>Bạn thấy</Th>
            <Th>Bạn làm gì</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>
              <The mau="xam">Chưa nhận</The>
            </Td>
            <Td>
              Nút Nhận <EmojiIcon glyph="⚔" />
            </Td>
            <Td>Bấm để nhận việc</Td>
          </tr>
          <tr>
            <Td dam>
              <The mau="vang">Đang làm</The>
            </Td>
            <Td>Nút Nộp báo cáo</Td>
            <Td>Làm xong thì bấm để nộp</Td>
          </tr>
          <tr>
            <Td dam>
              <The mau="tim">Chờ duyệt</The>
            </Td>
            <Td>Chip Chờ duyệt (bấm không được)</Td>
            <Td>Đợi quản lý duyệt</Td>
          </tr>
          <tr>
            <Td dam>
              <The mau="xanh">Hoàn thành</The>
            </Td>
            <Td>Chip ✔ Xong</Td>
            <Td>Xong rồi, EXP đã cộng</Td>
          </tr>
        </tbody>
      </Bang>

      <TieuDeBuoc>
        Bước 1 — Bấm Nhận <EmojiIcon glyph="⚔" />
      </TieuDeBuoc>
      <P>
        Nhiệm vụ chuyển sang <em>Đang làm</em>. Hiện thông báo <em>“Ra trận thôi, chiến binh!”</em>.
      </P>

      <TieuDeBuoc>Bước 2 — Làm việc thật ở bên ngoài</TieuDeBuoc>

      <TieuDeBuoc>Bước 3 — Bấm Nộp báo cáo</TieuDeBuoc>
      <P>
        Mở hộp thoại <b>Nộp kết quả nhiệm vụ</b>. Có 6 loại nội dung, mỗi loại là một dòng có ô tích
        + ô điền số:
      </P>
      <DanhSach
        items={["Video", "Số view", "Số lead", "Bài viết", "Bài web / SEO", "Nội dung khác"]}
      />
      <P>
        Cộng thêm ô <b>Ghi chú / bằng chứng</b> (tuỳ chọn) — nên điền link, mã khách hàng, số hoá
        đơn... để quản lý duyệt nhanh hơn.
      </P>
      <Luu kieu="canh_bao" nhan="Dễ mắc lỗi">
        <P>
          Phải <b>tích ô VÀ điền số</b> cho ít nhất 1 loại. Nếu chỉ tích mà không điền, hệ thống báo{" "}
          <em>“Tích ít nhất 1 loại nội dung.”</em>
        </P>
      </Luu>
      <P>
        Bấm{" "}
        <b>
          Nộp cho quản lý <EmojiIcon glyph="⚔" />
        </b>
        . Nhiệm vụ chuyển sang <em>Chờ duyệt</em>.
      </P>

      <TieuDeBuoc>Bước 4 — Chờ kết quả</TieuDeBuoc>
      <DanhSach
        items={[
          <>
            <b>Được duyệt</b> → cộng EXP ngay, nhiệm vụ thành <em>Hoàn thành</em>, có thông báo{" "}
            <em>“+X EXP”</em>. Nếu đủ điểm lên cấp, hiện thêm <em>“Thăng quân hàm! 🎖”</em>.
          </>,
          <>
            <b>Bị từ chối</b> → nhiệm vụ <b>quay lại Đang làm</b>, và bạn thấy băng đỏ{" "}
            <b>
              “<EmojiIcon glyph="❌" /> Bị từ chối: &lt;lý do&gt;”
            </b>{" "}
            ngay trên thẻ nhiệm vụ. Sửa theo lý do rồi <b>nộp lại</b> — hệ thống đếm <em>Lần 2</em>,{" "}
            <em>Lần 3</em>... Nộp lại bao nhiêu lần cũng được.
          </>,
        ]}
      />
      <Luu kieu="tin" nhan="Điều nhiều người thắc mắc">
        <P>
          Với <b>Nhiệm vụ Daily</b> và <b>Nhiệm vụ Bonus</b>, dù thẻ ghi <em>+60 EXP</em> hay{" "}
          <em>+80 EXP</em>, khi được duyệt bạn <b>luôn nhận đúng 40 EXP</b>. Con số trên thẻ chỉ là
          hiển thị. Nhiệm vụ tuần thì cộng đúng số ghi trên thẻ.
        </P>
      </Luu>

      <TieuDePhu>5.3. Xem lại việc đã xong</TieuDePhu>
      <P>
        Cuối trang <b>Bảng nhiệm vụ</b> có khối <b>Công việc đã hoàn thành</b> — 20 kết quả được
        duyệt gần nhất, kèm ngày và số EXP đã nhận.
      </P>

      <TieuDePhu>5.4. Yêu cầu hỗ trợ</TieuDePhu>
      <P>Dùng khi cần: xin hỗ trợ, xin nghỉ phép, hoặc gửi đề xuất cần duyệt.</P>
      <P>
        Vào <b>Yêu cầu hỗ trợ</b> → bấm <b>Tạo yêu cầu</b>. Chọn 1 trong 4 loại:
      </P>
      <Bang>
        <thead>
          <tr>
            <Th>Loại</Th>
            <Th>Gửi cho ai</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Hỗ trợ từ quản lý</Td>
            <Td>Tư Lệnh / Tổng Tư Lệnh</Td>
          </tr>
          <tr>
            <Td dam>Hỗ trợ từ nhân sự khác</Td>
            <Td>Chiến Sỹ khác</Td>
          </tr>
          <tr>
            <Td dam>Nghỉ phép</Td>
            <Td>Tư Lệnh / Tổng Tư Lệnh</Td>
          </tr>
          <tr>
            <Td dam>Đề xuất cần duyệt</Td>
            <Td>Tư Lệnh / Tổng Tư Lệnh</Td>
          </tr>
        </tbody>
      </Bang>
      <P>
        Điền <b>Người hỗ trợ</b> (hệ thống chọn sẵn lãnh đạo tiểu đội của bạn) và <b>Nội dung</b>,
        rồi bấm{" "}
        <b>
          Gửi yêu cầu <EmojiIcon glyph="⚔" />
        </b>
        .
      </P>
      <P>
        Yêu cầu có 4 trạng thái: <The mau="tim">Chờ duyệt</The> → <The mau="xanh">Đã duyệt</The> /{" "}
        <The mau="do">Từ chối</The>, hoặc <The mau="xam">Đã hủy</The> nếu bạn tự rút lại.
      </P>
      <Luu kieu="canh_bao" nhan="Giới hạn 4 yêu cầu mỗi tháng">
        <P>
          <b>Giới hạn 4 yêu cầu / tháng.</b> Nút hiện rõ số còn lại, ví dụ{" "}
          <em>
            “<EmojiIcon glyph="➕" /> Tạo yêu cầu (2/4 còn lại)”
          </em>
          . Hết lượt thì nút <b>bấm không được</b>, phải chờ sang tháng.
        </P>
        <P>
          <b>Hủy yêu cầu KHÔNG hoàn lại lượt.</b> Gửi rồi hủy vẫn tính là đã dùng 1 lượt. Nên cân
          nhắc trước khi gửi.
        </P>
      </Luu>

      <TieuDePhu>5.5. Những trang chỉ để xem</TieuDePhu>
      <DanhSach
        items={[
          <>
            <b>Quân hàm & Huân chương</b> — xem toàn bộ 18 bậc quân hàm (bậc của bạn có nhãn{" "}
            <em>“Đang ở đây”</em>), 7 loại huân chương, và bảng giá đổi thưởng.
          </>,
          <>
            <b>Nhật ký chiến công</b> — các hoạt động gần nhất <b>liên quan tới bạn</b> (bạn nộp gì,
            được duyệt gì, bị phạt gì).
          </>,
          <>
            <b>Cẩm nang</b> — giải thích cách công ty tính EXP / huân chương, kèm ví dụ cho phòng
            Marketing và phòng Sale.
          </>,
        ]}
      />
      <Luu kieu="canh_bao" nhan="Nhật ký không riêng tư hoàn toàn">
        <P>
          Bạn chỉ thấy việc của chính mình, nhưng{" "}
          <b>quản lý phòng bạn và Tổng Tư Lệnh đều đọc được</b> — kể cả lý do bị từ chối hay bị xử
          phạt.
        </P>
      </Luu>
    </Muc>
  );
}
