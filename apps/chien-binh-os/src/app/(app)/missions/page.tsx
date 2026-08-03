import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { QuestBoard } from "@/components/missions/quest-board";
import { MissionCard } from "@/components/missions/mission-card";
import { ReviewPanel } from "@/components/missions/review-panel";
import { CreateMissionButton } from "@/components/missions/create-mission-button";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { TaoLichLapButton } from "@/components/missions/tao-lich-lap-button";
import { DongLichLap } from "@/components/missions/dong-lich-lap";

export default async function MissionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();

  if (profile.role === "chien_sy") {
    const [
      { data: missions },
      { data: leaderboard },
      { data: rejectedSubs },
      { data: completedSubs },
    ] = await Promise.all([
      supabase.from("missions").select("*").eq("assignee_id", profile.id),
      supabase
        .from("profiles")
        .select("id, name, season_points")
        .neq("role", "tong_tu_lenh")
        .eq("active", true)
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

  const [
    { data: myMissions },
    { data: assignedMissions },
    { data: lichLap },
    { data: pendingSubs },
    { data: recentSubs },
    { data: targets },
    { data: campaigns },
  ] = await Promise.all([
    supabase.from("missions").select("*").eq("assignee_id", profile.id),
    // Việc MÌNH ĐÃ GIAO cho người khác. Trước đây không có chỗ nào xem lại:
    // giao xong là nhiệm vụ biến mất khỏi tầm mắt cho tới khi có người nộp
    // kết quả, nên giao nhầm người hay nhầm chỉ tiêu thì không cách nào biết.
    supabase
      .from("missions")
      .select("*")
      .eq("assigner_id", profile.id)
      .neq("assignee_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
    // Lịch lặp mình đã đặt — mỗi dòng là một người nhận.
    supabase
      .from("recurring_missions")
      .select("*")
      .eq("assigner_id", profile.id)
      .order("created_at", { ascending: false }),
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
    // Chỉ người ĐANG hoạt động mới hiện trong ô chọn: giao việc cho tài khoản
    // đã ngưng thì RPC `create_mission` cũng chặn, để tên trong danh sách chỉ
    // tổ nhầm lẫn.
    isCeo
      ? supabase
          .from("profiles")
          .select("id, name, role, dept")
          .eq("role", "tu_lenh")
          .eq("active", true)
      : supabase
          .from("profiles")
          .select("id, name, role, dept")
          .eq("role", "chien_sy")
          .eq("active", true)
          .eq("front", profile.front ?? "tien_tuyen"),
    campaignsQuery,
  ]);

  // Tên người: join thủ công qua MỘT query cho cả người nộp lẫn người được
  // giao việc — gộp id lại để không phải gọi hai lần.
  const canTenIds = [
    ...new Set(
      [
        ...[...(pendingSubs ?? []), ...(recentSubs ?? [])].map((s) => s.submitter_id),
        ...(assignedMissions ?? []).map((m) => m.assignee_id),
        ...(lichLap ?? []).map((l) => l.assignee_id),
      ].filter(Boolean),
    ),
  ] as string[];
  const { data: submitterProfiles } =
    canTenIds.length > 0
      ? await supabase.from("profiles").select("id, name").in("id", canTenIds)
      : { data: [] };
  const nameById = new Map((submitterProfiles ?? []).map((p) => [p.id, p.name]));
  const daGiao = assignedMissions ?? [];
  const demTheoTrangThai = {
    todo: daGiao.filter((m) => m.status === "todo").length,
    doing: daGiao.filter((m) => m.status === "doing").length,
    review: daGiao.filter((m) => m.status === "review").length,
    done: daGiao.filter((m) => m.status === "done").length,
  };

  const withNames = (subs: typeof pendingSubs) =>
    (subs ?? []).map((s) => ({
      ...s,
      submitter_name: s.submitter_id ? nameById.get(s.submitter_id) : undefined,
    }));

  return (
    <div>
      <div className="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="bg-cb-panel-2 border-cb-line sm:flex-1 rounded-lg border p-3.5 text-sm leading-relaxed">
          <EmojiIcon glyph="💡" /> Luồng: <b>Tổng Tư Lệnh</b> mở chiến dịch → giao <b>Tư Lệnh</b> →
          Tư Lệnh chia nhỏ cho <b>Chiến Sỹ</b> → Chiến Sỹ nộp → Tư Lệnh duyệt.
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
          targets={(targets ?? []).map((t) => ({
            id: t.id,
            name: t.name,
            role: t.role,
            dept: t.dept,
          }))}
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

      <Card className="mt-4">
        <CardContent>
          <TieuDeMuc
            icon="🔄"
            hint="Tự tạo nhiệm vụ mới vào đầu mỗi ngày đã chọn"
            action={
              <TaoLichLapButton
                nguoiNhan={(targets ?? []).map((t) => ({
                  id: t.id,
                  name: t.name,
                  dept: t.dept,
                }))}
              />
            }
          >
            Nhiệm vụ lặp ({(lichLap ?? []).length})
          </TieuDeMuc>
          {(lichLap ?? []).length === 0 ? (
            <p className="text-cb-ink-dim text-sm">
              Chưa có lịch nào. Đặt lịch để khỏi phải giao lại mỗi sáng.
            </p>
          ) : (
            (lichLap ?? []).map((l) => (
              <DongLichLap
                key={l.id}
                id={l.id}
                title={l.title}
                target={Number(l.target)}
                unit={l.unit}
                exp={l.exp}
                weekdays={l.weekdays}
                active={l.active}
                tenNguoiNhan={nameById.get(l.assignee_id) ?? "—"}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent>
          <TieuDeMuc
            icon="📤"
            hint={
              daGiao.length > 0 ? (
                <>
                  {demTheoTrangThai.todo} chưa nhận · {demTheoTrangThai.doing} đang làm ·{" "}
                  {demTheoTrangThai.review} chờ duyệt · {demTheoTrangThai.done} xong
                </>
              ) : null
            }
          >
            Việc tôi đã giao ({daGiao.length})
          </TieuDeMuc>
          {daGiao.length === 0 ? (
            <p className="text-cb-ink-dim text-sm">
              Bạn chưa giao việc cho ai. Bấm «{isCeo ? "Mở chiến dịch" : "Tạo nhiệm vụ"}» ở trên.
            </p>
          ) : (
            daGiao.map((m) => (
              <MissionCard
                key={m.id}
                mission={m}
                assigneeName={(m.assignee_id ? nameById.get(m.assignee_id) : undefined) ?? "—"}
                chiXem
                choPhepXoa
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
