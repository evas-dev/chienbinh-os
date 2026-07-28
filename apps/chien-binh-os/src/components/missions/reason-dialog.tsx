"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/actions/missions";

// Dùng chung cho reject/revert (chỉ khác title/label/action) — thay
// openRejectModal + openRevertRejectModal trùng lặp trong submission.js cũ.
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  hint,
  confirmLabel,
  confirmVariant = "default",
  successMessage,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  hint?: ReactNode;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  successMessage: string;
  action: (reason: string) => Promise<ActionResult>;
}) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!reason.trim()) {
      toast.error("Thiếu lý do", { description: "Phải nhập lý do." });
      return;
    }
    startTransition(async () => {
      const res = await action(reason.trim());
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(successMessage);
      onOpenChange(false);
      setReason("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-cb-panel border-cb-line">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">{title}</DialogTitle>
        </DialogHeader>
        {hint ? <p className="text-cb-ink-dim flex items-center gap-1.5 text-sm">{hint}</p> : null}
        <div className="space-y-1.5">
          <Label>Lý do (bắt buộc)</Label>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={submit}
            disabled={isPending}
            className={
              confirmVariant === "destructive"
                ? "bg-cb-crimson hover:bg-cb-crimson-deep text-white"
                : "bg-cb-gold text-cb-bg hover:bg-cb-gold-soft"
            }
          >
            {isPending ? "Đang xử lý…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
