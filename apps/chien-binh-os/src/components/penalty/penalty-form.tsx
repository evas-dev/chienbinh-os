"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
import { applyPenaltyAction } from "@/lib/actions/penalty";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import type { Tables } from "@/types/database";

export function PenaltyForm({
  actorName,
  targets,
  penalties,
}: {
  actorName: string;
  targets: { id: string; name: string; dept: string | null }[];
  penalties: Tables<"penalties">[];
}) {
  const [who, setWho] = useState(targets[0]?.id ?? "");
  const [code, setCode] = useState(penalties[0]?.code ?? "");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!who || !code) return;
    startTransition(async () => {
      const res = await applyPenaltyAction(who, code, reason.trim());
      if (!res.ok) {
        toast.error("Lỗi xử phạt", { description: res.error });
        return;
      }
      const p = penalties.find((x) => x.code === code);
      toast.success(
        <span className="inline-flex items-center gap-1">
          <EmojiIcon glyph="⚖️" /> Đã xử phạt
        </span>,
        { description: p ? `${p.exp_delta} EXP · ${p.extra ?? ""}` : undefined },
      );
      setReason("");
    });
  }

  return (
    <Card className="mb-4">
      <CardContent>
        <TieuDeMuc icon="⚖️">Áp phạt (chịu trách nhiệm: {actorName})</TieuDeMuc>
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Chiến binh vi phạm</Label>
            <Select value={who} onValueChange={setWho}>
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
          <div className="space-y-1.5">
            <Label>Hình thức</Label>
            <Select value={code} onValueChange={setCode}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {penalties.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name} ({p.exp_delta} EXP)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4 space-y-1.5">
          <Label>Lý do / bằng chứng</Label>
          <Input
            placeholder="Mô tả ngắn gọn vi phạm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <Button
          onClick={submit}
          disabled={isPending}
          className="bg-cb-crimson hover:bg-cb-crimson-deep text-white"
        >
          {isPending ? (
            "Đang xử lý…"
          ) : (
            <>
              Ra quyết định phạt <EmojiIcon glyph="⚖️" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
