import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { ObjectiveCard } from "@/components/objectives/objective-card";
import { AssignObjectiveButton } from "@/components/objectives/assign-objective-button";
import { FixedTaskButton } from "@/components/objectives/fixed-task-button";
import { CreateMissionButton } from "@/components/missions/create-mission-button";
import { Card, CardContent } from "@/components/ui/card";
import { FIXED_TASKS } from "@/lib/objectives";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";

export default async function ObjectivesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();

  if (profile.role === "tong_tu_lenh") {
    const { data: objectives } = await supabase
      .from("objectives")
      .select("id, owner_id, profiles!objectives_owner_id_fkey(name, dept), objective_items(*)");
    const { data: allStaff } = await supabase
      .from("profiles")
      .select("id, name, role, dept")
      .eq("role", "chien_sy");

    return (
      <div>
        <div className="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="bg-cb-panel-2 border-cb-line sm:flex-1 rounded-lg border p-3.5 text-sm leading-relaxed">
            <EmojiIcon glyph="👑" /> <b>Cấp CEO:</b> giao mục tiêu KPI cho trưởng phòng, hoặc <b>giao việc thẳng cho nhân sự</b>{" "}
            không qua quản lý.
          </p>
          <CreateMissionButton
            label={
              <span className="flex items-center gap-1">
                <EmojiIcon glyph="➕" /> Giao việc trực tiếp cho nhân sự
              </span>
            }
            dialogTitle="Giao việc trực tiếp cho nhân sự"
            isCampaign={false}
            targets={(allStaff ?? []).map((s) => ({ id: s.id, name: s.name, role: s.role, dept: s.dept }))}
            campaigns={[]}
          />
        </div>
        <div className="grid items-start gap-4 md:grid-cols-2">
          {(objectives ?? []).map((o) => {
            const owner = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
            return (
              <ObjectiveCard
                key={o.id}
                ownerName={owner?.name ?? "—"}
                ownerDept={owner?.dept ?? null}
                items={o.objective_items}
                actions={<AssignObjectiveButton ownerId={o.owner_id!} ownerName={owner?.name ?? "—"} />}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (profile.role === "tu_lenh") {
    // Lấy mục tiêu MỚI NHẤT của mình, không khớp cứng tháng/năm hiện tại —
    // tránh lệch khi ngày thật trôi qua so với tháng gán lúc tạo mục tiêu.
    const { data: objectiveRows } = await supabase
      .from("objectives")
      .select("objective_items(*)")
      .eq("owner_id", profile.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(1);
    const objective = objectiveRows?.[0] ?? null;

    const { data: soldiers } = await supabase
      .from("profiles")
      .select("id, name, role, dept")
      .eq("role", "chien_sy")
      .eq("front", profile.front ?? "tien_tuyen");

    return (
      <div>
        <p className="bg-cb-panel-2 border-cb-line mb-5 rounded-lg border p-3.5 text-sm leading-relaxed">
          <EmojiIcon glyph="🎖" /> <b>Cấp Quản lý:</b> đây là mục tiêu CEO giao cho anh/chị. Bấm mẫu bên dưới để giao chỉ
          tiêu cụ thể cho lính.
        </p>
        {objective ? (
          <ObjectiveCard ownerName={profile.name} ownerDept={profile.dept} items={objective.objective_items} />
        ) : (
          <Card className="bg-cb-panel border-cb-line">
            <CardContent className="text-cb-ink-dim text-sm">
              Chưa được CEO giao mục tiêu nào.
            </CardContent>
          </Card>
        )}

        <Card className="bg-cb-panel border-cb-line mt-4">
          <CardContent>
            <TieuDeMuc icon="⚡" hint="Chọn mẫu nhiệm vụ để giao nhanh cho lính, hoặc tạo tùy chỉnh.">
              Bẻ mục tiêu thành nhiệm vụ ngày
            </TieuDeMuc>
            <div className="flex flex-wrap gap-2">
              {FIXED_TASKS.map((t) => (
                <FixedTaskButton
                  key={t.title}
                  template={t}
                  soldiers={(soldiers ?? []).map((s) => ({ id: s.id, name: s.name, dept: s.dept }))}
                />
              ))}
              <CreateMissionButton
                label={
                  <span className="flex items-center gap-1">
                    <EmojiIcon glyph="➕" /> Nhiệm vụ tùy chỉnh
                  </span>
                }
                dialogTitle="Tạo nhiệm vụ cho lính"
                isCampaign={false}
                targets={(soldiers ?? []).map((s) => ({ id: s.id, name: s.name, role: s.role, dept: s.dept }))}
                campaigns={[]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chiến sỹ: chỉ xem mục tiêu của quản lý trực tiếp (đội trưởng)
  const { data: mySquadMember } = await supabase
    .from("squad_members")
    .select("squad_id")
    .eq("warrior_id", profile.id)
    .maybeSingle();
  const { data: squadsAsLeaderOrDeputy } = await supabase
    .from("squads")
    .select("id, leader_id")
    .or(`leader_id.eq.${profile.id},deputy_id.eq.${profile.id}`)
    .maybeSingle();

  let leaderId: string | null = squadsAsLeaderOrDeputy?.leader_id ?? null;
  if (!leaderId && mySquadMember) {
    const { data: squad } = await supabase
      .from("squads")
      .select("leader_id")
      .eq("id", mySquadMember.squad_id)
      .maybeSingle();
    leaderId = squad?.leader_id ?? null;
  }

  let objective: { objective_items: { id: string; current: number; target: number; weight: number; metric: string; unit: string | null; metric_key: string | null; objective_id: string | null }[] } | null = null;
  let leaderName = "";
  let leaderDept: string | null = null;
  if (leaderId) {
    const [{ data: leader }, { data: objRows }] = await Promise.all([
      supabase.from("profiles").select("name, dept").eq("id", leaderId).single(),
      supabase
        .from("objectives")
        .select("objective_items(*)")
        .eq("owner_id", leaderId)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(1),
    ]);
    leaderName = leader?.name ?? "";
    leaderDept = leader?.dept ?? null;
    objective = objRows?.[0] ?? null;
  }

  return (
    <div>
      <p className="bg-cb-panel-2 border-cb-line mb-5 rounded-lg border p-3.5 text-sm leading-relaxed">
        <EmojiIcon glyph="⚔️" /> <b>Cấp Chiến sỹ:</b> đây là mục tiêu của quản lý trực tiếp — nhiệm vụ ngày của bạn góp
        phần hoàn thành nó.
      </p>
      {objective ? (
        <ObjectiveCard ownerName={leaderName} ownerDept={leaderDept} items={objective.objective_items} />
      ) : (
        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="text-cb-ink-dim text-sm">Đội chưa có mục tiêu.</CardContent>
        </Card>
      )}
    </div>
  );
}
