"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { Chip, type ChipMau } from "@/components/chung/chip";
import { REQUEST_TYPES } from "@/lib/support-requests";
import {
  respondSupportRequestAction,
  cancelSupportRequestAction,
} from "@/lib/actions/support-requests";
import type { Enums } from "@/types/database";

const STATUS: Record<string, { label: string; mau: ChipMau }> = {
  cho_duyet: { label: "Chờ duyệt", mau: "tim" },
  da_duyet: { label: "Đã duyệt", mau: "xanh" },
  tu_choi: { label: "Từ chối", mau: "do" },
};

export function RequestRow({
  id,
  type,
  status,
  otherPartyName,
  otherPartyRole,
  content,
  createdAt,
  cancelledAt,
  mode,
}: {
  id: string;
  type: Enums<"support_type">;
  status: string;
  otherPartyName: string;
  otherPartyRole?: string;
  content: string | null;
  createdAt: string | null;
  /** SUP-07: yêu cầu đã bị người gửi huỷ — vẫn giữ row (tính vào hạn mức
   * tháng) nhưng ẩn khỏi luồng xử lý, hiển thị nhãn riêng. */
  cancelledAt?: string | null;
  /** "mine" = tôi tạo (có thể huỷ) · "incoming" = gửi tới tôi (có thể duyệt/từ chối) */
  mode: "mine" | "incoming";
}) {
  const [isPending, startTransition] = useTransition();
  const t = REQUEST_TYPES.find((x) => x.code === type);
  const s = cancelledAt ? { label: "Đã hủy", mau: "xam" as ChipMau } : (STATUS[status] ?? STATUS.cho_duyet);

  function respond(approve: boolean) {
    startTransition(async () => {
      const res = await respondSupportRequestAction(id, approve);
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(
        approve ? (
          <span className="inline-flex items-center gap-1">
            Đã duyệt <EmojiIcon glyph="✅" />
          </span>
        ) : (
          "Đã từ chối"
        ),
      );
    });
  }
  function cancel() {
    startTransition(async () => {
      const res = await cancelSupportRequestAction(id);
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success("Đã huỷ yêu cầu");
    });
  }

  return (
    <div className="border-cb-line-soft border-b py-3.5 last:border-none">
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <Chip mau={s.mau}>{s.label}</Chip>
        <b className="inline-flex items-center gap-1 text-sm">
          <EmojiIcon glyph={t?.icon} /> {t?.label}
        </b>
      </div>
      <div className="text-cb-ink-faint text-xs">
        {mode === "mine" ? "Người hỗ trợ" : "Từ"}: <b>{otherPartyName}</b>
        {otherPartyRole ? ` (${otherPartyRole})` : ""} ·{" "}
        {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : ""}
      </div>
      <div className="text-cb-ink-dim mt-1 flex items-center gap-1 text-xs">
        <EmojiIcon glyph="📝" /> {content}
      </div>
      {status === "cho_duyet" && !cancelledAt ? (
        <div className="mt-3 flex gap-2">
          {mode === "incoming" ? (
            <>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => respond(true)}
                className="bg-cb-crimson hover:bg-cb-crimson-deep text-white"
              >
                Duyệt <EmojiIcon glyph="✅" />
              </Button>
              <Button size="sm" variant="outline" disabled={isPending} onClick={() => respond(false)}>
                Từ chối
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" disabled={isPending} onClick={cancel}>
              Hủy
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
