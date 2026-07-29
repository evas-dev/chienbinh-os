"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThanhTienDo } from "@/components/chung/thanh-tien-do";
import { fmtNum } from "@/lib/format";
import { nhanLoaiNhiemVu, STATUS_LABEL } from "@/lib/missions";
import { acceptMissionAction } from "@/lib/actions/missions";
import { SubmitReportDialog } from "./submit-report-dialog";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import type { Tables } from "@/types/database";

type Mission = Tables<"missions">;

export function MissionCard({
  mission,
  assigneeName,
  assignerName,
  rejectReason,
}: {
  mission: Mission;
  assigneeName?: string;
  assignerName?: string;
  rejectReason?: string;
}) {
  const [submitOpen, setSubmitOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pct = mission.target
    ? Math.min(100, Math.round(((mission.current ?? 0) / mission.target) * 100))
    : 0;

  function accept() {
    startTransition(async () => {
      const res = await acceptMissionAction(mission.id);
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success("Nhận nhiệm vụ", { description: "Ra trận thôi, chiến binh!" });
    });
  }

  return (
    <div className="border-cb-line-soft flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b py-3.5 last:border-none">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="bg-cb-panel-2 text-cb-ink-dim rounded-full px-2 py-0.5 text-xs">
            {nhanLoaiNhiemVu(mission.type, mission.fixed)}
          </span>
          <span className="bg-cb-panel-2 text-cb-ink-dim rounded-full px-2 py-0.5 text-xs">
            {STATUS_LABEL[mission.status ?? "todo"]}
          </span>
          <span className="text-sm font-medium">{mission.title}</span>
        </div>
        {assigneeName || assignerName ? (
          <div className="text-cb-ink-faint mb-1 text-xs">
            {assigneeName ? (
              <>
                Người nhận: <b>{assigneeName}</b> ·{" "}
              </>
            ) : null}
            {assignerName ? <>Người giao: {assignerName} · </> : null}
            Hạn: {mission.deadline}
          </div>
        ) : null}
        <div className="mt-2">
          <ThanhTienDo pct={pct} />
        </div>
        <div className="text-cb-ink-faint mt-1.5 flex justify-between text-xs">
          <span>
            {fmtNum(mission.current ?? 0)}/{fmtNum(mission.target ?? 0)} {mission.unit} ({pct}%)
          </span>
          <span className="text-cb-gold font-semibold">+{mission.exp} EXP</span>
        </div>
        {rejectReason ? (
          <p className="mt-1.5 flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-400">
            <EmojiIcon glyph="❌" /> Bị từ chối: {rejectReason}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">
        {mission.status === "todo" ? (
          <Button
            size="sm"
            disabled={isPending}
            onClick={accept}
            className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft flex items-center gap-1"
          >
            Nhận <EmojiIcon glyph="⚔" />
          </Button>
        ) : mission.status === "doing" ? (
          <Button
            size="sm"
            onClick={() => setSubmitOpen(true)}
            className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft"
          >
            Nộp báo cáo
          </Button>
        ) : mission.status === "review" ? (
          <span className="bg-cb-panel-2 text-cb-ink-dim rounded-full px-2 py-1 text-xs">
            Chờ duyệt
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-400">
            <EmojiIcon glyph="✔" /> Xong
          </span>
        )}
      </div>

      <SubmitReportDialog
        missionId={mission.id}
        missionTitle={mission.title}
        open={submitOpen}
        onOpenChange={setSubmitOpen}
      />
    </div>
  );
}
