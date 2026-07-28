import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { rankOf, expProgress } from "@/lib/ranks";
import { fmtNum, initials } from "@/lib/format";
import { FRONT_LABEL, ROLE_LABEL } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { MissionCard } from "@/components/missions/mission-card";
import { BadgeWall } from "@/components/home/badge-wall";
import { PenaltyRecordCard } from "@/components/penalty/penalty-record-card";
import { CeoHome } from "@/components/home/ceo-home";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null; // layout đã redirect, chỉ để TypeScript yên tâm

  if (profile.role === "tong_tu_lenh") {
    return <CeoHome />;
  }

  const supabase = await createClient();
  const [{ data: ranks }, { count: badgeCount }, { data: todayMissions }] = await Promise.all([
    supabase.from("ranks").select("*"),
    supabase.from("warrior_badges").select("*", { count: "exact", head: true }).eq("warrior_id", profile.id),
    supabase
      .from("missions")
      .select("*")
      .eq("assignee_id", profile.id)
      .eq("type", "ngay")
      .neq("status", "done"),
  ]);

  const rank = rankOf(profile.exp, ranks ?? []);
  const progress = expProgress(profile.exp, ranks ?? []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-cb-crimson text-cb-ink flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
                {initials(profile.name)}
              </div>
              <div>
                <div className="text-lg font-bold">{profile.name}</div>
                <div className="text-cb-ink-dim text-sm">
                  {profile.front ? FRONT_LABEL[profile.front] : "—"} · {profile.dept} ·{" "}
                  {ROLE_LABEL[profile.role]}
                </div>
                <div className="text-cb-gold mt-1 flex items-center gap-1 text-sm font-semibold">
                  <EmojiIcon glyph={rank.insignia} /> {rank.name}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-cb-ink-dim mb-1 flex justify-between text-xs">
                <span>EXP: {fmtNum(profile.exp)}</span>
                <span>
                  Còn {fmtNum(progress.remaining)} → {progress.nextName}
                </span>
              </div>
              <div className="bg-cb-panel-2 h-2 overflow-hidden rounded-full">
                <div className="bg-cb-gold h-full" style={{ width: `${progress.pct}%` }} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="bg-cb-panel-2 rounded-lg p-3">
                <div className="text-cb-gold text-xl font-bold">{badgeCount ?? 0}</div>
                <div className="text-cb-ink-faint text-xs">HUÂN CHƯƠNG</div>
              </div>
              <div className="bg-cb-panel-2 rounded-lg p-3">
                <div className="text-cb-gold text-xl font-bold">{fmtNum(profile.season_points)}</div>
                <div className="text-cb-ink-faint text-xs">ĐIỂM MÙA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="🎯" /> Nhiệm vụ hôm nay
            </div>
            {(todayMissions ?? []).length ? (
              (todayMissions ?? []).map((m) => <MissionCard key={m.id} mission={m} />)
            ) : (
              <p className="text-cb-ink-dim text-sm">
                Hôm nay chưa có nhiệm vụ ngày. Vào "Bảng nhiệm vụ" nhận thêm.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BadgeWall warriorId={profile.id} />
        <PenaltyRecordCard warriorId={profile.id} />
      </div>
    </div>
  );
}
