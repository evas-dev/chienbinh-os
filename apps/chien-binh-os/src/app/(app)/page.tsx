import Link from "next/link";
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
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { ThanhTienDo } from "@/components/chung/thanh-tien-do";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null; // layout đã redirect, chỉ để TypeScript yên tâm

  if (profile.role === "tong_tu_lenh") {
    return <CeoHome />;
  }

  const supabase = await createClient();
  const [{ data: ranks }, { count: badgeCount }, { data: todayMissions, error: missionsError }, { data: squad }] =
    await Promise.all([
      supabase.from("ranks").select("*"),
      supabase.from("warrior_badges").select("*", { count: "exact", head: true }).eq("warrior_id", profile.id),
      supabase
        .from("missions")
        .select("*")
        .eq("assignee_id", profile.id)
        .eq("type", "ngay")
        .neq("status", "done"),
      profile.squad_id
        ? supabase.from("squads").select("name").eq("id", profile.squad_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  const rank = rankOf(profile.exp, ranks ?? []);
  const progress = expProgress(profile.exp, ranks ?? []);

  return (
    <div className="space-y-4">
      <div className="grid items-start gap-4 md:grid-cols-2">
        <Card className="bg-cb-panel border-cb-line">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-cb-crimson text-cb-ink flex size-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold">
                {initials(profile.name)}
              </div>
              <div className="min-w-0">
                <div className="text-lg leading-tight font-bold">{profile.name}</div>
                <div className="text-cb-ink-dim mt-0.5 text-sm">
                  {profile.front ? FRONT_LABEL[profile.front] : "—"} · {profile.dept} ·{" "}
                  {ROLE_LABEL[profile.role]}
                </div>
                <div className="text-cb-ink-faint mt-0.5 text-xs">
                  Tiểu đội: {squad?.name ?? "Chưa cập nhật"}
                </div>
                <div className="text-cb-gold mt-1.5 flex items-center gap-1.5 text-sm font-semibold">
                  <EmojiIcon glyph={rank.insignia} /> {rank.name}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-cb-ink-dim mb-2 flex flex-wrap justify-between gap-2 text-xs">
                <span>EXP: {fmtNum(profile.exp)}</span>
                <span>
                  Còn {fmtNum(progress.remaining)} → {progress.nextName}
                </span>
              </div>
              {progress.configIssue ? (
                <p className="text-cb-crimson text-xs">
                  <EmojiIcon glyph="⚠️" /> {progress.configIssue}
                </p>
              ) : (
                <ThanhTienDo pct={progress.pct} />
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="bg-cb-panel-2 rounded-xl p-4">
                <div className="text-cb-gold text-xl font-bold">{badgeCount ?? 0}</div>
                <div className="text-cb-ink-faint mt-1 text-xs tracking-wide">HUÂN CHƯƠNG</div>
              </div>
              <div className="bg-cb-panel-2 rounded-xl p-4">
                <div className="text-cb-gold text-xl font-bold">{fmtNum(profile.season_points)}</div>
                <div className="text-cb-ink-faint mt-1 text-xs tracking-wide">ĐIỂM MÙA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cb-panel border-cb-line">
          <CardContent>
            <TieuDeMuc icon="🎯">Nhiệm vụ hôm nay</TieuDeMuc>
            {missionsError ? (
              // Lỗi truy vấn phải khác trạng thái "chưa có nhiệm vụ" (CMD-03.3,
              // CMD-09) — không được mô tả lỗi thành trạng thái trống.
              <p className="text-cb-crimson text-sm leading-relaxed">
                Không tải được nhiệm vụ hôm nay, vui lòng thử lại.{" "}
                <Link href="/" className="underline">
                  Thử lại
                </Link>
              </p>
            ) : (todayMissions ?? []).length ? (
              (todayMissions ?? []).map((m) => <MissionCard key={m.id} mission={m} />)
            ) : (
              <p className="text-cb-ink-dim text-sm leading-relaxed">
                Hôm nay chưa có nhiệm vụ ngày. Vào «Bảng nhiệm vụ» nhận thêm.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <BadgeWall warriorId={profile.id} />
        <PenaltyRecordCard warriorId={profile.id} />
      </div>
    </div>
  );
}
