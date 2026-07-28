"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/nav";
import { setActiveAction } from "@/lib/actions/admin";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import type { Tables } from "@/types/database";

export function StaffRow({
  warrior,
  isSelf,
}: {
  warrior: Tables<"profiles">;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const isCeo = warrior.role === "tong_tu_lenh";

  function toggle() {
    startTransition(async () => {
      const res = await setActiveAction(warrior.id, !warrior.active);
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(warrior.active ? "Đã ngưng tài khoản" : "Đã kích hoạt lại");
    });
  }

  return (
    <div className={`flex items-center gap-3 py-2.5 ${warrior.active ? "" : "opacity-60"}`}>
      <div className="bg-cb-panel-2 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold">
        {initials(warrior.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">
          {warrior.name} {isSelf ? <span className="text-cb-ink-faint">· Bạn</span> : null}
        </div>
        <div className="text-cb-ink-faint text-xs">
          {ROLE_LABEL[warrior.role]} · {warrior.dept} ·{" "}
          <span className="inline-flex items-center gap-1">
            <EmojiIcon glyph="📱" />
            {warrior.phone}
          </span>
        </div>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          warrior.active ? "bg-green-500/10 text-green-400" : "bg-cb-crimson/10 text-cb-crimson"
        }`}
      >
        {warrior.active ? "Đang hoạt động" : "Đã ngưng"}
      </span>
      {isCeo || isSelf ? (
        <span className="text-cb-ink-faint w-20 text-right text-xs">{isCeo ? "CEO" : "Bạn"}</span>
      ) : (
        <Button size="sm" variant="outline" disabled={isPending} onClick={toggle} className="w-20">
          {warrior.active ? "Ngưng" : "Kích hoạt"}
        </Button>
      )}
    </div>
  );
}
