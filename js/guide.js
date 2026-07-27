/* ==========================================================================
   CẨM NANG HỆ THỐNG — giải thích khung chỉ số chung cho MỌI nhân sự:
   đơn vị đo, ý nghĩa, sơ đồ khối, ví dụ Marketing & Sale. Ai cũng đọc được.
   ========================================================================== */

function renderGuide() {
  view().innerHTML = `
    <div class="section-note">📖 Khung chỉ số này <b>giống nhau cho mọi nhân sự</b>. Hiểu đúng để tự triển khai chi tiết cho vị trí của mình.</div>

    <div class="card">
      <div class="card__title">📏 Đơn vị đo & ý nghĩa</div>
      <div style="overflow-x:auto"><table class="unit-table">
        <thead><tr><th>Chỉ số</th><th>Là gì</th><th>Ý nghĩa & cách tính</th></tr></thead>
        <tbody>
          <tr>
            <td class="u-name u-exp">EXP<br><small style="color:var(--ink-faint)">(Điểm quân công)</small></td>
            <td><b>Khối lượng công việc hàng ngày</b>, tích luỹ dần</td>
            <td>Đo <b>sự bền bỉ</b> & phát triển qua từng tháng dưới dạng tổng điểm. Tích luỹ để <b>chia thưởng cuối quý/năm</b> và <b>thăng quân hàm</b>. Mục tiêu tháng được <b>chia đều cho 30</b> ngày → ra chỉ tiêu mỗi ngày.</td>
          </tr>
          <tr>
            <td class="u-name u-badge">Huy hiệu<br><small style="color:var(--ink-faint)">(Huân chương)</small></td>
            <td><b>Kết quả cuối cùng</b> của EXP = hiệu suất</td>
            <td>Khi <b>đạt mục tiêu tuần/tháng trong thời gian ngắn</b> → nhận huy hiệu. Đạt trong <b>½ thời gian</b> → huy hiệu <b>đột phá</b> (nhóm riêng). Huy hiệu đổi ra tiền đào tạo/phần thưởng.</td>
          </tr>
          <tr>
            <td class="u-name u-rank">Quân hàm</td>
            <td>Cấp bậc tích luỹ từ EXP</td>
            <td>Đủ EXP tháng → thăng cấp (Binh Nhì → Đại Tướng). Thuần <b>danh vọng</b>, chỉ lên không xuống.</td>
          </tr>
          <tr>
            <td class="u-name u-season">Điểm mùa</td>
            <td>Điểm thi đua theo kỳ</td>
            <td><b>Reset mỗi kỳ (3–6 tháng)</b> để ai cũng có cơ hội đua rank trên bảng xếp hạng.</td>
          </tr>
          <tr>
            <td class="u-name u-fund">Quỹ thưởng</td>
            <td>Tiền chia cuối kỳ</td>
            <td>Chia theo tỷ lệ EXP: <b>(EXP của bạn ÷ tổng EXP toàn đội) × Quỹ</b>.</td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card__title">🧭 Sơ đồ khối: từ mục tiêu công ty xuống nhân sự</div>
      <div class="flow">
        <div class="flow-box fb-company"><b>MỤC TIÊU CÔNG TY</b><div class="fb-sub">VD: Doanh số 2 tỷ / tháng</div></div>
        <div class="flow-arrow">↓ giao trọng số cho phòng ban</div>
        <div class="flow-split">
          <div class="flow-box fb-exp"><b>EXP = KHỐI LƯỢNG</b><div class="fb-sub">Việc cần làm (view, video, cuộc gọi, KH tiếp cận…)</div></div>
          <div class="flow-box fb-badge"><b>HUY HIỆU = KẾT QUẢ</b><div class="fb-sub">Đầu ra (lead, hợp đồng, doanh số…)</div></div>
        </div>
        <div class="flow-arrow">↓ chia đều cho 30 ngày</div>
        <div class="flow-box fb-day"><b>CHỈ TIÊU NGÀY CỦA NHÂN SỰ</b><div class="fb-sub">Leader bàn giao khối lượng tuần/ngày → nhân sự làm & tích EXP → cuối tháng báo cáo điểm trung bình</div></div>
        <div class="flow-arrow">↓ tổng kết</div>
        <div class="flow-outcomes">
          <div class="fo fo-rank"><b>🎖 Thăng quân hàm</b><span>Đạt đủ EXP tháng</span></div>
          <div class="fo fo-break"><b>🏅 Huy hiệu đột phá</b><span>Đạt kết quả trong ½ thời gian</span></div>
          <div class="fo fo-fund"><b>💰 Quỹ thưởng</b><span>Chia cuối quý/năm theo % EXP</span></div>
        </div>
      </div>
    </div>

    <div class="grid cols-2" style="margin-top:16px">
      <div class="card eg-card">
        <div class="card__title">📈 Ví dụ: Phòng Marketing</div>
        <div class="eg-line"><span class="eg-k">Mục tiêu tháng</span><span>1.000.000 view + 100 video → <b class="u-exp">EXP (khối lượng)</b></span></div>
        <div class="eg-line"><span class="eg-k">Kết quả cần đạt</span><span>200 lead mới → <b class="u-badge">Huy hiệu</b></span></div>
        <div class="eg-line"><span class="eg-k">Chia đều / 30</span><span>≈ 33.333 view/ngày · ≈ 3–4 video/ngày</span></div>
        <div class="eg-line"><span class="eg-k">Nhân sự</span><span>Leader giao “X video/tuần” = EXP; cuối tháng báo cáo điểm TB</span></div>
        <div class="eg-line"><span class="eg-k">Được huy hiệu khi</span><span>Đạt mốc view/lead sớm; đạt trong ½ thời gian → huy hiệu đột phá</span></div>
      </div>
      <div class="card eg-card">
        <div class="card__title">💼 Ví dụ: Phòng Sale</div>
        <div class="eg-line"><span class="eg-k">Mục tiêu tháng</span><span>120 KH mới + doanh số 2 tỷ → <b class="u-exp">EXP (khối lượng)</b></span></div>
        <div class="eg-line"><span class="eg-k">Kết quả cần đạt</span><span>40 hợp đồng lớn → <b class="u-badge">Huy hiệu</b></span></div>
        <div class="eg-line"><span class="eg-k">Chia đều / 30</span><span>≈ 4 KH mới/ngày · doanh số ≈ 66,7 triệu/ngày</span></div>
        <div class="eg-line"><span class="eg-k">Nhân sự</span><span>Tìm 3 KH mới/ngày = EXP; doanh số chốt được = hiệu suất → huy hiệu</span></div>
        <div class="eg-line"><span class="eg-k">Được huy hiệu khi</span><span>Chốt hợp đồng nhanh/vượt chỉ tiêu trong ½ thời gian → huy hiệu đột phá</span></div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card__title">🔗 Gắn với tính năng trong app</div>
      <div class="eg-line"><span class="eg-k">🧭 Mục tiêu tháng</span><span>Nơi CEO/quản lý đặt khối lượng (EXP) + kết quả (huy hiệu) cho phòng ban / nhân sự</span></div>
      <div class="eg-line"><span class="eg-k">🎯 Bảng nhiệm vụ</span><span>Chỉ tiêu ngày (đã chia /30) để nhân sự nhận & hoàn thành → cộng EXP</span></div>
      <div class="eg-line"><span class="eg-k">🏅 Quân hàm & Huân chương</span><span>Xem cấp bậc (EXP) và huy hiệu (kết quả) đã đạt</span></div>
      <div class="eg-line"><span class="eg-k">📊 Bảng xếp hạng</span><span>Đua điểm mùa toàn công ty</span></div>
      <div class="eg-line"><span class="eg-k">💰 Quỹ thưởng</span><span>Chia tiền cuối kỳ theo % EXP tích luỹ</span></div>
    </div>`;
}
