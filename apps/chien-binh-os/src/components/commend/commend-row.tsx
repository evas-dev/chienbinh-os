"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { Chip, type ChipMau } from "@/components/chung/chip";
import { ReasonDialog } from "@/components/missions/reason-dialog";
import {
  approveCommendationAction,
  rejectCommendationAction,
  revokeCommendationAction,
} from "@/lib/actions/commend";

const STATUS: Record<string, { label: string; mau: ChipMau }> = {
  cho_duyet: { label: "Chờ CEO duyệt", mau: "tim" },
  da_duyet: { label: "Đã trao", mau: "xanh" },
  tu_choi: { label: "Từ chối", mau: "do" },
  thu_hoi: { label: "Đã thu hồi", mau: "do" },
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
  revokedAt,
  revokeReason,
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
  revokedAt?: string | null;
  revokeReason?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [revokeOpen, setRevokeOpen] = useState(false);
  const isRevoked = Boolean(revokedAt);
  const s = isRevoked ? STATUS.thu_hoi : (STATUS[status] ?? STATUS.cho_duyet);

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
    <div className="border-cb-line-soft border-b py-3.5 last:border-none">
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <Chip mau={s.mau}>{s.label}</Chip>
        <b className="inline-flex items-center gap-1 text-sm">
          <EmojiIcon glyph={badgeIcon} /> {badgeName}
        </b>
      </div>
      <div className="text-cb-ink-faint flex items-center gap-1 text-xs">
        <EmojiIcon glyph="👤" /> Khen: <b>{staffName}</b> ({staffDept}) · Do {proposedByName ?? "—"} đề xuất
      </div>
      <div className="text-cb-ink-dim mt-1 flex items-center gap-1 text-xs">
        <EmojiIcon glyph="📝" /> {reason}
      </div>
      {isRevoked ? (
        <div className="text-cb-crimson mt-1 flex items-center gap-1 text-xs">
          <EmojiIcon glyph="↩️" /> Đã thu hồi: {revokeReason}
        </div>
      ) : null}
      {canApprove && status === "cho_duyet" ? (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={approve}
           
          >
            Trao <EmojiIcon glyph="🏅" />
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={reject}>
            Từ chối
          </Button>
        </div>
      ) : null}
      {canApprove && status === "da_duyet" && !isRevoked ? (
        <div className="mt-3">
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => setRevokeOpen(true)}>
            <EmojiIcon glyph="↩️" /> Thu hồi
          </Button>
        </div>
      ) : null}
      <ReasonDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title={
          <>
            <EmojiIcon glyph="↩️" /> Thu hồi khen thưởng
          </>
        }
        hint={
          <>
            <EmojiIcon glyph="⚠️" /> Huy hiệu «{badgeName}» của {staffName} sẽ bị đánh dấu thu hồi. Lịch
            sử vẫn được giữ lại.
          </>
        }
        confirmLabel="Xác nhận thu hồi"
        confirmVariant="destructive"
        successMessage="Đã thu hồi khen thưởng"
        action={(revokeReasonInput) => revokeCommendationAction(id, revokeReasonInput)}
      />
    </div>
  );
}
