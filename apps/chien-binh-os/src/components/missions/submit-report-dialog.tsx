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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { NhomTruong, TruongNhap } from "@/components/chung/truong-nhap";
import { CONTENT_TYPES } from "@/lib/missions";
import { submitMissionResultAction } from "@/lib/actions/missions";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export function SubmitReportDialog({
  missionId,
  missionTitle,
  open,
  onOpenChange,
}: {
  missionId: string;
  missionTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    const content: Record<string, unknown> = {};
    let hasData = false;
    for (const ct of CONTENT_TYPES) {
      if (checked[ct.key] && values[ct.key]) {
        content[ct.key] = ct.numeric ? Number(values[ct.key]) : values[ct.key];
        hasData = true;
      }
    }
    if (note.trim()) {
      content.note = note.trim();
      hasData = true;
    }
    if (!hasData) {
      toast.error("Thiếu thông tin", { description: "Tích ít nhất 1 loại nội dung." });
      return;
    }

    startTransition(async () => {
      const res = await submitMissionResultAction(missionId, content);
      if (!res.ok) {
        toast.error("Lỗi gửi", { description: res.error });
        return;
      }
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã nộp kết quả <EmojiIcon glyph="🧾" />
        </span>,
        { description: "Chờ quản lý duyệt." },
      );
      onOpenChange(false);
      setChecked({});
      setValues({});
      setNote("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-cb-panel border-cb-line">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <EmojiIcon glyph="📋" /> Nộp kết quả nhiệm vụ
          </DialogTitle>
        </DialogHeader>
        <p className="text-cb-ink-dim text-sm">{missionTitle}</p>
        <NhomTruong>
          {/* 6 dòng này là một DANH SÁCH các loại nội dung, không phải 6 trường
              riêng — để khoảng cách của NhomTruong (16px) sẽ kéo modal dài lê
              thê. Gom vào nhóm riêng, sát nhau hơn. */}
          <div className="space-y-2">
            {CONTENT_TYPES.map((ct) => (
              <div key={ct.key} className="flex items-center gap-2">
                <Checkbox
                  id={`ct-${ct.key}`}
                  checked={checked[ct.key] ?? false}
                  onCheckedChange={(v) => setChecked((s) => ({ ...s, [ct.key]: Boolean(v) }))}
                />
                <Label htmlFor={`ct-${ct.key}`} className="w-32 shrink-0 font-normal">
                  {ct.label}
                </Label>
                <Input
                  type={ct.numeric ? "number" : "text"}
                  placeholder={ct.unit || ct.label}
                  value={values[ct.key] ?? ""}
                  onChange={(e) => setValues((s) => ({ ...s, [ct.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <TruongNhap nhan="Ghi chú / bằng chứng (tùy chọn)">
            <Textarea
              rows={2}
              placeholder="Link, mã KH, số hóa đơn..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </TruongNhap>
        </NhomTruong>
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
                Nộp cho quản lý <EmojiIcon glyph="⚔" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
