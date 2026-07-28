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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { proposeCommendationAction } from "@/lib/actions/commend";

export function ProposeCommendButton({
  staff,
  badges,
}: {
  staff: { id: string; name: string; dept: string | null }[];
  badges: { code: string; name: string; icon: string | null }[];
}) {
  const [open, setOpen] = useState(false);
  const [staffId, setStaffId] = useState(staff[0]?.id ?? "");
  const [badgeCode, setBadgeCode] = useState(badges[0]?.code ?? "");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!staffId) {
      toast.error("Chưa có nhân sự", { description: "Front này chưa có chiến sỹ." });
      return;
    }
    if (!reason.trim()) {
      toast.error("Thiếu lý do", { description: "Nhập lý do khen." });
      return;
    }
    startTransition(async () => {
      const res = await proposeCommendationAction(staffId, badgeCode, reason.trim());
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã gửi đề xuất <EmojiIcon glyph="🏆" />
        </span>,
        { description: "Chờ CEO duyệt." },
      );
      setOpen(false);
      setReason("");
    });
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft"
      >
        <EmojiIcon glyph="➕" /> Đề xuất khen
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-cb-panel border-cb-line">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              <EmojiIcon glyph="🏆" /> Đề xuất khen thưởng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nhân sự được khen</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.dept})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Huân chương đề xuất</Label>
              <Select value={badgeCode} onValueChange={setBadgeCode}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {badges.map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      <span className="inline-flex items-center gap-1">
                        <EmojiIcon glyph={b.icon} /> {b.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Lý do</Label>
              <Textarea
                rows={3}
                placeholder="Vì sao xứng đáng được khen"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={submit}
              disabled={isPending}
              className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft"
            >
              {isPending ? "Đang gửi…" : "Gửi đề xuất"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
