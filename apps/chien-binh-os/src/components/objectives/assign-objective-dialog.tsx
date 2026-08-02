"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignObjectiveItemAction } from "@/lib/actions/objectives";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { NhomTruong, TruongNhap } from "@/components/chung/truong-nhap";

// Khóa đo lường tự động — khớp CONTENT_TYPES numeric (src/lib/missions.ts) và
// CASE trong RPC approve_submission. "none" = không tự động (nhập/sửa thủ công)
// — Radix Select không cho phép value="" cho SelectItem nên dùng sentinel.
const NO_AUTO_KEY = "none";
const METRIC_KEY_OPTIONS = [
  { value: NO_AUTO_KEY, label: "Không tự động — CEO/QL cập nhật thủ công" },
  { value: "lead", label: "Tự động theo Số lead nộp trong nhiệm vụ" },
  { value: "view", label: "Tự động theo Số view nộp trong nhiệm vụ" },
  { value: "video", label: "Tự động theo Số video nộp trong nhiệm vụ" },
  { value: "bai_viet", label: "Tự động theo Số bài viết nộp trong nhiệm vụ" },
  { value: "bai_web", label: "Tự động theo Số bài web/SEO nộp trong nhiệm vụ" },
] as const;

export function AssignObjectiveDialog({
  open,
  onOpenChange,
  ownerId,
  ownerName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  ownerName: string;
}) {
  const [metric, setMetric] = useState("");
  const [metricKey, setMetricKey] = useState(NO_AUTO_KEY);
  const [target, setTarget] = useState("100");
  const [unit, setUnit] = useState("KH");
  const [weight, setWeight] = useState("20");
  const [isPending, startTransition] = useTransition();
  // KPI-06: khi RPC báo trùng, hỏi xác nhận thay vì tạo âm thầm hoặc chặn hẳn.
  const [dupWarning, setDupWarning] = useState<string | null>(null);

  function submit(confirm = false) {
    if (!metric.trim()) {
      toast.error("Thiếu tên KPI", { description: "Nhập tên chỉ tiêu đã." });
      return;
    }
    setDupWarning(null);
    startTransition(async () => {
      const res = await assignObjectiveItemAction({
        ownerId,
        metric: metric.trim(),
        metricKey: metricKey === NO_AUTO_KEY ? null : metricKey,
        target: Number(target) || 1,
        unit: unit.trim() || "đv",
        weight: Number(weight) || 10,
        confirm,
      });
      if (!res.ok) {
        if (res.error.startsWith("DUPLICATE_KPI")) {
          setDupWarning(res.error.replace(/^DUPLICATE_KPI:\s*/, ""));
          return;
        }
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã giao KPI <EmojiIcon glyph="🎯" />
        </span>,
        { description: `${ownerName}: ${metric}` },
      );
      onOpenChange(false);
      setMetric("");
      setMetricKey(NO_AUTO_KEY);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-cb-panel border-cb-line">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <EmojiIcon glyph="➕" /> Giao KPI cho {ownerName}
          </DialogTitle>
        </DialogHeader>
        <NhomTruong>
          <TruongNhap nhan="Tên chỉ tiêu">
            <Input
              placeholder="VD: Doanh số tuần"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            />
          </TruongNhap>
          <div className="grid grid-cols-3 gap-4">
            <TruongNhap nhan="Con số mục tiêu">
              <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
            </TruongNhap>
            <TruongNhap nhan="Đơn vị">
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </TruongNhap>
            <TruongNhap nhan="Trọng số (%)">
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </TruongNhap>
          </div>
          <p className="text-cb-ink-faint text-xs">
            Trọng số phản ánh mức độ quan trọng của KPI trong tổng thành tích tuần.
          </p>
          <TruongNhap
            nhan="Khóa đo lường tự động (tuỳ chọn)"
            moTa="Nếu chọn, kết quả nộp được duyệt có khóa này sẽ tự cộng dồn vào chỉ tiêu — không phải tự sửa tay."
          >
            <Select value={metricKey} onValueChange={setMetricKey}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_KEY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TruongNhap>
          {dupWarning ? (
            <div className="border-cb-gold/40 bg-cb-gold/10 rounded-lg border p-3 text-sm leading-relaxed">
              <p>
                <EmojiIcon glyph="⚠️" /> {dupWarning}
              </p>
              <div className="mt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setDupWarning(null)}>
                  Huỷ
                </Button>
                <Button
                  size="sm"
                  onClick={() => submit(true)}
                  disabled={isPending}
                  className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft"
                >
                  Vẫn tạo thêm
                </Button>
              </div>
            </div>
          ) : null}
        </NhomTruong>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={() => submit(false)}
            disabled={isPending}
            className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft"
          >
            {isPending ? (
              "Đang gửi…"
            ) : (
              <>
                Giao KPI <EmojiIcon glyph="⚔" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
