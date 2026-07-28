"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { approveCommendationAction, rejectCommendationAction } from "@/lib/actions/commend";

const STATUS: Record<string, { label: string; cls: string }> = {
  cho_duyet: { label: "Chờ CEO duyệt", cls: "bg-cb-panel-2 text-cb-ink-dim" },
  da_duyet: { label: "Đã trao", cls: "bg-green-500/10 text-green-400" },
  tu_choi: { label: "Từ chối", cls: "bg-cb-crimson/10 text-cb-crimson" },
};

export function CommendRow({
  id,
  status,
  staffName,
  staffDept,
  proposedByName,
  badgeIcon,
  badgeName,
  reason,
  canApprove,
}: {
  id: string;
  status: string;
  staffName: string;
  staffDept: string | null;
  proposedByName: string | null;
  badgeIcon: string | null;
  badgeName: string;
  reason: string | null;
  canApprove: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const s = STATUS[status] ?? STATUS.cho_duyet;

  function approve() {
    startTransition(async () => {
      const res = await approveCommendationAction(id);
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã trao huân chương <EmojiIcon glyph="🏅" />
        </span>,
        { description: `${staffName} · ${badgeName}` },
      );
    });
  }
  function reject() {
    startTransition(async () => {
      const res = await rejectCommendationAction(id);
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success("Đã từ chối đề xuất");
    });
  }

  return (
    <div className="border-cb-line-soft border-b py-3 last:border-none">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] ${s.cls}`}>{s.label}</span>
        <b className="inline-flex items-center gap-1 text-sm">
          <EmojiIcon glyph={badgeIcon} /> {badgeName}
        </b>
      </div>
      <div className="text-cb-ink-faint flex items-center gap-1 text-xs">
        <EmojiIcon glyph="👤" /> Khen: <b>{staffName}</b> ({staffDept}) · Do {proposedByName ?? "—"} đề xuất
      </div>
      <div className="text-cb-ink-dim mt-0.5 flex items-center gap-1 text-xs">
        <EmojiIcon glyph="📝" /> {reason}
      </div>
      {canApprove && status === "cho_duyet" ? (
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={approve}
            className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft"
          >
            Trao <EmojiIcon glyph="🏅" />
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={reject}>
            Từ chối
          </Button>
        </div>
      ) : null}
    </div>
  );
}
