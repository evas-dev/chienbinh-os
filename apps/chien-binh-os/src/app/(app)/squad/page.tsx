import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { rankOf } from "@/lib/ranks";
import { fmtNum, initials } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import type { Tables } from "@/types/database";

type Warrior = Tables<"profiles">;

const FRONTS: { key: Tables<"squads">["front"]; icon: string; label: string }[] = [
  { key: "tien_tuyen", icon: "⚔️", label: "TIỀN TUYẾN — Marketing · Sale" },
  { key: "hau_phuong", icon: "🛡", label: "HẬU PHƯƠNG — Kế toán · Dev · CSKH" },
];

function WarriorRow({
  warrior,
  tag,
  ranks,
}: {
  warrior: Warrior;
  tag?: string;
  ranks: Tables<"ranks">[];
}) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <div className="bg-cb-panel-2 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold">
        {initials(warrior.name)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {warrior.name}
          {tag ? (
            <span className="bg-cb-blue/10 text-cb-blue rounded-full px-2 py-0.5 text-[11px]">
              {tag}
            </span>
          ) : null}
        </div>
        <div className="text-cb-ink-faint text-xs">
          {warrior.dept} · {rankOf(warrior.exp, ranks).name}
        </div>
      </div>
      <div className="text-cb-gold text-sm font-semibold">{fmtNum(warrior.exp)} EXP</div>
    </div>
  );
}

export default async function SquadPage() {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh"]);

  const supabase = await createClient();
  const [{ data: squads }, { data: members }, { data: ranks }, { data: allProfiles }] =
    await Promise.all([
      supabase.from("squads").select("*").order("id"),
      supabase.from("squad_members").select("squad_id, warrior_id"),
      supabase.from("ranks").select("*"),
      supabase.from("profiles").select("*"),
    ]);

  const profileById = new Map((allProfiles ?? []).map((p) => [p.id, p]));
  const membersBySquad = new Map<string, Warrior[]>();
  for (const m of members ?? []) {
    const p = profileById.get(m.warrior_id);
    if (!p) continue;
    membersBySquad.set(m.squad_id, [...(membersBySquad.get(m.squad_id) ?? []), p]);
  }

  return (
    <div className="space-y-8">
      <p className="bg-cb-panel-2 border-cb-line rounded-lg border p-3 text-sm">
        Cơ cấu tổ đội: 1 <b>tiểu đội trưởng</b> + 1 <b>tiểu đội phó</b> + tối đa 3 thành viên.
        Điểm đội gộp từ EXP thành viên → thi đua ở <b>Bảng xếp hạng · Cấp 2</b>, tạo áp lực đồng
        đội (chống mất đoàn kết).
      </p>

      {FRONTS.map((front) => {
        const frontSquads = (squads ?? []).filter((s) => s.front === front.key);
        if (frontSquads.length === 0) return null;
        return (
          <section key={front.key}>
            <h2 className="text-cb-gold-soft mb-3 flex items-center gap-1.5 font-semibold tracking-wide">
              <EmojiIcon glyph={front.icon} /> {front.label}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {frontSquads.map((s) => {
                const leader = s.leader_id ? profileById.get(s.leader_id) : undefined;
                const deputy = s.deputy_id ? profileById.get(s.deputy_id) : undefined;
                const rest = membersBySquad.get(s.id) ?? [];
                const all = [leader, deputy, ...rest].filter((w): w is Warrior => Boolean(w));
                const totalExp = all.reduce((sum, w) => sum + w.exp, 0);

                return (
                  <Card key={s.id} className="bg-cb-panel border-cb-line">
                    <CardContent className="pt-6">
                      <div className="mb-3 flex items-center gap-1.5 font-semibold">
                        <EmojiIcon glyph="🛡" /> {s.name}
                      </div>
                      {leader ? (
                        <WarriorRow warrior={leader} tag="Đội trưởng" ranks={ranks ?? []} />
                      ) : null}
                      {deputy ? (
                        <WarriorRow warrior={deputy} tag="Đội phó" ranks={ranks ?? []} />
                      ) : null}
                      {rest.map((m) => (
                        <WarriorRow key={m.id} warrior={m} ranks={ranks ?? []} />
                      ))}
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-cb-panel-2 rounded-lg p-2">
                          <div className="font-bold">{all.length}/5</div>
                          <div className="text-cb-ink-faint text-[11px]">QUÂN SỐ</div>
                        </div>
                        <div className="bg-cb-panel-2 rounded-lg p-2">
                          <div className="font-bold">{fmtNum(totalExp)}</div>
                          <div className="text-cb-ink-faint text-[11px]">TỔNG EXP</div>
                        </div>
                        <div className="bg-cb-panel-2 rounded-lg p-2">
                          <div className="font-bold">
                            {fmtNum(all.length ? Math.round(totalExp / all.length) : 0)}
                          </div>
                          <div className="text-cb-ink-faint text-[11px]">TB / NGƯỜI</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
