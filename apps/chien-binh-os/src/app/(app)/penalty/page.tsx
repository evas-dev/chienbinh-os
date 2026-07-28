import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { PenaltyForm } from "@/components/penalty/penalty-form";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";

const SEVERITY_COLOR: Record<string, string> = {
  nhe: "#8fc0f5",
  vua: "var(--cb-gold-soft)",
  nang: "#f0a093",
  rat_nang: "#ff6b5a",
};
const SEVERITY_LABEL: Record<string, string> = {
  nhe: "Nhẹ",
  vua: "Vừa",
  nang: "Nặng",
  rat_nang: "Rất nặng",
};

export default async function PenaltyPage() {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh", "tu_lenh"]);
  if (!profile) return null;

  const supabase = await createClient();
  const [{ data: penalties }, { data: targets }, { data: log }] = await Promise.all([
    supabase.from("penalties").select("*"),
    supabase.from("profiles").select("id, name, dept").neq("role", "tong_tu_lenh"),
    supabase
      .from("penalty_log")
      .select(
        "id, reason, created_at, penalties(name, exp_delta, extra, severity), profiles!penalty_log_warrior_id_fkey(name), applier:profiles!penalty_log_applied_by_fkey(name)",
      )
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div>
      <PenaltyForm
        actorName={profile.name}
        targets={targets ?? []}
        penalties={penalties ?? []}
      />

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Card className="bg-cb-panel border-cb-line">
          <CardContent>
            <TieuDeMuc icon="📕">Danh mục xử phạt</TieuDeMuc>
            {(penalties ?? []).map((p) => (
              <div key={p.code} className="border-cb-line-soft border-b py-3.5 last:border-none">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-cb-ink-faint mt-1 flex items-center gap-3 text-xs">
                  <span style={{ color: SEVERITY_COLOR[p.severity ?? "nhe"] }} className="font-semibold">
                    ● {SEVERITY_LABEL[p.severity ?? "nhe"]}
                  </span>
                  <span className="text-cb-crimson">{p.exp_delta} EXP</span>
                  <span className="flex items-center gap-1">
                    <EmojiIcon glyph="⚠" /> {p.extra}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-cb-panel border-cb-line">
          <CardContent>
            <TieuDeMuc icon="🗂">Sổ ghi án phạt</TieuDeMuc>
            {(log ?? []).length === 0 ? (
              <p className="text-cb-ink-dim text-sm">
                Chưa có án phạt nào. Giữ vững kỷ luật chiến trường <EmojiIcon glyph="🛡" />
              </p>
            ) : (
              (log ?? []).map((l) => {
                const penalty = Array.isArray(l.penalties) ? l.penalties[0] : l.penalties;
                const warrior = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
                const applier = Array.isArray(l.applier) ? l.applier[0] : l.applier;
                return (
                  <div
                    key={l.id}
                    className="border-cb-line-soft flex items-start gap-2 border-b py-3.5 text-sm last:border-none"
                  >
                    <EmojiIcon glyph="⚖️" />
                    <div className="min-w-0">
                      <div>
                        <b>{warrior?.name}</b> — {penalty?.name}{" "}
                        <span className="text-cb-crimson">({penalty?.exp_delta} EXP)</span>
                      </div>
                      <div className="text-cb-ink-faint text-xs">
                        {penalty?.extra} · Lý do: {l.reason || "—"} · Người phạt: {applier?.name} ·{" "}
                        {l.created_at ? new Date(l.created_at).toLocaleDateString("vi-VN") : ""}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
