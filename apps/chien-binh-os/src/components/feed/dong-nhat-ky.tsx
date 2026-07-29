import { cn } from "@/lib/utils";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { boTenODau, gioPhut, hanhDongTuIcon, thoiGianTuongDoi, type SacThai } from "@/lib/feed";

// Sắc thái quyết định màu icon + chip hành động: việc tốt (được duyệt, thăng
// quân hàm) khác hẳn việc xấu (bị phạt, bị từ chối) để quét mắt là thấy ngay.
const MAU: Record<SacThai, { icon: string; chip: string }> = {
  tot: {
    icon: "text-cb-green",
    chip: "text-cb-green border-cb-green/40 bg-cb-green/10",
  },
  xau: {
    icon: "text-cb-crimson",
    chip: "text-cb-crimson border-cb-crimson/45 bg-cb-crimson/10",
  },
  trung_tinh: {
    icon: "text-cb-ink-faint",
    chip: "text-cb-ink-dim border-cb-line bg-cb-panel-2",
  },
};

export type DongFeed = {
  id: string;
  icon: string | null;
  text: string;
  created_at: string | null;
  tenChuThe: string | null;
  phongBan: string | null;
  laToi: boolean;
  tenNguoiThucHien: string | null;
};

export function DongNhatKy({ dong, hienGio }: { dong: DongFeed; hienGio: boolean }) {
  const { nhan, sacThai } = hanhDongTuIcon(dong.icon);
  const mau = MAU[sacThai];
  const chiTiet = boTenODau(dong.text, dong.tenChuThe);

  // Chỉ nói "do X thực hiện" khi người thực hiện KHÁC chủ thể — nếu trùng thì
  // câu "Lan Chi nộp kết quả · do Lan Chi thực hiện" chỉ thêm nhiễu.
  const nguoiKhac =
    dong.tenNguoiThucHien && dong.tenNguoiThucHien !== dong.tenChuThe
      ? dong.tenNguoiThucHien
      : null;

  return (
    <li className="flex items-start gap-3 py-3.5">
      <div
        className={cn(
          "bg-cb-panel-2 border-cb-line mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
          mau.icon,
        )}
      >
        <EmojiIcon glyph={dong.icon} />
      </div>

      <div className="min-w-0 flex-1">
        {/* Dòng 1 — tên nhân sự + hành động, hai thứ cần nổi bật nhất. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-cb-ink font-semibold">{dong.tenChuThe ?? "Toàn công ty"}</span>
          {dong.laToi ? (
            <span className="text-cb-gold-soft text-xs font-medium">· Bạn</span>
          ) : dong.phongBan ? (
            <span className="text-cb-ink-faint text-xs">· {dong.phongBan}</span>
          ) : null}
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
              mau.chip,
            )}
          >
            {nhan}
          </span>
        </div>

        {/* Dòng 2 — chi tiết. FEE-02: text có thể chứa lý do do người dùng nhập
            (lý do từ chối/thu hồi/xử phạt) nên render text thuần để React tự
            escape, không bao giờ dùng dangerouslySetInnerHTML. */}
        <p className="text-cb-ink-dim mt-1 text-sm leading-relaxed">{chiTiet}</p>

        <div className="text-cb-ink-faint mt-1 flex flex-wrap items-center gap-x-2 text-xs">
          <span>
            {dong.created_at
              ? hienGio
                ? gioPhut(dong.created_at)
                : thoiGianTuongDoi(dong.created_at)
              : ""}
          </span>
          {nguoiKhac ? <span>· do {nguoiKhac} thực hiện</span> : null}
        </div>
      </div>
    </li>
  );
}
