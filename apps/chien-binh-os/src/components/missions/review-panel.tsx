"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CONTENT_TYPES } from "@/lib/missions";
import { approveSubmissionAction, rejectSubmissionAction, revertSubmissionAction } from "@/lib/actions/missions";
import { ReasonDialog } from "./reason-dialog";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import type { Tables } from "@/types/database";

type Submission = Tables<"submissions"> & { submitter_name?: string };

function contentSummary(content: unknown) {
  if (!content || typeof content !== "object") return "(không có dữ liệu)";
  const c = content as Record<string, unknown>;
  const parts: string[] = [];
  for (const ct of CONTENT_TYPES) {
    if (c[ct.key] !== undefined) parts.push(`${ct.label}: ${String(c[ct.key])}`);
  }
  if (typeof c.note === "string" && c.note) parts.push(`Ghi chú: ${c.note}`);
  return parts.length ? parts.join(" · ") : "(không có dữ liệu)";
}

function SubmissionCard({ sub, pending }: { sub: Submission; pending: boolean }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [revertOpen, setRevertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      const res = await approveSubmissionAction(sub.id);
      if (!res.ok) {
        toast.error("Lỗi duyệt", { description: res.error });
        return;
      }
      const data = res.data as { exp_delta: number; rank_up: boolean } | undefined;
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã duyệt <EmojiIcon glyph="✅" />
        </span>,
        {
          description: data ? (
            <span className="inline-flex items-center gap-1">
              +{data.exp_delta} EXP
              {data.rank_up ? (
                <>
                  · Thăng quân hàm! <EmojiIcon glyph="🎖" />
                </>
              ) : null}
            </span>
          ) : undefined,
        }
      );
    });
  }

  const statusChip =
    sub.status === "cho_duyet" ? (
      <span className="bg-cb-panel-2 text-cb-ink-dim inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs">
        <EmojiIcon glyph="⏳" /> Chờ duyệt · Lần {sub.round}
      </span>
    ) : sub.status === "da_duyet" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
        <EmojiIcon glyph="✅" /> Đã duyệt
      </span>
    ) : (
      <span className="bg-cb-crimson/10 text-cb-crimson inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs">
        <EmojiIcon glyph="❌" /> Từ chối
      </span>
    );

  return (
    <div className="border-cb-line-soft border-b py-3.5 last:border-none">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        {statusChip}
        <b className="text-sm">{sub.mission_title}</b>
      </div>
      <div className="text-cb-ink-faint text-xs">
        Nhân sự: <b>{sub.submitter_name ?? sub.submitter_phone}</b> ·{" "}
        {sub.created_at ? new Date(sub.created_at).toLocaleDateString("vi-VN") : ""}
      </div>
      <div className="text-cb-ink-dim mt-0.5 text-xs">{contentSummary(sub.content)}</div>
      {sub.reject_reason ? (
        <div className="text-cb-crimson mt-1 text-xs">Lý do: {sub.reject_reason}</div>
      ) : null}

      {pending ? (
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={approve}
            className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft"
          >
            Duyệt <EmojiIcon glyph="✅" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)}>
            Từ chối
          </Button>
        </div>
      ) : sub.status === "da_duyet" ? (
        <div className="mt-2">
          <Button size="sm" variant="outline" onClick={() => setRevertOpen(true)}>
            Đổi sang từ chối
          </Button>
        </div>
      ) : null}

      <ReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={
          <>
            <EmojiIcon glyph="❌" /> Từ chối kết quả
          </>
        }
        hint={sub.mission_title}
        confirmLabel="Gửi từ chối"
        confirmVariant="destructive"
        successMessage="Đã từ chối"
        action={(reason) => rejectSubmissionAction(sub.id, reason)}
      />
      <ReasonDialog
        open={revertOpen}
        onOpenChange={setRevertOpen}
        title={
          <>
            <EmojiIcon glyph="🔄" /> Đổi thành từ chối
          </>
        }
        hint={
          <>
            <EmojiIcon glyph="⚠️" /> Kết quả này đã được duyệt. Chuyển sang từ chối sẽ thu hồi EXP đã cộng.
          </>
        }
        confirmLabel="Xác nhận thu hồi"
        confirmVariant="destructive"
        successMessage="Đã thu hồi, EXP đã hoàn lại"
        action={(reason) => revertSubmissionAction(sub.id, reason)}
      />
    </div>
  );
}

export function ReviewPanel({
  pending,
  recent,
}: {
  pending: Submission[];
  recent: Submission[];
}) {
  return (
    <>
      <Card className="bg-cb-panel border-cb-line mb-4">
        <CardContent>
          <TieuDeMuc icon="🛡">Chờ anh/chị duyệt ({pending.length})</TieuDeMuc>
          {pending.length ? (
            pending.map((s) => <SubmissionCard key={s.id} sub={s} pending />)
          ) : (
            <p className="text-cb-ink-dim text-sm">Không có kết quả nào chờ duyệt.</p>
          )}
        </CardContent>
      </Card>
      <Card className="bg-cb-panel border-cb-line mb-4">
        <CardContent>
          <TieuDeMuc icon="📋">Kết quả đã xử lý</TieuDeMuc>
          {recent.length ? (
            recent.map((s) => <SubmissionCard key={s.id} sub={s} pending={false} />)
          ) : (
            <p className="text-cb-ink-dim text-sm">Chưa có kết quả nào.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
