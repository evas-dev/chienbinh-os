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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMissionAction } from "@/lib/actions/missions";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import type { Enums } from "@/types/database";

export interface MissionTarget {
  id: string;
  name: string;
  role: Enums<"role_type">;
  dept: string | null;
}

export function CreateMissionDialog({
  open,
  onOpenChange,
  title,
  isCampaign,
  targets,
  campaigns,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** true = Tổng Tư Lệnh mở chiến dịch lớn (chỉ có 1 loại: chien_dich) */
  isCampaign: boolean;
  targets: MissionTarget[];
  campaigns: { id: string; title: string }[];
}) {
  const [missionTitle, setMissionTitle] = useState("");
  const [type, setType] = useState<Enums<"mission_type">>(isCampaign ? "chien_dich" : "thang");
  const [parentId, setParentId] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState(targets[0]?.id ?? "");
  const [target, setTarget] = useState("10");
  const [unit, setUnit] = useState(isCampaign ? "khách hàng" : "đơn vị");
  const [exp, setExp] = useState(isCampaign ? "2000" : "300");
  const [deadline, setDeadline] = useState("31/08");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!missionTitle.trim()) {
      toast.error("Thiếu tên", { description: "Nhập tên nhiệm vụ đã, chỉ huy." });
      return;
    }
    if (!assigneeId) {
      toast.error("Chưa chọn người nhận");
      return;
    }
    startTransition(async () => {
      const res = await createMissionAction({
        title: missionTitle.trim(),
        type,
        parentId: parentId || null,
        assigneeId,
        target: Number(target) || 1,
        unit: unit.trim() || "đơn vị",
        exp: Number(exp) || 100,
        deadline: deadline.trim() || "—",
        fixed: false,
      });
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã bàn giao <EmojiIcon glyph="⚔" />
        </span>,
      );
      onOpenChange(false);
      setMissionTitle("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-cb-panel border-cb-line">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <EmojiIcon glyph="➕" /> {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tên nhiệm vụ</Label>
            <Input value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} />
          </div>

          {!isCampaign ? (
            <div className="space-y-1.5">
              <Label>Loại</Label>
              <Select value={type} onValueChange={(v) => setType(v as Enums<"mission_type">)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thang">Nhiệm vụ tháng (KPI khối lượng)</SelectItem>
                  {/* Hộp thoại này luôn gửi fixed:false nên nhiệm vụ tạo ra là
                      loại Bonus — nhãn phải nói đúng thứ người dùng sẽ thấy. */}
                  <SelectItem value="ngay">Nhiệm vụ Bonus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {!isCampaign && campaigns.length > 0 ? (
            <div className="space-y-1.5">
              <Label>Thuộc chiến dịch (cha)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— Không gắn —" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label>Giao cho</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
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
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label>Chỉ tiêu</Label>
              <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Đơn vị</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>EXP thưởng</Label>
              <Input type="number" value={exp} onChange={(e) => setExp(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Hạn</Label>
            <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
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
                Bàn giao <EmojiIcon glyph="⚔" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
