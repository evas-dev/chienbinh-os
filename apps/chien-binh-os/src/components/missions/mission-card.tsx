"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThanhTienDo } from "@/components/chung/thanh-tien-do";
import { fmtNum } from "@/lib/format";
import { nhanLoaiNhiemVu, STATUS_LABEL, STATUS_MAU } from "@/lib/missions";
import { Chip } from "@/components/chung/chip";
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
    // Mỗi nhiệm vụ là một khối nổi riêng thay vì một dòng ngăn bởi gạch chân:
    // dễ quét mắt hơn khi danh sách dài, và hợp chất game hơn.
    <div className="bg-cb-bg-2 border-cb-line mb-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border p-3.5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.04)] last:mb-0">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Chip>{nhanLoaiNhiemVu(mission.type, mission.fixed)}</Chip>
          <Chip mau={STATUS_MAU[mission.status ?? "todo"]}>
            {STATUS_LABEL[mission.status ?? "todo"]}
          </Chip>
          <span className="text-sm font-semibold">{mission.title}</span>
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
        <div className="text-cb-ink-faint mt-1.5 flex items-center justify-between gap-2 text-xs">
          <span>
            {fmtNum(mission.current ?? 0)}/{fmtNum(mission.target ?? 0)} {mission.unit} ({pct}%)
          </span>
          <Chip mau="vang">+{mission.exp} EXP</Chip>
        </div>
        {rejectReason ? (
          <p className="border-cb-crimson/40 bg-cb-crimson/12 text-cb-crimson mt-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium">
            <EmojiIcon glyph="❌" /> Bị từ chối: {rejectReason}
          </p>
        ) : null}
      </div>
      {/* Chỉ chừa cột phải khi thật sự có việc để bấm. Trạng thái "Chờ duyệt"/
          "Hoàn thành" đã có nhãn màu ở hàng trên rồi, lặp lại lần nữa chỉ làm
          rối. Nút cũng không cần đè `bg-cb-gold`: biến thể mặc định đã là nút
          vàng vát nổi, đè màu phẳng lên sẽ giết mất lớp gradient. */}
      {mission.status === "todo" ? (
        <div className="shrink-0">
          <Button size="sm" variant="success" disabled={isPending} onClick={accept}>
            Nhận <EmojiIcon glyph="⚔" />
          </Button>
        </div>
      ) : mission.status === "doing" ? (
        <div className="shrink-0">
          <Button size="sm" onClick={() => setSubmitOpen(true)}>
            Nộp báo cáo
          </Button>
        </div>
      ) : null}

      <SubmitReportDialog
        missionId={mission.id}
        missionTitle={mission.title}
        open={submitOpen}
        onOpenChange={setSubmitOpen}
      />
    </div>
  );
}
