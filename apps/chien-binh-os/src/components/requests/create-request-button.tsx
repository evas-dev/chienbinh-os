"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REQUEST_TYPES, MAX_REQUESTS_PER_MONTH } from "@/lib/support-requests";
import { createSupportRequestAction } from "@/lib/actions/support-requests";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { NhomTruong, TruongNhap } from "@/components/chung/truong-nhap";
import type { Enums } from "@/types/database";

type Person = { id: string; name: string; role: Enums<"role_type">; dept: string | null };

export function CreateRequestButton({
  managers,
  peers,
  defaultTargetId,
  usedThisMonth,
}: {
  managers: Person[];
  peers: Person[];
  defaultTargetId: string;
  usedThisMonth: number;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Enums<"support_type">>(REQUEST_TYPES[0].code);
  const [targetId, setTargetId] = useState(defaultTargetId);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const left = Math.max(0, MAX_REQUESTS_PER_MONTH - usedThisMonth);
  const targets = useMemo(() => {
    const rt = REQUEST_TYPES.find((t) => t.code === type);
    return rt?.to === "staff" ? peers : managers;
  }, [type, managers, peers]);

  function changeType(v: string) {
    const next = v as Enums<"support_type">;
    setType(next);
    const rt = REQUEST_TYPES.find((t) => t.code === next);
    const list = rt?.to === "staff" ? peers : managers;
    setTargetId(list.some((p) => p.id === targetId) ? targetId : (list[0]?.id ?? ""));
  }

  function submit() {
    if (left <= 0) {
      toast.error("Hết quota", { description: "Đã dùng hết yêu cầu tháng này." });
      return;
    }
    if (!content.trim()) {
      toast.error("Thiếu nội dung", { description: "Nhập nội dung yêu cầu đã." });
      return;
    }
    startTransition(async () => {
      const res = await createSupportRequestAction(type, targetId, content.trim());
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã gửi yêu cầu <EmojiIcon glyph="🤝" />
        </span>,
      );
      setOpen(false);
      setContent("");
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={left <= 0}
       
      >
        <EmojiIcon glyph="➕" /> Tạo yêu cầu ({left}/{MAX_REQUESTS_PER_MONTH} còn lại)
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              <EmojiIcon glyph="🤝" /> Tạo yêu cầu hỗ trợ
            </DialogTitle>
          </DialogHeader>
          <NhomTruong>
            <TruongNhap nhan="Loại yêu cầu">
              <Select value={type} onValueChange={changeType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((t) => (
                    <SelectItem key={t.code} value={t.code}>
                      <span className="inline-flex items-center gap-1">
                        <EmojiIcon glyph={t.icon} /> {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TruongNhap>
            <TruongNhap nhan="Người hỗ trợ / người duyệt">
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targets.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.dept})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TruongNhap>
            <TruongNhap nhan="Nội dung">
              <Textarea
                rows={3}
                placeholder="Mô tả cần hỗ trợ gì / lý do nghỉ / nội dung đề xuất"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TruongNhap>
            <p className="text-cb-ink-faint text-xs">
              Yêu cầu sẽ gửi tới người hỗ trợ và ở trạng thái <b>chờ duyệt</b>. Tối đa{" "}
              {MAX_REQUESTS_PER_MONTH} yêu cầu/tháng.
            </p>
          </NhomTruong>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={submit}
              disabled={isPending}
             
            >
              {isPending ? (
                "Đang gửi…"
              ) : (
                <>
                  Gửi yêu cầu <EmojiIcon glyph="⚔" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
