import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { xemDuocHoSo } from "@/lib/auth/quyen-xem-ho-so";
import { createClient } from "@/lib/supabase/server";
import { rankOf, expProgress } from "@/lib/ranks";
import { fmtNum, fmtDateTime } from "@/lib/format";
import { FRONT_LABEL, ROLE_LABEL } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { AnhDaiDien } from "@/components/chung/anh-dai-dien";
import { Chip } from "@/components/chung/chip";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { ThanhTienDo } from "@/components/chung/thanh-tien-do";
import { MissionCard } from "@/components/missions/mission-card";
import { BadgeWall } from "@/components/home/badge-wall";
import { PenaltyRecordCard } from "@/components/penalty/penalty-record-card";

/** Ô số liệu vuông, nền lõm — cùng khuôn với thẻ hồ sơ ở Sở chỉ huy. */
function OSo({ so, nhan }: { so: string; nhan: string }) {
  return (
    <div className="bg-cb-bg-2 ring-cb-line rounded-xl p-4 text-center ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
      <div className="text-cb-gold cb-chu-noi text-2xl font-bold">{so}</div>
      <div className="text-cb-ink-faint mt-1 text-xs font-semibold tracking-wide">{nhan}</div>
    </div>
  );
}

/**
 * Hồ sơ một nhân sự — CHỈ ĐỂ XEM, không sửa được gì.
 *
 * Trước đây danh sách Nhân sự / Tiểu đội / Bảng xếp hạng chỉ hiện được vài
 * trường rời rạc, bấm vào không ra gì; muốn biết một người có huy hiệu gì, dính
 * án phạt nào, đang ôm việc gì thì phải mò qua ba trang khác nhau.
 */
