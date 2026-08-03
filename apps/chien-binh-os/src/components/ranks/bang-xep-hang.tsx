import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { duongDanHoSo } from "@/lib/auth/quyen-xem-ho-so";
import { rankOf } from "@/lib/ranks";
import { fmtNum } from "@/lib/format";
import { FRONT_LABEL } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { AnhDaiDien } from "@/components/chung/anh-dai-dien";
import { Chip } from "@/components/chung/chip";
import { PILL_BASE, PILL_OFF, PILL_ON } from "@/lib/pill";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";

export const SCOPES = [
  { key: "ca_nhan", label: "Cấp 1 · Cá nhân" },
  { key: "tieu_doi", label: "Cấp 2 · Tiểu đội" },
  { key: "mat_tran", label: "Cấp 3 · Mặt trận" },
] as const;

export type Scope = (typeof SCOPES)[number]["key"];

export function laScope(v: string | undefined): Scope {
  return SCOPES.some((s) => s.key === v) ? (v as Scope) : "ca_nhan";
}

function medal(rank: number) {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : String(rank);
}

/** Một dòng xếp hạng. `avatarId` chỉ có ở cấp cá nhân — đội/mặt trận không có ảnh. */
function Row({
  rank,
  name,
  sub,
  pts,
  isMe,
  avatarId,
  href,
  chucVu,
}: {
  rank: number;
  name: string;
  sub: string;
  pts: number;
  isMe: boolean;
  avatarId?: string;
  /**
   * Link tới hồ sơ — chỉ có khi người xem được phép.
   *
   * Bảng này Tư Lệnh cũng xem được, mà họ chỉ mở được hồ sơ Chiến Sỹ cùng mặt
   * trận; hàng nào ngoài tầm thì để nguyên chữ, không bọc link.
   */
  href?: string | null;
  /**
   * Chức vụ hiển thị cạnh tên (Tư Lệnh, Đội trưởng, Đội phó).
   *
   * Chỉ gắn cho người CÓ chức, nhân viên thường để trống — gắn nhãn "Chiến Sỹ"
   * cho toàn bộ danh sách thì nhãn mất tác dụng phân biệt.
   */
  chucVu?: string;
}) {
  const than = (
    <>
      {avatarId ? <AnhDaiDien id={avatarId} ten={name} className="size-9" canhPx={36} /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-medium">
          <span className="truncate">{name}</span>
          {chucVu ? (
            <Chip mau="vang" className="shrink-0">
              {chucVu}
            </Chip>
          ) : null}
          {isMe ? <span className="text-cb-gold-soft text-xs">· Bạn</span> : null}
        </div>
        <div className="text-cb-ink-faint truncate text-xs">{sub}</div>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5",
        isMe && "bg-cb-gold/10 border-cb-gold/40 border",
        rank <= 3 && !isMe && "bg-cb-panel-2",
      )}
    >
      <div className="flex w-8 shrink-0 items-center justify-center text-sm font-semibold">
        <EmojiIcon glyph={medal(rank)} />
      </div>
      {href ? (
        <Link
          href={href}
          className="hover:text-cb-gold-soft flex min-w-0 flex-1 items-center gap-3 transition-colors"
        >
          {than}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{than}</div>
      )}
      <div className="shrink-0 text-right">
        <div className="text-cb-gold font-semibold">{fmtNum(pts)}</div>
        <div className="text-cb-ink-faint text-xs">ĐIỂM MÙA</div>
      </div>
    </div>
  );
}

/**
 * Bảng xếp hạng 3 cấp. Tách khỏi route `/ranks` cũ để nhúng được vào trang
 * Nhân sự — `basePath` quyết định link của các nút chọn cấp trỏ về đâu.
 */
export async function BangXepHang({
  profile,
  scope,
  basePath,
}: {
  profile: Tables<"profiles">;
  scope: Scope;
  /** Đường dẫn gốc cho nút chọn cấp, vd `/admin?xem=xep-hang`. */
  basePath: string;
}) {
  const supabase = await createClient();
  // Chỉ xếp hạng người ĐANG hoạt động. Lọc ngay ở truy vấn nên cả ba cấp đều
  // sạch: cấp tiểu đội và mặt trận cộng dồn điểm từ chính danh sách này, để sót
  // người đã ngưng là quân số lẫn tổng điểm đội đều sai.
  const [{ data: warriors }, { data: ranks }, { data: squads }, { data: members }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("active", true),
      supabase.from("ranks").select("*"),
      supabase.from("squads").select("*"),
      supabase.from("squad_members").select("squad_id, warrior_id"),
    ]);

  const profileById = new Map((warriors ?? []).map((w) => [w.id, w]));

  // Chức trong tiểu đội: tra ngược từ bảng squads vì profiles không lưu việc
  // ai là đội trưởng/đội phó.
  const chucTrongDoi = new Map<string, string>();
  for (const s of squads ?? []) {
    if (s.leader_id) chucTrongDoi.set(s.leader_id, "Đội trưởng");
    if (s.deputy_id) chucTrongDoi.set(s.deputy_id, "Đội phó");
  }
  /** Tư Lệnh là chức cao hơn nên ưu tiên hiện; hết mới xét chức trong tiểu đội. */
  function chucVuCua(w: Tables<"profiles">) {
    if (w.role === "tu_lenh") return "Tư Lệnh";
    return chucTrongDoi.get(w.id);
  }

  let rows: {
    name: string;
    sub: string;
    pts: number;
    isMe: boolean;
    avatarId?: string;
    href?: string | null;
    chucVu?: string;
  }[] = [];

  if (scope === "ca_nhan") {
    rows = (warriors ?? [])
      .filter((w) => w.role !== "tong_tu_lenh")
      .sort((a, b) => b.season_points - a.season_points)
      .map((w) => ({
        name: w.name,
        sub: `${w.front ? FRONT_LABEL[w.front] : "—"} · ${w.dept} · ${rankOf(w.exp, ranks ?? []).name}`,
        pts: w.season_points,
        isMe: w.id === profile.id,
        avatarId: w.id,
        href: duongDanHoSo(profile, w),
        chucVu: chucVuCua(w),
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

  const noi = basePath.includes("?") ? "&" : "?";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {SCOPES.map((s) => (
          <Link
            key={s.key}
            href={`${basePath}${noi}scope=${s.key}`}
            aria-current={scope === s.key ? "page" : undefined}
            className={cn(PILL_BASE, scope === s.key ? PILL_ON : PILL_OFF)}
          >
            {s.label}
          </Link>
        ))}
      </div>
      <p className="bg-cb-panel-2 border-cb-line mb-4 flex items-start gap-2 rounded-lg border p-3.5 text-sm leading-relaxed">
        <EmojiIcon glyph="🔁" className="text-cb-gold-soft mt-0.5" />
        <span>
          <b>Điểm mùa</b> reset mỗi chiến dịch để ai cũng có cơ hội lật ngược. <b>EXP/Quân hàm</b>{" "}
          tích lũy trọn đời, không reset.
        </span>
      </p>
      <Card>
        <CardContent className="space-y-1">
          {rows.length === 0 ? (
            <p className="text-cb-ink-dim text-sm">Chưa có dữ liệu xếp hạng.</p>
          ) : (
            rows.map((r, i) => (
              <Row
                key={r.name}
                rank={i + 1}
                name={r.name}
                sub={r.sub}
                pts={r.pts}
                isMe={r.isMe}
                avatarId={r.avatarId}
                href={r.href}
                chucVu={r.chucVu}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
