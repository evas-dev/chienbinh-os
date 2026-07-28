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
import { Label } from "@/components/ui/label";
import { assignObjectiveItemAction } from "@/lib/actions/objectives";
import { EmojiIcon } from "@/components/chung/emoji-icon";

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
  const [target, setTarget] = useState("100");
  const [unit, setUnit] = useState("KH");
  const [weight, setWeight] = useState("20");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!metric.trim()) {
      toast.error("Thiếu tên KPI", { description: "Nhập tên chỉ tiêu đã." });
      return;
    }
    startTransition(async () => {
      const res = await assignObjectiveItemAction({
        ownerId,
        metric: metric.trim(),
        metricKey: null,
        target: Number(target) || 1,
        unit: unit.trim() || "đv",
        weight: Number(weight) || 10,
      });
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã giao KPI <EmojiIcon glyph="🎯" />
        </span>,
        { description: `${ownerName}: ${metric}` }
      );
      onOpenChange(false);
      setMetric("");
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
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tên chỉ tiêu</Label>
            <Input
              placeholder="VD: Doanh số tháng"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label>Con số mục tiêu</Label>
              <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Đơn vị</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Trọng số (%)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>
          <p className="text-cb-ink-faint text-xs">
            Trọng số phản ánh mức độ quan trọng của KPI trong tổng thành tích tháng.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={submit}
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
