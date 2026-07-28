import { Card, CardContent } from "@/components/ui/card";
import { MissionCard } from "./mission-card";
import { CompletedHistory } from "./completed-history";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { fmtNum } from "@/lib/format";
import type { Tables } from "@/types/database";

type Mission = Tables<"missions">;
type Submission = Tables<"submissions">;

function Category({
  icon,
  title,
  desc,
  missions,
  rejectReasonByMission,
}: {
  icon: string;
  title: string;
  desc: string;
  missions: Mission[];
  rejectReasonByMission: Map<string, string>;
}) {
  if (!missions.length) return null;
  return (
    <Card className="bg-cb-panel border-cb-line mb-4">
      <CardContent>
        <TieuDeMuc icon={icon} hint={desc}>
          {title}
        </TieuDeMuc>
        {missions.map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            rejectReason={m.status === "doing" ? rejectReasonByMission.get(m.id) : undefined}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function QuestBoard({
  missions,
  leaderboard,
  meId,
  rejectReasonByMission = new Map(),
  completedSubmissions = [],
}: {
  missions: Mission[];
  leaderboard: { id: string; name: string; season_points: number }[];
  meId: string;
  rejectReasonByMission?: Map<string, string>;
  completedSubmissions?: Submission[];
}) {
  const kpi = missions.filter((m) => m.type === "thang");
  const fixed = missions.filter((m) => m.type === "ngay" && m.fixed);
  const bonus = missions.filter((m) => m.type === "ngay" && !m.fixed);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <Category
          icon="🎖"
          title="Nhiệm vụ tháng — KPI"
          desc="Chỉ tiêu giao cứng, tính trên kết quả cuối tháng"
          missions={kpi}
          rejectReasonByMission={rejectReasonByMission}
        />
        <Category
          icon="📌"
          title="Nhiệm vụ cố định"
          desc="Lặp lại mỗi ngày — nhận & hoàn thành trước cuối ngày"
          missions={fixed}
          rejectReasonByMission={rejectReasonByMission}
        />
        <Category
          icon="⚔️"
          title="Nhiệm vụ ngày — Chinh phục"
          desc="Nhiệm vụ bổ sung để bứt phá, thưởng lớn hơn"
          missions={bonus}
          rejectReasonByMission={rejectReasonByMission}
        />
        {!missions.length ? (
          <Card className="bg-cb-panel border-cb-line">
            <CardContent className="text-cb-ink-dim text-sm">
              Chưa có nhiệm vụ nào. Chờ quản lý giao xuống nhé, chiến binh!
            </CardContent>
          </Card>
        ) : null}
        <CompletedHistory submissions={completedSubmissions} />
      </div>

      <Card className="bg-cb-panel border-cb-line h-fit">
        <CardContent>
          <TieuDeMuc icon="📊">Bảng xếp hạng mùa</TieuDeMuc>
          {leaderboard.map((w, i) => (
            <div
              key={w.id}
              className={`flex items-center gap-2 rounded-lg px-2 py-3 text-sm ${
                w.id === meId ? "bg-cb-gold/10 border-cb-gold/40 border" : ""
              }`}
            >
              <span className="flex w-6 items-center justify-center">
                {i === 0 ? (
                  <EmojiIcon glyph="🥇" />
                ) : i === 1 ? (
                  <EmojiIcon glyph="🥈" />
                ) : i === 2 ? (
                  <EmojiIcon glyph="🥉" />
                ) : (
                  i + 1
                )}
              </span>
              <span className="flex-1 truncate">
                {w.name}
                {w.id === meId ? " (Bạn)" : ""}
              </span>
              <span className="text-cb-gold font-semibold">{fmtNum(w.season_points)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
