import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";

// Port nguyên nội dung tĩnh từ js/guide.js — không có mutation, chỉ đổi
// template string sang JSX.
// FEE-06: nội dung cẩm nang này áp dụng chung cho mọi vai trò (EXP, huy
// hiệu, quân hàm, quỹ thưởng) — không có phần nào riêng cho CEO, nên phải
// cho Tư Lệnh/Chiến Sỹ đọc được, chặn ở server theo tài khoản active thay
// vì giới hạn CEO_ONLY như trước.
export default async function GuidePage() {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh", "tu_lenh", "chien_sy"]);

  return (
    <div className="space-y-4">
      <p className="bg-cb-panel-2 border-cb-line flex items-start gap-1.5 rounded-lg border p-3 text-sm">
        <EmojiIcon glyph="📖" className="mt-0.5" />
        <span>
          Khung chỉ số này <b>giống nhau cho mọi nhân sự</b>. Hiểu đúng để tự triển khai chi tiết
          cho vị trí của mình.
        </span>
      </p>

      <Card>
        <CardContent className="overflow-x-auto">
          <div className="mb-3 flex items-center gap-1.5 font-semibold">
            <EmojiIcon glyph="📏" />
            Đơn vị đo &amp; ý nghĩa
          </div>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-cb-line border-b text-left">
                <th className="pb-2">Chỉ số</th>
                <th className="pb-2">Là gì</th>
                <th className="pb-2">Ý nghĩa &amp; cách tính</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-cb-line-soft border-b">
                <td className="text-cb-gold py-2 pr-3 font-semibold">
                  EXP
                  <br />
                  <small className="text-cb-ink-faint font-normal">(Điểm quân công)</small>
                </td>
                <td className="py-2 pr-3">
                  <b>Khối lượng công việc hàng ngày</b>, tích luỹ dần
                </td>
                <td className="text-cb-ink-dim py-2">
                  Đo <b>sự bền bỉ</b> &amp; phát triển qua từng tuần dưới dạng tổng điểm. Tích luỹ
                  để <b>chia thưởng cuối quý/năm</b> và <b>thăng quân hàm</b>. Mục tiêu tuần được{" "}
                  <b>chia đều cho 7</b> ngày → ra chỉ tiêu mỗi ngày.
                </td>
              </tr>
              <tr className="border-cb-line-soft border-b">
                <td className="text-cb-purple py-2 pr-3 font-semibold">
                  Huy hiệu
                  <br />
                  <small className="text-cb-ink-faint font-normal">(Huân chương)</small>
                </td>
                <td className="py-2 pr-3">
                  <b>Kết quả cuối cùng</b> của EXP = hiệu suất
                </td>
                <td className="text-cb-ink-dim py-2">
                  Khi <b>đạt mục tiêu tuần/tháng trong thời gian ngắn</b> → nhận huy hiệu. Đạt trong{" "}
                  <b>½ thời gian</b> → huy hiệu <b>đột phá</b> (nhóm riêng). Huy hiệu đổi ra tiền
                  đào tạo/phần thưởng.
                </td>
              </tr>
              <tr className="border-cb-line-soft border-b">
                <td className="py-2 pr-3 font-semibold">Quân hàm</td>
                <td className="py-2 pr-3">Cấp bậc tích luỹ từ EXP</td>
                <td className="text-cb-ink-dim py-2">
                  Đủ EXP tháng → thăng cấp (Binh Nhì → Đại Tướng). Thuần <b>danh vọng</b>, chỉ lên
                  không xuống.
                </td>
              </tr>
              <tr className="border-cb-line-soft border-b">
                <td className="py-2 pr-3 font-semibold">Điểm mùa</td>
                <td className="py-2 pr-3">Điểm thi đua theo kỳ</td>
                <td className="text-cb-ink-dim py-2">
                  <b>Reset mỗi kỳ (3–6 tháng)</b> để ai cũng có cơ hội đua rank trên bảng xếp hạng.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Quỹ thưởng</td>
                <td className="py-2 pr-3">Tiền chia cuối kỳ</td>
                <td className="text-cb-ink-dim py-2">
                  Chia theo tỷ lệ EXP: <b>(EXP của bạn ÷ tổng EXP toàn đội) × Quỹ</b>.
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="mb-3 flex items-center gap-1.5 font-semibold">
            <EmojiIcon glyph="🧭" />
            Sơ đồ khối: từ mục tiêu công ty xuống nhân sự
          </div>
          <div className="space-y-3 text-sm">
            <div className="border-cb-line bg-cb-panel-2 rounded-lg border p-3 text-center">
              <b>MỤC TIÊU CÔNG TY</b>
              <div className="text-cb-ink-dim text-xs">VD: Doanh số 2 tỷ / tháng</div>
            </div>
            <div className="text-cb-ink-faint text-center text-xs">
              ↓ giao trọng số cho phòng ban
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border-cb-gold/30 bg-cb-panel-2 rounded-lg border p-3 text-center">
                <b>EXP = KHỐI LƯỢNG</b>
                <div className="text-cb-ink-dim text-xs">
                  Việc cần làm (view, video, cuộc gọi, KH tiếp cận…)
                </div>
              </div>
              <div className="border-cb-purple/30 bg-cb-panel-2 rounded-lg border p-3 text-center">
                <b>HUY HIỆU = KẾT QUẢ</b>
                <div className="text-cb-ink-dim text-xs">Đầu ra (lead, hợp đồng, doanh số…)</div>
              </div>
            </div>
            <div className="text-cb-ink-faint text-center text-xs">↓ chia đều cho 7 ngày</div>
            <div className="border-cb-line bg-cb-panel-2 rounded-lg border p-3 text-center">
              <b>CHỈ TIÊU NGÀY CỦA NHÂN SỰ</b>
              <div className="text-cb-ink-dim text-xs">
                Leader bàn giao khối lượng tuần/ngày → nhân sự làm &amp; tích EXP → cuối tuần báo
                cáo điểm trung bình
              </div>
            </div>
            <div className="text-cb-ink-faint text-center text-xs">↓ tổng kết</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border-cb-line bg-cb-panel-2 rounded-lg border p-3 text-center text-xs">
                <b className="inline-flex items-center justify-center gap-1">
                  <EmojiIcon glyph="🎖" />
                  Thăng quân hàm
                </b>
                <div className="text-cb-ink-dim mt-1">Đạt đủ EXP tháng</div>
              </div>
              <div className="border-cb-line bg-cb-panel-2 rounded-lg border p-3 text-center text-xs">
                <b className="inline-flex items-center justify-center gap-1">
                  <EmojiIcon glyph="🏅" />
                  Huy hiệu đột phá
                </b>
                <div className="text-cb-ink-dim mt-1">Đạt kết quả trong ½ thời gian</div>
              </div>
              <div className="border-cb-line bg-cb-panel-2 rounded-lg border p-3 text-center text-xs">
                <b className="inline-flex items-center justify-center gap-1">
                  <EmojiIcon glyph="💰" />
                  Quỹ thưởng
                </b>
                <div className="text-cb-ink-dim mt-1">Chia cuối quý/năm theo % EXP</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 text-sm">
            <div className="mb-1 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="📈" />
              Ví dụ: Phòng Marketing
            </div>
            <EgLine k="Mục tiêu tuần">
              1.000.000 view + 100 video → <b className="text-cb-gold">EXP (khối lượng)</b>
            </EgLine>
            <EgLine k="Kết quả cần đạt">
              200 lead mới → <b className="text-cb-purple">Huy hiệu</b>
            </EgLine>
            <EgLine k="Chia đều / 30">≈ 33.333 view/ngày · ≈ 3–4 video/ngày</EgLine>
            <EgLine k="Nhân sự">
              Leader giao «X video/tuần» = EXP; cuối tháng báo cáo điểm TB
            </EgLine>
            <EgLine k="Được huy hiệu khi">
              Đạt mốc view/lead sớm; đạt trong ½ thời gian → huy hiệu đột phá
            </EgLine>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 text-sm">
            <div className="mb-1 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="💼" />
              Ví dụ: Phòng Sale
            </div>
            <EgLine k="Mục tiêu tuần">
              120 KH mới + doanh số 2 tỷ → <b className="text-cb-gold">EXP (khối lượng)</b>
            </EgLine>
            <EgLine k="Kết quả cần đạt">
              40 hợp đồng lớn → <b className="text-cb-purple">Huy hiệu</b>
            </EgLine>
            <EgLine k="Chia đều / 30">≈ 4 KH mới/ngày · doanh số ≈ 66,7 triệu/ngày</EgLine>
            <EgLine k="Nhân sự">
              Tìm 3 KH mới/ngày = EXP; doanh số chốt được = hiệu suất → huy hiệu
            </EgLine>
            <EgLine k="Được huy hiệu khi">
              Chốt hợp đồng nhanh/vượt chỉ tiêu trong ½ thời gian → huy hiệu đột phá
            </EgLine>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-2 text-sm">
          <div className="mb-1 flex items-center gap-1.5 font-semibold">
            <EmojiIcon glyph="🔗" />
            Gắn với tính năng trong app
          </div>
          <EgLine icon="🧭" k="Mục tiêu tuần">
            Nơi CEO/quản lý đặt khối lượng (EXP) + kết quả (huy hiệu) cho phòng ban / nhân sự
          </EgLine>
          <EgLine icon="🎯" k="Bảng nhiệm vụ">
            Chỉ tiêu ngày (đã chia /30) để nhân sự nhận &amp; hoàn thành → cộng EXP
          </EgLine>
          <EgLine icon="🏅" k="Quân hàm & Huân chương">
            Xem cấp bậc (EXP) và huy hiệu (kết quả) đã đạt
          </EgLine>
          <EgLine icon="📊" k="Bảng xếp hạng">
            Đua điểm mùa toàn công ty
          </EgLine>
          <EgLine icon="💰" k="Quỹ thưởng">
            Chia tiền cuối kỳ theo % EXP tích luỹ
          </EgLine>
        </CardContent>
      </Card>
    </div>
  );
}

function EgLine({ icon, k, children }: { icon?: string; k: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="text-cb-ink-faint flex shrink-0 items-center gap-1 sm:w-40">
        {icon ? <EmojiIcon glyph={icon} /> : null}
        {k}
      </span>
      <span>{children}</span>
    </div>
  );
}
