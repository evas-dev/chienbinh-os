"use client";

import { Checkbox } from "@/components/ui/checkbox";

export type NguoiNhan = { id: string; name: string; dept: string | null };

/**
 * Danh sách tích chọn nhiều người nhận.
 *
 * Thay cho ô chọn một người: giao cùng một việc cho cả nhóm chỉ phải mở hộp
 * thoại MỘT lần, hệ thống tạo cho mỗi người một nhiệm vụ riêng để họ nhận và
 * nộp độc lập.
 */
export function ChonNhieuNguoi({
  danhSach,
  daChon,
  onDoiChon,
  thongBaoRong = "Không có nhân sự nào để giao.",
}: {
  danhSach: NguoiNhan[];
  daChon: string[];
  onDoiChon: (ids: string[]) => void;
  thongBaoRong?: string;
}) {
  function doi(id: string) {
    onDoiChon(daChon.includes(id) ? daChon.filter((x) => x !== id) : [...daChon, id]);
  }

  if (danhSach.length === 0) {
    return (
      <div className="border-cb-line bg-cb-bg-2 rounded-lg border">
        <p className="text-cb-ink-dim p-3 text-sm">{thongBaoRong}</p>
      </div>
    );
  }

  const dong =
    "border-cb-line-soft hover:bg-cb-panel-2 flex cursor-pointer items-center gap-2.5 border-b px-3 py-2";

  return (
    <div className="border-cb-line bg-cb-bg-2 max-h-44 overflow-y-auto rounded-lg border">
      <label className={dong}>
        <Checkbox
          checked={daChon.length === danhSach.length}
          onCheckedChange={(v) => onDoiChon(v === true ? danhSach.map((n) => n.id) : [])}
        />
        <span className="text-sm font-semibold">Chọn tất cả</span>
      </label>
      {danhSach.map((n) => (
        <label key={n.id} className={`${dong} last:border-none`}>
          <Checkbox checked={daChon.includes(n.id)} onCheckedChange={() => doi(n.id)} />
          <span className="text-sm">
            {n.name} <span className="text-cb-ink-faint">({n.dept})</span>
          </span>
        </label>
      ))}
    </div>
  );
}
