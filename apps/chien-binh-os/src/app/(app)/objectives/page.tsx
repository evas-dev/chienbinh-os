import Link from "next/link";
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
import { khoaTuan } from "@/lib/tuan";

export default async function ObjectivesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();

  if (profile.role === "tong_tu_lenh") {
    const tuanNay = khoaTuan();

    // Liệt kê theo NGƯỜI chứ không theo hồ sơ mục tiêu. Trước đây trang chỉ đọc
    // bảng objectives nên Tư Lệnh chưa từng được giao KPI không hiện thẻ nào —
    // và không có thẻ thì không có nút "Giao thêm KPI", tức là người mới tạo bị
    // kẹt vĩnh viễn, không cách nào giao mục tiêu qua giao diện.
    const [{ data: quanLy }, { data: objTuanNay }, { data: allStaff }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, name, dept")
        .eq("role", "tu_lenh")
        .eq("active", true)
        .order("dept"),
      // Chỉ lấy mục tiêu của TUẦN NÀY: chu kỳ đã là tuần nên thẻ phải phản ánh
      // tuần đang chạy, không kéo số liệu tuần cũ sang.
      supabase
        .from("objectives")
        .select("id, owner_id, objective_items(*)")
        .eq("week_start", tuanNay),
      supabase
        .from("profiles")
        .select("id, name, role, dept")
        .eq("role", "chien_sy")
        .eq("active", true),
    ]);

    const mucTieuTheoNguoi = new Map(
      (objTuanNay ?? []).filter((o) => o.owner_id).map((o) => [o.owner_id as string, o]),
    );

    return (
      <div>
        <div className="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="bg-cb-panel-2 border-cb-line sm:flex-1 rounded-lg border p-3.5 text-sm leading-relaxed">
            <EmojiIcon glyph="👑" /> <b>Cấp CEO:</b> giao mục tiêu KPI cho trưởng phòng, hoặc{" "}
            <b>giao việc thẳng cho nhân sự</b> không qua quản lý.
          </p>
          <CreateMissionButton
            label={
              <span className="flex items-center gap-1">
                <EmojiIcon glyph="➕" /> Giao việc trực tiếp cho nhân sự
              </span>
            }
            dialogTitle="Giao việc trực tiếp cho nhân sự"
            isCampaign={false}
            targets={(allStaff ?? []).map((s) => ({
              id: s.id,
              name: s.name,
              role: s.role,
              dept: s.dept,
            }))}
            campaigns={[]}
          />
        </div>
        {(quanLy ?? []).length === 0 ? (
          <Card>
            <CardContent className="text-cb-ink-dim text-sm">
              Chưa có Tư Lệnh nào để giao mục tiêu. Tạo tài khoản cấp Tư Lệnh ở{" "}
              <Link href="/admin" className="underline">
                Quản trị nhân sự
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="grid items-start gap-4 md:grid-cols-2">
            {(quanLy ?? []).map((ql) => (
              <ObjectiveCard
                key={ql.id}
                ownerName={ql.name}
                ownerDept={ql.dept}
                items={mucTieuTheoNguoi.get(ql.id)?.objective_items ?? []}
                actions={<AssignObjectiveButton ownerId={ql.id} ownerName={ql.name} />}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (profile.role === "tu_lenh") {
    // Lấy mục tiêu MỚI NHẤT của mình, không khớp cứng tuần hiện tại — tránh
    // trang trống trơn vào đầu tuần khi CEO chưa kịp giao KPI tuần mới.
    const { data: objectiveRows, error: objectiveError } = await supabase
      .from("objectives")
      .select("objective_items(*)")
      .eq("owner_id", profile.id)
      .order("week_start", { ascending: false })
      .limit(1);
    const objective = objectiveRows?.[0] ?? null;

    const { data: soldiers } = await supabase
      .from("profiles")
      .select("id, name, role, dept")
      .eq("role", "chien_sy")
      .eq("active", true)
      .eq("front", profile.front ?? "tien_tuyen");

    return (
      <div>
        <p className="bg-cb-panel-2 border-cb-line mb-5 rounded-lg border p-3.5 text-sm leading-relaxed">
          <EmojiIcon glyph="🎖" /> <b>Cấp Quản lý:</b> đây là mục tiêu CEO giao cho anh/chị. Bấm mẫu
          bên dưới để giao chỉ tiêu cụ thể cho lính.
        </p>
        {objectiveError ? (
          // KPI-12: lỗi tải dữ liệu phải khác trạng thái "chưa có KPI" — không
          // được để CEO/quản lý hiểu nhầm là mình chưa được giao mục tiêu.
          <Card className="border-cb-crimson/40 bg-cb-crimson/10">
            <CardContent className="text-cb-crimson text-sm leading-relaxed">
              Không tải được dữ liệu mục tiêu, vui lòng thử lại.{" "}
              <Link href="/objectives" className="underline">
                Thử lại
              </Link>
            </CardContent>
          </Card>
        ) : objective ? (
          <ObjectiveCard
            ownerName={profile.name}
            ownerDept={profile.dept}
            items={objective.objective_items}
          />
        ) : (
          <Card>
            <CardContent className="text-cb-ink-dim text-sm">
              Chưa được CEO giao mục tiêu nào.
            </CardContent>
          </Card>
        )}

        <Card className="mt-4">
          <CardContent>
            <TieuDeMuc
              icon="⚡"
              hint="Chọn mẫu nhiệm vụ để giao nhanh cho lính, hoặc tạo tùy chỉnh."
            >
              Bẻ mục tiêu thành nhiệm vụ Daily
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
                targets={(soldiers ?? []).map((s) => ({
                  id: s.id,
                  name: s.name,
                  role: s.role,
                  dept: s.dept,
                }))}
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

  let objective: {
    objective_items: {
      id: string;
      current: number;
      target: number;
      weight: number;
      metric: string;
      unit: string | null;
      metric_key: string | null;
      objective_id: string | null;
    }[];
  } | null = null;
  let leaderName = "";
  let leaderDept: string | null = null;
  let objectiveError: unknown = null;
  if (leaderId) {
    const [{ data: leader }, { data: objRows, error }] = await Promise.all([
      supabase.from("profiles").select("name, dept").eq("id", leaderId).single(),
      supabase
        .from("objectives")
        .select("objective_items(*)")
        .eq("owner_id", leaderId)
        .order("week_start", { ascending: false })
        .limit(1),
    ]);
    leaderName = leader?.name ?? "";
    leaderDept = leader?.dept ?? null;
    objective = objRows?.[0] ?? null;
    objectiveError = error;
  }

  return (
    <div>
      <p className="bg-cb-panel-2 border-cb-line mb-5 rounded-lg border p-3.5 text-sm leading-relaxed">
        <EmojiIcon glyph="⚔️" /> <b>Cấp Chiến sỹ:</b> đây là mục tiêu của quản lý trực tiếp — nhiệm
        vụ Daily của bạn góp phần hoàn thành nó.
      </p>
      {objectiveError ? (
        <Card className="border-cb-crimson/40 bg-cb-crimson/10">
          <CardContent className="text-cb-crimson text-sm leading-relaxed">
            Không tải được dữ liệu mục tiêu, vui lòng thử lại.{" "}
            <Link href="/objectives" className="underline">
              Thử lại
            </Link>
          </CardContent>
        </Card>
      ) : objective ? (
        <ObjectiveCard
          ownerName={leaderName}
          ownerDept={leaderDept}
          items={objective.objective_items}
        />
      ) : (
        <Card>
          <CardContent className="text-cb-ink-dim text-sm">Đội chưa có mục tiêu.</CardContent>
        </Card>
      )}
    </div>
  );
}
