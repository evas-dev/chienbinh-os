import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { rankOf, expProgress } from "@/lib/ranks";
import { fmtNum } from "@/lib/format";
import { FRONT_LABEL, ROLE_LABEL } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { MissionCard } from "@/components/missions/mission-card";
import { BadgeWall } from "@/components/home/badge-wall";
import { PenaltyRecordCard } from "@/components/penalty/penalty-record-card";
import { CeoHome } from "@/components/home/ceo-home";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { ThanhTienDo } from "@/components/chung/thanh-tien-do";
import { Chip } from "@/components/chung/chip";
import { AnhDaiDien } from "@/components/chung/anh-dai-dien";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null; // layout đã redirect, chỉ để TypeScript yên tâm

  if (profile.role === "tong_tu_lenh") {
    return <CeoHome />;
  }

  const supabase = await createClient();
  const [
    { data: ranks },
    { count: badgeCount },
    { data: todayMissions, error: missionsError },
    { data: squad },
  ] = await Promise.all([
    supabase.from("ranks").select("*"),
    supabase
      .from("warrior_badges")
      .select("*", { count: "exact", head: true })
      .eq("warrior_id", profile.id),
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
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <AnhDaiDien id={profile.id} ten={profile.name} className="size-20" canhPx={80} />
              <div className="min-w-0">
                <div className="font-heading text-lg leading-tight font-bold">{profile.name}</div>
                <div className="text-cb-ink-dim mt-0.5 text-sm">
                  {profile.front ? FRONT_LABEL[profile.front] : "—"} · {profile.dept} ·{" "}
                  {ROLE_LABEL[profile.role]}
                </div>
                <div className="text-cb-ink-faint mt-0.5 text-xs">
                  Tiểu đội: {squad?.name ?? "Chưa cập nhật"}
                </div>
                <Chip mau="vang" className="mt-2">
                  <EmojiIcon glyph={rank.insignia} /> {rank.name}
                </Chip>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2 text-xs">
                <span className="text-cb-ink-dim font-semibold">
                  EXP <span className="text-cb-gold text-sm">{fmtNum(profile.exp)}</span>
                </span>
                <span className="text-cb-ink-faint">
                  Còn {fmtNum(progress.remaining)} → {progress.nextName}
                </span>
              </div>
              {progress.configIssue ? (
                <p className="text-cb-crimson text-xs">
                  <EmojiIcon glyph="⚠️" /> {progress.configIssue}
                </p>
              ) : (
                <ThanhTienDo pct={progress.pct} co="lon" soDoan={10} />
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="bg-cb-bg-2 ring-cb-line rounded-xl p-4 ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
                <div className="text-cb-gold cb-chu-noi text-2xl font-bold">{badgeCount ?? 0}</div>
                <div className="text-cb-ink-faint mt-1 text-xs font-semibold tracking-wide">
                  HUÂN CHƯƠNG
                </div>
              </div>
              <div className="bg-cb-bg-2 ring-cb-line rounded-xl p-4 ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
                <div className="text-cb-gold cb-chu-noi text-2xl font-bold">
                  {fmtNum(profile.season_points)}
                </div>
                <div className="text-cb-ink-faint mt-1 text-xs font-semibold tracking-wide">
                  ĐIỂM MÙA
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
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
                {/* Khối này gom cả Daily lẫn Bonus (đều là type `ngay`) nên
                    nói chung chung, không gọi tên riêng một loại. */}
                Hôm nay chưa có nhiệm vụ nào. Vào «Bảng nhiệm vụ» nhận thêm.
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
