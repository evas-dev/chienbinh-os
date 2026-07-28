import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { EmojiIcon } from "@/components/chung/emoji-icon";

// Hồ sơ kỷ luật của 1 nhân sự — hiện trong Sở chỉ huy của người đó.
export async function PenaltyRecordCard({ warriorId }: { warriorId: string }) {
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("penalty_log")
    .select("id, reason, created_at, penalties(name, exp_delta, extra), profiles!penalty_log_applied_by_fkey(name)")
    .eq("warrior_id", warriorId)
    .order("created_at", { ascending: false });

  const rows = list ?? [];

  return (
    <Card className="bg-cb-panel border-cb-line">
      <CardContent className="pt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1 font-semibold">
            <EmojiIcon glyph="⚖️" /> Hồ sơ kỷ luật
          </span>
          {rows.length ? (
            <span className="bg-cb-crimson/10 text-cb-crimson rounded-full px-2 py-0.5 text-xs">
              {rows.length} án phạt
            </span>
          ) : null}
        </div>
        {rows.length === 0 ? (
          <p className="text-cb-ink-dim flex items-center gap-1 text-sm">
            Chưa có vi phạm nào — hồ sơ kỷ luật sạch <EmojiIcon glyph="🛡" />
          </p>
        ) : (
          rows.map((l) => {
            const penalty = Array.isArray(l.penalties) ? l.penalties[0] : l.penalties;
            const by = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
            return (
              <div key={l.id} className="border-cb-line-soft border-b py-2 last:border-none">
                <div className="text-sm font-medium">
                  {penalty?.name}{" "}
                  <span className="text-cb-crimson">({penalty?.exp_delta} EXP)</span>
                </div>
                <div className="text-cb-ink-faint flex items-center gap-1 text-xs">
                  <EmojiIcon glyph="⚠" /> {penalty?.extra} · Lý do: {l.reason || "—"}
                </div>
                <div className="text-cb-ink-faint text-xs">
                  Người phạt: {by?.name ?? "—"} ·{" "}
                  {l.created_at ? new Date(l.created_at).toLocaleDateString("vi-VN") : ""}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
