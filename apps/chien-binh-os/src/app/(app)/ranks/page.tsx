import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { rankOf } from "@/lib/ranks";
import { fmtNum } from "@/lib/format";
import { FRONT_LABEL } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";

const SCOPES = [
  { key: "ca_nhan", label: "Cấp 1 · Cá nhân" },
  { key: "tieu_doi", label: "Cấp 2 · Tiểu đội" },
  { key: "mat_tran", label: "Cấp 3 · Mặt trận" },
] as const;

type Scope = (typeof SCOPES)[number]["key"];

function medal(rank: number) {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : String(rank);
}

function Row({
  rank,
  name,
  sub,
  pts,
  isMe,
}: {
  rank: number;
  name: string;
  sub: string;
  pts: number;
  isMe: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5",
        isMe && "bg-cb-gold/10 border-cb-gold/40 border",
        rank <= 3 && !isMe && "bg-cb-panel-2",
      )}
    >
      <div className="w-8 text-center text-lg">
        <EmojiIcon glyph={medal(rank)} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">
          {name}
          {isMe ? <span className="text-cb-gold-soft ml-1.5 text-xs">· Bạn</span> : null}
        </div>
        <div className="text-cb-ink-faint text-xs">{sub}</div>
      </div>
      <div className="text-right">
        <div className="text-cb-gold font-semibold">{fmtNum(pts)}</div>
        <div className="text-cb-ink-faint text-[10px]">ĐIỂM MÙA</div>
      </div>
    </div>
  );
}

export default async function RanksPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh", "tu_lenh"]);
  if (!profile) return null;

  const scope = ((await searchParams).scope ?? "ca_nhan") as Scope;

  const supabase = await createClient();
  const [{ data: warriors }, { data: ranks }, { data: squads }, { data: members }] =
    await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("ranks").select("*"),
      supabase.from("squads").select("*"),
      supabase.from("squad_members").select("squad_id, warrior_id"),
    ]);

  const profileById = new Map((warriors ?? []).map((w) => [w.id, w]));
  let rows: { name: string; sub: string; pts: number; isMe: boolean }[] = [];

  if (scope === "ca_nhan") {
    rows = (warriors ?? [])
      .filter((w) => w.role !== "tong_tu_lenh")
      .sort((a, b) => b.season_points - a.season_points)
      .map((w) => ({
        name: w.name,
        sub: `${w.front ? FRONT_LABEL[w.front] : "—"} · ${w.dept} · ${rankOf(w.exp, ranks ?? []).name}`,
        pts: w.season_points,
        isMe: w.id === profile.id,
      }));
  } else if (scope === "tieu_doi") {
    const membersBySquad = new Map<string, Tables<"profiles">[]>();
    for (const m of members ?? []) {
      const p = profileById.get(m.warrior_id);
      if (!p) continue;
      membersBySquad.set(m.squad_id, [...(membersBySquad.get(m.squad_id) ?? []), p]);
    }
    rows = (squads ?? [])
      .map((s) => {
        const leader = s.leader_id ? profileById.get(s.leader_id) : undefined;
        const deputy = s.deputy_id ? profileById.get(s.deputy_id) : undefined;
        const all = [leader, deputy, ...(membersBySquad.get(s.id) ?? [])].filter(
          (w): w is Tables<"profiles"> => Boolean(w),
        );
        const pts = all.reduce((sum, w) => sum + w.season_points, 0);
        return {
          name: s.name,
          sub: `${all.length} chiến binh · ĐT: ${leader?.name ?? "—"}`,
          pts,
          isMe: all.some((w) => w.id === profile.id),
        };
      })
      .sort((a, b) => b.pts - a.pts);
  } else {
    rows = (["tien_tuyen", "hau_phuong"] as const)
      .map((f) => {
        const group = (warriors ?? []).filter((w) => w.front === f);
        const pts = group.reduce((sum, w) => sum + w.season_points, 0);
        return {
          name: FRONT_LABEL[f],
          sub: `${group.length} chiến binh`,
          pts,
          isMe: profile.front === f,
        };
      })
      .sort((a, b) => b.pts - a.pts);
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {SCOPES.map((s) => (
          <Link
            key={s.key}
            href={`/ranks?scope=${s.key}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              scope === s.key ? "bg-cb-gold text-cb-bg font-semibold" : "bg-cb-panel-2 text-cb-ink-dim",
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>
      <p className="bg-cb-panel-2 border-cb-line mb-3 flex items-start gap-1.5 rounded-lg border p-3 text-sm">
        <EmojiIcon glyph="🔁" className="mt-0.5" />
        <span>
          <b>Điểm mùa</b> reset mỗi chiến dịch để ai cũng có cơ hội lật ngược. <b>EXP/Quân hàm</b>{" "}
          tích lũy trọn đời, không reset.
        </span>
      </p>
      <Card className="bg-cb-panel border-cb-line">
        <CardContent className="space-y-1 pt-6">
          {rows.map((r, i) => (
            <Row key={r.name} rank={i + 1} name={r.name} sub={r.sub} pts={r.pts} isMe={r.isMe} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
