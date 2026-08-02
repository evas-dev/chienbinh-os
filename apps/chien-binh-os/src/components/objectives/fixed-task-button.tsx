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
import { createMissionAction } from "@/lib/actions/missions";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { NhomTruong, TruongNhap } from "@/components/chung/truong-nhap";
import type { FIXED_TASKS } from "@/lib/objectives";

type Template = (typeof FIXED_TASKS)[number];
type Soldier = { id: string; name: string; dept: string | null };

export function FixedTaskButton({
  template,
  soldiers,
}: {
  template: Template;
  soldiers: Soldier[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`Hôm nay: ${template.title}`);
  const [target, setTarget] = useState(String(template.target));
  const [unit, setUnit] = useState<string>(template.unit);
  const [exp, setExp] = useState(String(template.exp));
  const [who, setWho] = useState(soldiers[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!who) {
      toast.error("Chưa có lính", { description: "Front này chưa có chiến sỹ để giao." });
      return;
    }
    startTransition(async () => {
      const res = await createMissionAction({
        title: title.trim(),
        type: "ngay",
        parentId: null,
        assigneeId: who,
        target: Number(target) || 1,
        unit: unit.trim(),
        exp: Number(exp) || 40,
        deadline: "Hôm nay",
        fixed: true,
      });
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã giao <EmojiIcon glyph="⚔" />
        </span>,
      );
      setOpen(false);
    });
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        ＋ {template.title} ({template.target} {template.unit})
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              <EmojiIcon glyph="⚡" /> Giao nhiệm vụ Daily
            </DialogTitle>
          </DialogHeader>
          <NhomTruong>
            <TruongNhap nhan="Nhiệm vụ">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </TruongNhap>
            <div className="grid grid-cols-3 gap-4">
              <TruongNhap nhan="Chỉ tiêu">
                <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
              </TruongNhap>
              <TruongNhap nhan="Đơn vị">
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
              </TruongNhap>
              <TruongNhap nhan="EXP">
                <Input type="number" value={exp} onChange={(e) => setExp(e.target.value)} />
              </TruongNhap>
            </div>
            <TruongNhap nhan="Giao cho">
              <Select value={who} onValueChange={setWho}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {soldiers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.dept})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TruongNhap>
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
                  Giao <EmojiIcon glyph="⚔" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
