import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { rankOf } from "@/lib/ranks";
import { fmtNum, fmtVnd } from "@/lib/format";
import { FRONT_LABEL } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { BonusConfigForm } from "@/components/home/bonus-config-form";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { cn } from "@/lib/utils";

export default async function BonusPage() {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh"]);
  if (!profile) return null;

  const supabase = await createClient();
  const [{ data: warriors }, { data: ranks }, { data: config }] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("ranks").select("*"),
    supabase.from("app_config").select("value").eq("key", "bonus_pool").single(),
  ]);

  const bonus = (config?.value ?? { pool: 0, months: 6 }) as { pool: number; months: number };
  const people = (warriors ?? []).filter((w) => w.role !== "tong_tu_lenh");
  const totalExp = people.reduce((sum, w) => sum + w.exp, 0);

  const rows = [...people]
    .sort((a, b) => b.exp - a.exp)
    .map((w) => {
      const pct = totalExp ? (w.exp / totalExp) * 100 : 0;
      const money = totalExp ? (w.exp / totalExp) * bonus.pool : 0;
      return { w, pct, money };
    });

  return (
    <div>
      <p className="bg-cb-panel-2 border-cb-line mb-4 flex items-start gap-1.5 rounded-lg border p-3 text-sm">
        <EmojiIcon glyph="💰" className="mt-0.5" />
        <span>
          Công thức: <b>Thưởng mỗi người = (EXP người đó ÷ Tổng EXP toàn đội) × Quỹ</b>. EXP
          tích trong kỳ {bonus.months} tháng; cấp bậc là danh vọng riêng, không ảnh hưởng số tiền.
        </span>
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="⚙️" />
              Thiết lập quỹ (Tổng Tư Lệnh)
            </div>
            <BonusConfigForm pool={bonus.pool} months={bonus.months} />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-cb-panel-2 rounded-lg p-3">
                <div className="font-bold">{fmtNum(totalExp)}</div>
                <div className="text-cb-ink-faint text-[11px]">TỔNG EXP</div>
              </div>
              <div className="bg-cb-panel-2 rounded-lg p-3">
                <div className="font-bold">{people.length}</div>
                <div className="text-cb-ink-faint text-[11px]">CHIẾN BINH</div>
              </div>
              <div className="bg-cb-panel-2 rounded-lg p-3">
                <div className="text-sm font-bold">{fmtVnd(bonus.pool)}</div>
                <div className="text-cb-ink-faint text-[11px]">QUỸ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="space-y-1 pt-6">
            <div className="mb-2 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="🏆" />
              Bảng chia thưởng cuối kỳ ({bonus.months} tháng)
            </div>
            {rows.map(({ w, pct, money }) => (
              <div
                key={w.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2",
                  w.id === profile.id && "bg-cb-gold/10 border-cb-gold/40 border",
                )}
              >
                <div className="w-8 text-center">{rankOf(w.exp, ranks ?? []).insignia}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {w.name}
                    {w.id === profile.id ? (
                      <span className="text-cb-gold-soft ml-1.5 text-xs">· Bạn</span>
                    ) : null}
                  </div>
                  <div className="text-cb-ink-faint text-xs">
                    {w.front ? FRONT_LABEL[w.front] : "—"} · {w.dept} ·{" "}
                    {rankOf(w.exp, ranks ?? []).name} · {fmtNum(w.exp)} EXP
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cb-gold font-semibold">{fmtVnd(money)}</div>
                  <div className="text-cb-ink-faint text-[10px]">{pct.toFixed(1)}% QUỸ</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
