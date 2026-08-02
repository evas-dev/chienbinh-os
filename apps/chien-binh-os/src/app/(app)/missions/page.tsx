import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { QuestBoard } from "@/components/missions/quest-board";
import { MissionCard } from "@/components/missions/mission-card";
import { ReviewPanel } from "@/components/missions/review-panel";
import { CreateMissionButton } from "@/components/missions/create-mission-button";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";

export default async function MissionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();

  if (profile.role === "chien_sy") {
    const [{ data: missions }, { data: leaderboard }, { data: rejectedSubs }, { data: completedSubs }] =
      await Promise.all([
        supabase.from("missions").select("*").eq("assignee_id", profile.id),
        supabase
          .from("profiles")
          .select("id, name, season_points")
          .neq("role", "tong_tu_lenh")
          .order("season_points", { ascending: false })
          .limit(10),
        supabase
          .from("submissions")
          .select("mission_ref, reject_reason, reviewed_at")
          .eq("submitter_id", profile.id)
          .eq("status", "tu_choi")
          .order("reviewed_at", { ascending: false }),
        supabase
          .from("submissions")
          .select("*")
          .eq("submitter_id", profile.id)
          .eq("status", "da_duyet")
          .order("reviewed_at", { ascending: false })
          .limit(20),
      ]);

    // Với mỗi nhiệm vụ, chỉ giữ lý do từ chối MỚI NHẤT (dòng đầu tiên vì đã order desc)
    const rejectReasonByMission = new Map<string, string>();
    for (const s of rejectedSubs ?? []) {
      if (s.mission_ref && s.reject_reason && !rejectReasonByMission.has(s.mission_ref)) {
        rejectReasonByMission.set(s.mission_ref, s.reject_reason);
      }
    }

    return (
      <QuestBoard
        missions={missions ?? []}
        leaderboard={leaderboard ?? []}
        meId={profile.id}
        rejectReasonByMission={rejectReasonByMission}
        completedSubmissions={completedSubs ?? []}
      />
    );
  }

  // tu_lenh / tong_tu_lenh: nhiệm vụ của mình + panel duyệt + nút tạo
  const isCeo = profile.role === "tong_tu_lenh";

  let campaignsQuery = supabase.from("missions").select("id, title").eq("type", "chien_dich");
  if (!isCeo) campaignsQuery = campaignsQuery.eq("assignee_id", profile.id);

  const [{ data: myMissions }, { data: pendingSubs }, { data: recentSubs }, { data: targets }, { data: campaigns }] =
    await Promise.all([
      supabase.from("missions").select("*").eq("assignee_id", profile.id),
      supabase
        .from("submissions")
        .select("*")
        .eq("assigner_id", profile.id)
        .eq("status", "cho_duyet")
        .order("created_at", { ascending: false }),
      supabase
        .from("submissions")
        .select("*")
        .eq("assigner_id", profile.id)
        .neq("status", "cho_duyet")
        .order("reviewed_at", { ascending: false })
        .limit(15),
      isCeo
        ? supabase.from("profiles").select("id, name, role, dept").eq("role", "tu_lenh")
        : supabase
            .from("profiles")
            .select("id, name, role, dept")
            .eq("role", "chien_sy")
            .eq("front", profile.front ?? "tien_tuyen"),
      campaignsQuery,
    ]);

  // hiển thị tên submitter: join thủ công qua 1 query profiles
  const submitterIds = [
    ...new Set([...(pendingSubs ?? []), ...(recentSubs ?? [])].map((s) => s.submitter_id).filter(Boolean)),
  ] as string[];
  const { data: submitterProfiles } =
    submitterIds.length > 0
      ? await supabase.from("profiles").select("id, name").in("id", submitterIds)
      : { data: [] };
  const nameById = new Map((submitterProfiles ?? []).map((p) => [p.id, p.name]));
  const withNames = (subs: typeof pendingSubs) =>
    (subs ?? []).map((s) => ({ ...s, submitter_name: s.submitter_id ? nameById.get(s.submitter_id) : undefined }));

  return (
    <div>
      <div className="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="bg-cb-panel-2 border-cb-line sm:flex-1 rounded-lg border p-3.5 text-sm leading-relaxed">
          <EmojiIcon glyph="💡" /> Luồng: <b>Tổng Tư Lệnh</b> mở chiến dịch → giao <b>Tư Lệnh</b> → Tư Lệnh chia nhỏ cho{" "}
          <b>Chiến Sỹ</b> → Chiến Sỹ nộp → Tư Lệnh duyệt.
        </p>
        <CreateMissionButton
          label={
            isCeo ? (
              <span className="flex items-center gap-1">
                <EmojiIcon glyph="➕" /> Mở chiến dịch
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <EmojiIcon glyph="➕" /> Tạo nhiệm vụ
              </span>
            )
          }
          dialogTitle={isCeo ? "Mở chiến dịch" : "Tạo nhiệm vụ cho lính"}
          isCampaign={isCeo}
          targets={(targets ?? []).map((t) => ({ id: t.id, name: t.name, role: t.role, dept: t.dept }))}
          campaigns={campaigns ?? []}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div>
          <ReviewPanel pending={withNames(pendingSubs)} recent={withNames(recentSubs)} />
        </div>
        <Card className="h-fit">
          <CardContent>
            <TieuDeMuc icon="🎯">Nhiệm vụ của tôi ({(myMissions ?? []).length})</TieuDeMuc>
            {(myMissions ?? []).length ? (
              (myMissions ?? []).map((m) => <MissionCard key={m.id} mission={m} />)
            ) : (
              <p className="text-cb-ink-dim text-sm">Chưa có nhiệm vụ nào được giao.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
