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
import { ChonNhieuNguoi } from "@/components/chung/chon-nhieu-nguoi";
import { ngayHomNay } from "@/lib/tuan";
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
  const [who, setWho] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (who.length === 0) {
      toast.error("Chưa chọn người nhận", { description: "Tích ít nhất một chiến sỹ." });
      return;
    }
    startTransition(async () => {
      const res = await createMissionAction({
        title: title.trim(),
        type: "ngay",
        parentId: null,
        assigneeIds: who,
        target: Number(target) || 1,
        unit: unit.trim(),
        exp: Number(exp) || 40,
        deadline: ngayHomNay(),
        fixed: true,
      });
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      const { soTao, loi } = res.data;
      if (loi.length > 0) {
        toast.warning(`Giao được ${soTao}/${who.length} người`, { description: loi[0] });
      } else {
        toast.success(
          <span className="inline-flex items-center gap-1">
            Đã giao cho {soTao} người <EmojiIcon glyph="⚔" />
          </span>,
        );
      }
      setOpen(false);
      setWho([]);
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
            <TruongNhap nhan={`Giao cho${who.length > 0 ? ` (${who.length} người)` : ""}`}>
              <ChonNhieuNguoi
                danhSach={soldiers}
                daChon={who}
                onDoiChon={setWho}
                thongBaoRong="Mặt trận này chưa có chiến sỹ để giao."
              />
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
