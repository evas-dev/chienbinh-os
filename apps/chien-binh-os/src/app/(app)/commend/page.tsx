import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { CommendRow } from "@/components/commend/commend-row";
import { ProposeCommendButton } from "@/components/commend/propose-commend-button";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";

export default async function CommendPage() {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh", "tu_lenh"]);
  if (!profile) return null;

  const isCeo = profile.role === "tong_tu_lenh";
  const supabase = await createClient();

  let query = supabase
    .from("commendations")
    .select(
      "id, status, reason, badge_code, revoked_at, revoke_reason, staff:profiles!commendations_staff_id_fkey(name, dept), proposer:profiles!commendations_proposed_by_fkey(name), badges(name, icon)",
    )
    .order("created_at", { ascending: false });
  if (!isCeo) query = query.eq("proposed_by", profile.id);
  const { data: commendations, error: commendationsError } = await query;

  const { data: staff, error: staffError } = isCeo
    ? { data: [], error: null }
    : await supabase
        .from("profiles")
        .select("id, name, dept")
        .eq("role", "chien_sy")
        .eq("front", profile.front ?? "tien_tuyen");
  const { data: badges, error: badgesError } = await supabase
    .from("badges")
    .select("code, name, icon")
    .order("code");

  // REW-11 AC2: lỗi tải dữ liệu phải hiển thị khác với "chưa có dữ liệu".
  const loadError = commendationsError || staffError || badgesError;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="bg-cb-panel-2 border-cb-line min-w-0 flex-1 rounded-lg border p-3.5 text-sm">
          {isCeo ? (
            <>
              <EmojiIcon glyph="🏆" /> CEO duyệt đề xuất khen thưởng cuối tháng — trao huân chương cho nhân sự xuất sắc.
            </>
          ) : (
            <>
              <EmojiIcon glyph="🏆" /> Đề xuất nhân sự xuất sắc để CEO duyệt trao huân chương.
            </>
          )}
        </p>
        {!isCeo ? <ProposeCommendButton staff={staff ?? []} badges={badges ?? []} /> : null}
      </div>

      <Card>
        <CardContent>
          <TieuDeMuc icon="🏆">
            {isCeo ? "Danh sách đề xuất khen thưởng" : "Đề xuất của tôi"}
          </TieuDeMuc>
          {loadError ? (
            <p className="text-cb-crimson flex items-center gap-1 text-sm">
              <EmojiIcon glyph="⚠️" /> Không tải được dữ liệu khen thưởng. Vui lòng thử lại sau.
            </p>
          ) : (commendations ?? []).length === 0 ? (
            <p className="text-cb-ink-dim text-sm">
              {isCeo
                ? "Chưa có đề xuất nào."
                : "Chưa đề xuất khen ai. Cuối tháng hãy đề xuất nhân sự xuất sắc để CEO duyệt."}
            </p>
          ) : (
            (commendations ?? []).map((c) => {
              const staffP = Array.isArray(c.staff) ? c.staff[0] : c.staff;
              const proposer = Array.isArray(c.proposer) ? c.proposer[0] : c.proposer;
              const badge = Array.isArray(c.badges) ? c.badges[0] : c.badges;
              return (
                <CommendRow
                  key={c.id}
                  id={c.id}
                  status={c.status ?? "cho_duyet"}
                  staffName={staffP?.name ?? "—"}
                  staffDept={staffP?.dept ?? null}
                  proposedByName={proposer?.name ?? null}
                  badgeIcon={badge?.icon ?? null}
                  badgeName={badge?.name ?? "—"}
                  reason={c.reason}
                  canApprove={isCeo}
                  revokedAt={c.revoked_at}
                  revokeReason={c.revoke_reason}
                />
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
