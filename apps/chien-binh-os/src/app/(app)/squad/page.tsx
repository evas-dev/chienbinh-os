import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { rankOf } from "@/lib/ranks";
import { fmtNum } from "@/lib/format";
import { AnhDaiDien } from "@/components/chung/anh-dai-dien";
import { Chip } from "@/components/chung/chip";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import {
  QuanLyTieuDoiButton,
  type NguoiTrongDoi,
} from "@/components/squads/quan-ly-tieu-doi-button";
import type { Tables } from "@/types/database";

type Warrior = Tables<"profiles">;

const FRONTS: { key: Tables<"squads">["front"]; icon: string; label: string }[] = [
  { key: "tien_tuyen", icon: "⚔️", label: "TIỀN TUYẾN — Marketing · Sale" },
  { key: "hau_phuong", icon: "🛡", label: "HẬU PHƯƠNG — Kế toán · Dev · CSKH" },
];

function WarriorRow({
  warrior,
  tag,
  ranks,
}: {
  warrior: Warrior;
  tag?: string;
  ranks: Tables<"ranks">[];
}) {
  return (
    <div className="border-cb-line-soft flex items-center gap-3 border-b py-2.5 last:border-none">
      <AnhDaiDien id={warrior.id} ten={warrior.name} className="size-11" canhPx={44} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <span className="truncate">{warrior.name}</span>
          {tag ? (
            <Chip mau="lam" className="shrink-0">
              {tag}
            </Chip>
          ) : null}
        </div>
        <div className="text-cb-ink-faint truncate text-xs">
          {warrior.dept} · {rankOf(warrior.exp, ranks).name}
        </div>
      </div>
      <div className="text-cb-gold shrink-0 text-sm font-semibold">{fmtNum(warrior.exp)} EXP</div>
    </div>
  );
}

