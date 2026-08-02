"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Chip } from "@/components/chung/chip";

export type NguoiNhan = { id: string; name: string; dept: string | null };

/**
 * Bỏ dấu tiếng Việt để tìm kiếm gõ sao cũng ra: "dung" khớp "Dũng",
 * "hieu" khớp "Hiếu".
 *
 * Chữ "đ" phải xử lý riêng — nó là một ký tự độc lập trong Unicode chứ không
 * phải "d" ghép dấu, nên NFD không tách ra được.
 */
function boDau(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Ô chọn nhiều người có tìm kiếm.
 *
 * Trước đây là danh sách phẳng luôn mở: 4 người thì vừa, nhưng công ty đông
 * lên là nó chiếm hết chiều cao biểu mẫu và phải cuộn trong cuộn. Dạng thu gọn
 * + tìm theo tên thì bao nhiêu người cũng dùng được.
 */
export function ChonNhieuNguoi({
  danhSach,
  daChon,
  onDoiChon,
  thongBaoRong = "Không có nhân sự nào để giao.",
}: {
  danhSach: NguoiNhan[];
  daChon: string[];
  /**
   * Nhận thẳng hàm setState, KHÔNG phải `(ids) => void`.
   *
   * Nếu tính danh sách mới từ prop `daChon` rồi truyền mảng lên, hai lần tích
   * liên tiếp trong cùng một nhịp render sẽ cùng đọc `daChon` cũ — lần sau ghi
   * đè lần trước và người vừa tích bị rơi mất.
   */
  onDoiChon: React.Dispatch<React.SetStateAction<string[]>>;
  thongBaoRong?: string;
}) {
  const [mo, setMo] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");

  const locDuoc = useMemo(() => {
    const k = boDau(tuKhoa.trim());
    if (!k) return danhSach;
    return danhSach.filter((n) => boDau(`${n.name} ${n.dept ?? ""}`).includes(k));
  }, [danhSach, tuKhoa]);

  const daChonHet = locDuoc.length > 0 && locDuoc.every((n) => daChon.includes(n.id));

  function doi(id: string) {
    onDoiChon((cu) => (cu.includes(id) ? cu.filter((x) => x !== id) : [...cu, id]));
  }

  /** Tích/bỏ tích toàn bộ những người ĐANG HIỆN — đang lọc thì chỉ ăn vào kết quả lọc. */
  function doiTatCa() {
    const ids = locDuoc.map((n) => n.id);
    onDoiChon((cu) =>
      daChonHet ? cu.filter((x) => !ids.includes(x)) : [...new Set([...cu, ...ids])],
    );
  }

  if (danhSach.length === 0) {
    return (
      <div className="border-cb-line bg-cb-bg-2 rounded-lg border px-3 py-2.5">
        <p className="text-cb-ink-dim text-sm">{thongBaoRong}</p>
      </div>
    );
  }

  const tenDaChon = danhSach.filter((n) => daChon.includes(n.id));
  const nhanNut =
    tenDaChon.length === 0
      ? "Chọn người nhận…"
      : tenDaChon.length === 1
        ? tenDaChon[0].name
        : `${tenDaChon.length} người đã chọn`;

  return (
    <div className="space-y-2">
      <Popover open={mo} onOpenChange={setMo}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="border-cb-line bg-cb-bg-2 hover:border-cb-gold/50 focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm transition-colors outline-none focus-visible:ring-3"
          >
            <span className={tenDaChon.length === 0 ? "text-cb-ink-faint" : ""}>{nhanNut}</span>
            <ChevronsUpDown className="text-cb-ink-faint size-4 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <div className="border-cb-line border-b p-2">
            <input
              autoFocus
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tên…"
              className="bg-cb-bg-2 border-cb-line placeholder:text-cb-ink-faint w-full rounded-md border px-2.5 py-1.5 text-sm outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {locDuoc.length === 0 ? (
              <p className="text-cb-ink-dim px-3 py-3 text-sm">Không tìm thấy ai khớp.</p>
            ) : (
              <>
                <label className="border-cb-line-soft hover:bg-cb-panel-2 flex cursor-pointer items-center gap-2.5 border-b px-3 py-2">
                  <Checkbox checked={daChonHet} onCheckedChange={doiTatCa} />
                  <span className="text-sm font-semibold">
                    {tuKhoa.trim() ? `Chọn ${locDuoc.length} người đang hiện` : "Chọn tất cả"}
                  </span>
                </label>
                {locDuoc.map((n) => (
                  <label
                    key={n.id}
                    className="border-cb-line-soft hover:bg-cb-panel-2 flex cursor-pointer items-center gap-2.5 border-b px-3 py-2 last:border-none"
                  >
                    <Checkbox checked={daChon.includes(n.id)} onCheckedChange={() => doi(n.id)} />
                    <span className="text-sm">
                      {n.name} <span className="text-cb-ink-faint">({n.dept})</span>
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Hiện tên đã chọn ngay dưới ô: thu gọn rồi thì không nhìn thấy mình đã
          tích ai, mà bỏ nhầm một người thì cả nhóm nhận sai việc. */}
      {tenDaChon.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tenDaChon.map((n) => (
            <Chip key={n.id} mau="lam" className="gap-1.5">
              {n.name}
              <button
                type="button"
                onClick={() => doi(n.id)}
                aria-label={`Bỏ chọn ${n.name}`}
                className="hover:text-white/70"
              >
                <X className="size-3.5" strokeWidth={3} />
              </button>
            </Chip>
          ))}
        </div>
      ) : null}
    </div>
  );
}