export default async function TrangHoSoNhanSu({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: nguoi } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!nguoi) notFound();

  // `profiles` mở cho mọi tài khoản đã đăng nhập ở tầng RLS nên chốt quyền phải
  // nằm ở đây. Không dùng notFound(): người bấm nhầm link cần biết là "không có
  // quyền" chứ không phải "người này không tồn tại".
  if (!xemDuocHoSo(profile, nguoi)) {
    return (
      <Card className="max-w-xl">
        <CardContent>
          <TieuDeMuc icon="🔒">Không xem được hồ sơ này</TieuDeMuc>
          <p className="text-cb-ink-dim text-sm leading-relaxed">
            Bạn chỉ xem được hồ sơ của chính mình
            {profile.role === "tu_lenh" ? " và của Chiến Sỹ trong mặt trận mình quản lý" : ""}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const laToi = profile.id === nguoi.id;
  const laCeo = profile.role === "tong_tu_lenh";

  const [
    { data: ranks },
    { count: soHuyHieu },
    { data: nhiemVu },
    { data: bienDongExp },
    { data: tieuDoi },
  ] = await Promise.all([
    supabase.from("ranks").select("*"),
    supabase
      .from("warrior_badges")
      .select("*", { count: "exact", head: true })
      .eq("warrior_id", nguoi.id),
    supabase
      .from("missions")
      .select("*")
      .eq("assignee_id", nguoi.id)
      .neq("status", "done")
      .order("deadline"),
    supabase
      .from("exp_log")
      .select("id, delta, season_delta, reason, created_at")
      .eq("warrior_id", nguoi.id)
      .order("created_at", { ascending: false })
      .limit(10),
    nguoi.squad_id
      ? supabase.from("squads").select("name").eq("id", nguoi.squad_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const quanHam = rankOf(nguoi.exp, ranks ?? []);
  const tienDo = expProgress(nguoi.exp, ranks ?? []);
  const viecDangLam = nhiemVu ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Chiến Sỹ không vào được /admin — trả họ về Sở chỉ huy thay vì một
            đường dẫn bấm xong bị chặn. */}
        <Link
          href={profile.role === "chien_sy" ? "/" : "/admin"}
          className="text-cb-ink-dim hover:text-cb-ink text-sm"
        >
          ← {profile.role === "chien_sy" ? "Về Sở chỉ huy" : "Về danh sách nhân sự"}
        </Link>
        {nguoi.active ? null : <Chip mau="do">Đã ngưng hoạt động</Chip>}
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <AnhDaiDien id={nguoi.id} ten={nguoi.name} className="size-20" canhPx={80} />
              <div className="min-w-0">
                <div className="font-heading text-lg leading-tight font-bold">
                  {nguoi.name}
                  {laToi ? <span className="text-cb-gold-soft text-sm"> · Bạn</span> : null}
                </div>
                <div className="text-cb-ink-dim mt-0.5 text-sm">
                  {nguoi.front ? FRONT_LABEL[nguoi.front] : "—"} · {nguoi.dept} ·{" "}
                  {ROLE_LABEL[nguoi.role]}
                </div>
                <div className="text-cb-ink-faint mt-0.5 text-xs">
                  Tiểu đội: {tieuDoi?.name ?? "Chưa có"}
                </div>
                {/* Số điện thoại là thông tin liên hệ, chỉ Tổng Tư Lệnh và chính
                    chủ thấy — khớp với danh sách Nhân sự vốn cũng chỉ CEO xem. */}
                {laCeo || laToi ? (
                  <div className="text-cb-ink-faint mt-0.5 flex items-center gap-1 text-xs">
                    <EmojiIcon glyph="📱" /> {nguoi.phone}
                  </div>
                ) : null}
                <Chip mau="vang" className="mt-2">
                  <EmojiIcon glyph={quanHam.insignia} /> {quanHam.name}
                </Chip>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2 text-xs">
                <span className="text-cb-ink-dim font-semibold">
                  EXP <span className="text-cb-gold text-sm">{fmtNum(nguoi.exp)}</span>
                </span>
                <span className="text-cb-ink-faint">
                  Còn {fmtNum(tienDo.remaining)} → {tienDo.nextName}
                </span>
              </div>
              {tienDo.configIssue ? (
                <p className="text-cb-crimson text-xs">
                  <EmojiIcon glyph="⚠️" /> {tienDo.configIssue}
                </p>
              ) : (
                <ThanhTienDo pct={tienDo.pct} co="lon" soDoan={10} />
              )}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <OSo so={String(soHuyHieu ?? 0)} nhan="HUÂN CHƯƠNG" />
              <OSo so={fmtNum(nguoi.season_points)} nhan="ĐIỂM MÙA" />
              <OSo so={String(viecDangLam.length)} nhan="VIỆC ĐANG LÀM" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TieuDeMuc icon="🎯" hint="Nhiệm vụ chưa hoàn thành, xếp theo hạn gần nhất">
              Việc đang làm ({viecDangLam.length})
            </TieuDeMuc>
            {viecDangLam.length === 0 ? (
              <p className="text-cb-ink-dim text-sm">Không có nhiệm vụ nào đang treo.</p>
            ) : (
              viecDangLam.map((m) => <MissionCard key={m.id} mission={m} chiXem />)
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <BadgeWall warriorId={nguoi.id} />
        <div className="space-y-4">
          <PenaltyRecordCard warriorId={nguoi.id} />
          <Card>
            <CardContent>
              <TieuDeMuc icon="📈" hint="10 bút toán gần nhất">
                Biến động EXP
              </TieuDeMuc>
              {(bienDongExp ?? []).length === 0 ? (
                <p className="text-cb-ink-dim text-sm">Chưa có biến động nào.</p>
              ) : (
                (bienDongExp ?? []).map((e) => (
                  <div
                    key={e.id}
                    className="border-cb-line-soft flex items-start justify-between gap-3 border-b py-2.5 last:border-none"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm">{e.reason}</div>
                      <div className="text-cb-ink-faint text-xs">
                        {e.created_at ? fmtDateTime(e.created_at) : "—"}
                      </div>
                    </div>
                    <div
                      className={`shrink-0 text-sm font-semibold ${
                        e.delta < 0 ? "text-cb-crimson" : "text-cb-green"
                      }`}
                    >
                      {e.delta > 0 ? "+" : ""}
                      {fmtNum(e.delta)} EXP
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