export default async function SquadPage() {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh"]);

  const supabase = await createClient();
  const [
    { data: squads, error: squadsError },
    { data: members, error: membersError },
    { data: ranks },
    { data: allProfiles, error: profilesError },
  ] = await Promise.all([
    supabase.from("squads").select("*").order("id"),
    supabase.from("squad_members").select("squad_id, warrior_id"),
    supabase.from("ranks").select("*"),
    // Người đã ngưng không còn nằm trong biên chế: không hiện ở danh sách đội,
    // không tính vào quân số / tổng EXP. Bản ghi squad_members vẫn giữ nguyên
    // nên kích hoạt lại là họ trở về đúng đội cũ.
    supabase.from("profiles").select("*").eq("active", true),
  ]);

  // SQU-11.2: lỗi tải dữ liệu tổ chức phải hiển thị rõ là lỗi, không được lặng
  // lẽ coi như rỗng rồi vẫn tính quân số/tổng EXP = 0 như dữ liệu thật.
  if (squadsError || membersError || profilesError) {
    return (
      <div className="bg-cb-panel-2 border-cb-line rounded-lg border p-4 text-sm">
        <p className="text-cb-crimson font-medium">Không tải được dữ liệu tổ chức.</p>
        <p className="text-cb-ink-dim mt-1">
          Vui lòng thử tải lại trang. Quân số hiển thị có thể sai nếu tiếp tục xem lúc này.
        </p>
      </div>
    );
  }

  const profileById = new Map((allProfiles ?? []).map((p) => [p.id, p]));

  // Ai đang thuộc một tiểu đội nào đó — gộp cả chức chỉ huy (bảng squads) lẫn
  // thành viên thường (bảng squad_members), vì hai nguồn này tách rời nhau.
  const daCoDoi = new Set<string>();
  for (const s of squads ?? []) {
    if (s.leader_id) daCoDoi.add(s.leader_id);
    if (s.deputy_id) daCoDoi.add(s.deputy_id);
  }
  for (const m of members ?? []) daCoDoi.add(m.warrior_id);
  const chuaVaoDoi = (allProfiles ?? []).filter(
    (p) => p.role !== "tong_tu_lenh" && !daCoDoi.has(p.id),
  );

  const membersBySquad = new Map<string, Warrior[]>();
  for (const m of members ?? []) {
    const p = profileById.get(m.warrior_id);
    if (!p) continue;
    membersBySquad.set(m.squad_id, [...(membersBySquad.get(m.squad_id) ?? []), p]);
  }

  return (
    <div className="space-y-8">
      <p className="bg-cb-panel-2 border-cb-line rounded-lg border p-3.5 text-sm leading-relaxed">
        Cơ cấu tổ đội: 1 <b>tiểu đội trưởng</b> + 1 <b>tiểu đội phó</b> + <b>không giới hạn</b> số
        thành viên. Điểm đội gộp từ EXP thành viên → thi đua ở <b>Bảng xếp hạng · Cấp 2</b>, tạo áp
        lực đồng đội (chống mất đoàn kết).
      </p>

      {FRONTS.map((front) => {
        const frontSquads = (squads ?? []).filter((s) => s.front === front.key);
        return (
          <section key={front.key}>
            <h2 className="font-heading text-cb-gold-soft mb-3 flex items-center gap-1.5 text-lg font-extrabold tracking-wide uppercase">
              <EmojiIcon glyph={front.icon} /> {front.label}
            </h2>
            {frontSquads.length === 0 ? (
              // SQU-11.1: mặt trận chưa có tiểu đội phải hiện trạng thái trống rõ
              // ràng, không được lặng lẽ biến mất khỏi trang khiến hiểu nhầm là lỗi.
              <p className="text-cb-ink-dim bg-cb-panel-2 border-cb-line rounded-lg border p-3 text-sm">
                Mặt trận này chưa có tiểu đội nào.
              </p>
            ) : (
              <div className="grid items-start gap-4 md:grid-cols-2">
                {frontSquads.map((s) => {
                  const leader = s.leader_id ? profileById.get(s.leader_id) : undefined;
                  const deputy = s.deputy_id ? profileById.get(s.deputy_id) : undefined;
                  const rest = membersBySquad.get(s.id) ?? [];
                  const all = [leader, deputy, ...rest].filter((w): w is Warrior => Boolean(w));
                  const totalExp = all.reduce((sum, w) => sum + w.exp, 0);

                  return (
                    <Card key={s.id}>
                      <CardContent>
                        <TieuDeMuc
                          icon="🛡"
                          action={
                            <QuanLyTieuDoiButton
                              squadId={s.id}
                              tenDoi={s.name}
                              thanhVien={[
                                ...(leader ? [{ ...leader, chuc: "leader" as const }] : []),
                                ...(deputy ? [{ ...deputy, chuc: "deputy" as const }] : []),
                                ...rest.map((m) => ({ ...m, chuc: "member" as const })),
                              ].map((n): NguoiTrongDoi => ({
                                id: n.id,
                                name: n.name,
                                dept: n.dept,
                                chuc: n.chuc,
                              }))}
                              nguoiChuaVaoDoi={chuaVaoDoi
                                .filter((p) => p.front === s.front)
                                .map((p) => ({ id: p.id, name: p.name, dept: p.dept }))}
                            />
                          }
                        >
                          {s.name}
                        </TieuDeMuc>
                        {leader ? (
                          <WarriorRow warrior={leader} tag="Đội trưởng" ranks={ranks ?? []} />
                        ) : null}
                        {deputy ? (
                          <WarriorRow warrior={deputy} tag="Đội phó" ranks={ranks ?? []} />
                        ) : null}
                        {rest.map((m) => (
                          <WarriorRow key={m.id} warrior={m} ranks={ranks ?? []} />
                        ))}
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="bg-cb-panel-2 rounded-lg p-2">
                            <div className="font-bold">{all.length}</div>
                            <div className="text-cb-ink-faint text-xs">QUÂN SỐ</div>
                          </div>
                          <div className="bg-cb-panel-2 rounded-lg p-2">
                            <div className="font-bold">{fmtNum(totalExp)}</div>
                            <div className="text-cb-ink-faint text-xs">TỔNG EXP</div>
                          </div>
                          <div className="bg-cb-panel-2 rounded-lg p-2">
                            <div className="font-bold">
                              {fmtNum(all.length ? Math.round(totalExp / all.length) : 0)}
                            </div>
                            <div className="text-cb-ink-faint text-xs">TB / NGƯỜI</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
