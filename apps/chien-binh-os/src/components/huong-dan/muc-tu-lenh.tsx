import { EmojiIcon } from "@/components/chung/emoji-icon";
import { Bang, DanhSach, Luu, Muc, P, Td, Th, The, TieuDePhu } from "@/components/huong-dan/khoi";

/** Mục 6 của cẩm nang — dành cho Tư Lệnh (quản lý / trưởng phòng). */
export function MucTuLenh() {
  return (
    <Muc
      id="tu-lenh"
      so={6}
      tieuDe="Dành cho Tư Lệnh"
      vaiTro="tu_lenh"
      nhan={<The mau="vang">Tư Lệnh</The>}
    >
      <P>
        Tư Lệnh làm được mọi việc của Chiến Sỹ (bạn cũng có nhiệm vụ riêng), cộng thêm 4 nhóm việc
        dưới đây.
      </P>

      <TieuDePhu>6.1. Duyệt kết quả của lính — việc quan trọng nhất</TieuDePhu>

      <P>
        Vào <b>Bảng nhiệm vụ</b>. Bên trái có 2 khối:
      </P>
      <DanhSach
        items={[
          <>
            <b>Chờ anh/chị duyệt (N)</b> — hàng chờ cần xử lý
          </>,
          <>
            <b>Kết quả đã xử lý</b> — 15 phiếu gần nhất
          </>,
        ]}
      />

      <P>
        Mỗi phiếu hiện: tên nhiệm vụ, tên nhân sự, ngày nộp, và <b>số liệu họ nộp</b> (ví dụ{" "}
        <em>&quot;Video: 3 · Số lead: 12 · Ghi chú: ...&quot;</em>).
      </P>

      <Bang>
        <thead>
          <tr>
            <Th>Nút</Th>
            <Th>Khi nào hiện</Th>
            <Th>Xảy ra gì</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>
              Duyệt <EmojiIcon glyph="✅" />
            </Td>
            <Td>Phiếu đang chờ</Td>
            <Td>
              Cộng EXP cho nhân sự, nhiệm vụ thành <em>Hoàn thành</em>
            </Td>
          </tr>
          <tr>
            <Td dam>Từ chối</Td>
            <Td>Phiếu đang chờ</Td>
            <Td>
              Nhiệm vụ trả về <em>Đang làm</em> để họ nộp lại. <b>Bắt buộc nhập lý do</b>
            </Td>
          </tr>
          <tr>
            <Td dam>Đổi sang từ chối</Td>
            <Td>
              Phiếu <em>đã duyệt</em>
            </Td>
            <Td>
              Thu hồi lại EXP đã cộng. <b>Bắt buộc nhập lý do</b>
            </Td>
          </tr>
        </tbody>
      </Bang>

      <P>
        <b>
          Khi bấm Duyệt <EmojiIcon glyph="✅" />:
        </b>
      </P>
      <DanhSach
        items={[
          <>Nhân sự được cộng EXP — đúng bằng số ghi trên thẻ nhiệm vụ</>,
          <>Điểm mùa của họ cộng thêm 60% số EXP đó</>,
          <>Nhiệm vụ nhảy lên 100% tiến độ</>,
          <>
            <b>KPI của chính bạn tự động tăng</b> (xem mục 6.2)
          </>,
          <>Hiện trên Nhật ký chiến công của nhân sự đó (bạn và CEO cũng thấy)</>,
        ]}
      />

      <P>
        <b>Khi bấm Từ chối:</b> phải nhập <b>Lý do (bắt buộc)</b>. Lý do này nhân sự sẽ đọc được, và{" "}
        <b>Tổng Tư Lệnh cũng đọc được trên Nhật ký</b> — nên viết gọn, khách quan, nói rõ cần sửa
        gì.
      </P>

      <P>
        <b>Khi bấm Đổi sang từ chối</b> (= thu hồi): dùng khi <b>đã duyệt rồi mới phát hiện sai</b>{" "}
        (số liệu gian, duyệt nhầm người). Hệ thống sẽ{" "}
        <b>trừ lại đúng số EXP, đúng điểm mùa và đúng phần KPI</b> đã cộng. Chỉ thu hồi được{" "}
        <b>1 lần</b>; sau đó muốn duyệt lại thì nhân sự phải nộp phiếu mới.
      </P>

      <Luu kieu="canh_bao" nhan="Giới hạn">
        <P>
          Bạn <b>không thể tự duyệt kết quả của chính mình</b>. Nhiệm vụ của bạn phải do Tổng Tư
          Lệnh (hoặc người đã giao cho bạn) duyệt.
        </P>
        <P>Hàng chờ chỉ hiện phiếu của nhiệm vụ do chính bạn giao.</P>
      </Luu>

      <TieuDePhu>6.2. Mục tiêu tuần — và cách bẻ nhỏ thành việc hàng ngày</TieuDePhu>

      <P>
        Vào <b>Mục tiêu</b>. Bạn thấy:
      </P>

      <P>
        <b>a) Thẻ KPI của chính bạn</b> — mục tiêu mà CEO giao cho bạn, kèm % hoàn thành có trọng
        số. Bạn <b>chỉ xem, không sửa được</b> (chỉ CEO giao KPI).
      </P>

      <P>
        <b>b) Khối Bẻ mục tiêu thành nhiệm vụ Daily</b> — 6 nút mẫu bấm-là-giao:
      </P>

      <Bang>
        <thead>
          <tr>
            <Th>Nút mẫu</Th>
            <Th canhPhai>Chỉ tiêu mặc định</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>＋ Viết 1 bài / đăng nội dung</Td>
            <Td so>1 bài</Td>
          </tr>
          <tr>
            <Td dam>＋ Sản xuất video ngắn</Td>
            <Td so>3 video</Td>
          </tr>
          <tr>
            <Td dam>＋ Đạt view nội dung</Td>
            <Td so>5000 view</Td>
          </tr>
          <tr>
            <Td dam>＋ Học xong 1 kỹ năng mới</Td>
            <Td so>1 kỹ năng</Td>
          </tr>
          <tr>
            <Td dam>＋ Cập nhật 1 thông tin / insight mới</Td>
            <Td so>1 tin</Td>
          </tr>
          <tr>
            <Td dam>＋ Chăm sóc khách hàng</Td>
            <Td so>10 khách</Td>
          </tr>
        </tbody>
      </Bang>

      <P>
        Bấm một nút → hộp thoại đã điền sẵn → chỉ cần chọn <b>Giao cho</b> (danh sách chỉ có Chiến
        Sỹ cùng mặt trận với bạn) → bấm{" "}
        <b>
          Giao <EmojiIcon glyph="⚔" />
        </b>
        . Hoặc bấm{" "}
        <b>
          <EmojiIcon glyph="➕" /> Nhiệm vụ tùy chỉnh
        </b>{" "}
        để tự đặt tất cả.
      </P>

      <Luu kieu="meo" nhan="KPI của bạn tự chạy thế nào">
        <P>
          Khi bạn duyệt một phiếu nộp có số liệu (lead / view / video / bài viết / bài web), thì KPI{" "}
          <b>của bạn</b> — người giao việc — tự tăng theo, và dừng ở đúng mức mục tiêu (không vượt
          100%). Nghĩa là{" "}
          <b>giao việc cho lính và duyệt kết quả chính là cách bạn hoàn thành KPI của mình.</b>
        </P>
        <P>
          KPI chỉ tự chạy nếu CEO đã đặt &quot;khóa đo lường tự động&quot; cho chỉ tiêu đó. Nếu
          không, con số phải cập nhật bằng tay — mà hiện giao diện chưa có chỗ sửa tay, cần nhờ
          người quản trị.
        </P>
      </Luu>

      <TieuDePhu>6.3. Nhiệm vụ lặp — đặt lịch một lần, khỏi giao lại mỗi sáng</TieuDePhu>

      <P>
        Vào <b>Bảng nhiệm vụ</b> → khối <b>Nhiệm vụ lặp</b> → bấm <b>Đặt lịch lặp</b>. Chọn những
        thứ trong tuần cần giao (mặc định tích sẵn <b>T2 đến T7</b>, bỏ tích được nếu đội bạn chỉ
        chạy vài ngày), chọn người nhận, đặt chỉ tiêu và EXP.
      </P>
      <P>
        Từ đó mỗi ngày đã chọn, hệ thống <b>tự tạo nhiệm vụ mới</b> vào lúc nửa đêm, hạn là chính
        ngày hôm đó. Hôm nay nếu nằm trong lịch thì có ngay, không phải đợi tới mai.
      </P>
      <Bang>
        <thead>
          <tr>
            <Th>Nút</Th>
            <Th>Tác dụng</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Tạm dừng</Td>
            <Td>Ngừng sinh nhiệm vụ mới, giữ nguyên lịch để bật lại sau</Td>
          </tr>
          <tr>
            <Td dam>Xoá lịch</Td>
            <Td>Bỏ hẳn lịch. Nhiệm vụ đã giao vẫn còn nguyên, chỉ ngừng sinh tiếp</Td>
          </tr>
        </tbody>
      </Bang>
      <Luu kieu="tin" nhan="Không sợ trùng">
        <P>
          Mỗi lịch chỉ sinh <b>đúng một nhiệm vụ mỗi ngày</b>. Dù hệ thống có chạy lại nhiều lần
          trong ngày cũng không tạo thêm bản trùng.
        </P>
      </Luu>

      <TieuDePhu>6.4. Giao nhiệm vụ (cách đầy đủ)</TieuDePhu>

      <P>
        Ngoài 6 nút mẫu ở trên, bạn có thể vào <b>Bảng nhiệm vụ</b> → bấm{" "}
        <b>
          <EmojiIcon glyph="➕" /> Tạo nhiệm vụ
        </b>
        :
      </P>

      <Bang>
        <thead>
          <tr>
            <Th>Ô cần điền</Th>
            <Th>Ghi chú</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Tên nhiệm vụ</Td>
            <Td>Bắt buộc</Td>
          </tr>
          <tr>
            <Td dam>Loại</Td>
            <Td>
              <em>Nhiệm vụ tuần (KPI khối lượng)</em> hoặc <em>Nhiệm vụ Bonus</em>
            </Td>
          </tr>
          <tr>
            <Td dam>Thuộc chiến dịch (cha)</Td>
            <Td>
              Chọn chiến dịch CEO đã giao cho bạn, hoặc để <em>— Không gắn —</em>
            </Td>
          </tr>
          <tr>
            <Td dam>Giao cho</Td>
            <Td>Chỉ hiện Chiến Sỹ cùng mặt trận</Td>
          </tr>
          <tr>
            <Td dam>Chỉ tiêu</Td>
            <Td>Phải lớn hơn 0</Td>
          </tr>
          <tr>
            <Td dam>Đơn vị</Td>
            <Td>Ví dụ: khách hàng, video, view</Td>
          </tr>
          <tr>
            <Td dam>EXP thưởng</Td>
            <Td>Chính là số EXP nhân sự nhận khi được duyệt. Sửa được tuỳ ý.</Td>
          </tr>
          <tr>
            <Td dam>Hạn</Td>
            <Td>Bấm vào ô để mở lịch chọn ngày. Mặc định là Chủ Nhật tuần này.</Td>
          </tr>
        </tbody>
      </Bang>

      <P>
        Bấm{" "}
        <b>
          Bàn giao <EmojiIcon glyph="⚔" />
        </b>
        . Nhiệm vụ xuất hiện trong danh sách của nhân sự ở trạng thái <em>Chưa nhận</em>.
      </P>

      <Luu kieu="canh_bao" nhan="Giới hạn">
        <P>
          Không giao được việc cho tài khoản <b>đã bị ngưng</b>, và không giao được cho người{" "}
          <b>khác mặt trận</b>.
        </P>
      </Luu>

      <TieuDePhu>6.5. Đề xuất khen thưởng</TieuDePhu>

      <P>Cuối tháng, đề xuất nhân sự xuất sắc để CEO trao huân chương.</P>

      <P>
        Vào <b>Đề xuất khen</b> →{" "}
        <b>
          <EmojiIcon glyph="➕" /> Đề xuất khen
        </b>{" "}
        → chọn <b>Nhân sự</b> (cùng mặt trận), chọn <b>Huân chương</b>, viết <b>Lý do</b> (bắt buộc)
        → <b>Gửi đề xuất</b>.
      </P>

      <P>
        Bạn chỉ thấy <b>đề xuất của chính mình</b>, và <b>không tự trao được</b> — chỉ CEO duyệt.
      </P>

      <P>
        Trạng thái: <The mau="tim">Chờ CEO duyệt</The> → <The mau="xanh">Đã trao</The> /{" "}
        <The mau="do">Từ chối</The> (hoặc <The mau="xam">Đã thu hồi</The> nếu CEO thu hồi sau đó).
      </P>

      <Luu kieu="canh_bao" nhan="Chống trùng">
        <P>
          Không đề xuất khen chính mình. Không đề xuất huân chương mà người đó <b>đã có rồi</b> — hệ
          thống báo <em>&quot;Nhân sự này đã có huy hiệu này rồi&quot;</em>.
        </P>
        <P>
          Nếu đã có đề xuất <b>đang chờ</b> cho cùng người + cùng huân chương, hệ thống sẽ{" "}
          <b>không tạo thêm bản ghi mới</b> dù vẫn hiện thông báo{" "}
          <em>&quot;Đã gửi đề xuất&quot;</em>. Đừng gửi lại nhiều lần — hãy kiểm tra danh sách
          trước.
        </P>
      </Luu>

      <TieuDePhu>6.6. Xử phạt</TieuDePhu>

      <P>
        Vào <b>Xử phạt</b>. Chọn <b>Chiến binh vi phạm</b> (cùng mặt trận), chọn <b>Hình thức</b>,
        nhập <b>Lý do / bằng chứng</b>, bấm{" "}
        <b>
          Ra quyết định phạt <EmojiIcon glyph="⚖️" />
        </b>
        .
      </P>

      <P>
        <b>Bốn mức án phạt:</b>
      </P>

      <Bang>
        <thead>
          <tr>
            <Th>Án phạt</Th>
            <Th>Mức độ</Th>
            <Th canhPhai>Trừ EXP</Th>
            <Th>Hệ quả kèm</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td dam>Không hoàn thành nhiệm vụ</Td>
            <Td>Nhẹ</Td>
            <Td am>−150</Td>
            <Td>−1 ngày phép</Td>
          </tr>
          <tr>
            <Td dam>Nói xấu / gièm pha đồng đội</Td>
            <Td>Vừa</Td>
            <Td am>−200</Td>
            <Td>Thẻ cảnh cáo</Td>
          </tr>
          <tr>
            <Td dam>Gây mất đoàn kết nội bộ</Td>
            <Td>Nặng</Td>
            <Td am>−300</Td>
            <Td>Thẻ cảnh cáo + kiểm điểm</Td>
          </tr>
          <tr>
            <Td dam>Biển thủ / tham nhũng tổ chức</Td>
            <Td>Rất nặng</Td>
            <Td am>−1000</Td>
            <Td>Đình chỉ + xử lý kỷ luật</Td>
          </tr>
        </tbody>
      </Bang>

      <Luu kieu="canh_bao" nhan="Không thể hoàn tác">
        <P>
          Phạt có hiệu lực NGAY, không ai duyệt lại, và <b>KHÔNG THỂ XOÁ hay hoàn tác</b>. Hãy chắc
          chắn trước khi bấm.
        </P>
      </Luu>

      <P>Điều xảy ra khi phạt:</P>
      <DanhSach
        items={[
          <>
            <b>Trừ EXP ngay</b> (nhưng EXP không bao giờ xuống dưới 0)
          </>,
          <>
            <b>Không trừ điểm mùa</b>, và <b>quân hàm đã đạt không bị tụt</b>
          </>,
          <>
            Hiện trong <em>Hồ sơ kỷ luật</em> của người bị phạt
          </>,
          <>
            Đăng lên Nhật ký chiến công — <b>người bị phạt, bạn và Tổng Tư Lệnh</b> đều thấy
          </>,
        ]}
      />

      <P>
        <b>Xử lý tái phạm:</b> nếu bạn nhập cùng án phạt + cùng lý do như lần trước cho cùng người,
        hệ thống chặn và báo:
      </P>
      <P>
        <em>
          &quot;Cảnh báo: đã có án phạt trùng mã vi phạm và lý do cho người này — nếu đây là vụ tái
          phạm, hãy bổ sung chi tiết vụ việc mới vào lý do&quot;
        </em>
      </P>
      <P>
        → Cách xử lý: <b>viết lý do khác đi</b>, ghi rõ chi tiết vụ việc mới (ngày, việc cụ thể).
      </P>

      <P>
        Bên dưới có <b>Danh mục xử phạt</b> (tra cứu 4 mức) và <b>Sổ ghi án phạt</b> (50 án gần nhất
        của nhân sự cùng mặt trận).
      </P>

      <Luu kieu="canh_bao" nhan="Giới hạn">
        <P>Không tự phạt chính mình, không phạt Tổng Tư Lệnh, không phạt tài khoản đã ngưng.</P>
      </Luu>

      <TieuDePhu>6.7. Bảng xếp hạng</TieuDePhu>

      <P>Chỉ để xem, không có nút nào. Ba mức lọc:</P>
      <DanhSach
        items={[
          <>
            <b>Cấp 1 · Cá nhân</b> — điểm mùa từng người
          </>,
          <>
            <b>Cấp 2 · Tiểu đội</b> — tổng điểm mùa cả đội
          </>,
          <>
            <b>Cấp 3 · Mặt trận</b> — Tiền Tuyến so với Hậu Phương
          </>,
        ]}
      />
      <P>
        Tổng Tư Lệnh <b>không xuất hiện</b> trong bảng cá nhân.
      </P>
    </Muc>
  );
}
