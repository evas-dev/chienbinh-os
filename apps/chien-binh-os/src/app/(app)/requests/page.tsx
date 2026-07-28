import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { CreateRequestButton } from "@/components/requests/create-request-button";
import { RequestRow } from "@/components/requests/request-row";
import { Card, CardContent } from "@/components/ui/card";
import { ROLE_LABEL } from "@/lib/nav";
import type { Enums } from "@/types/database";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";

export default async function RequestsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  // SUP-03: hạn mức tính theo tháng giờ Việt Nam (Asia/Ho_Chi_Minh), không
  // phải giờ server (thường là UTC) — khớp cách RPC create_support_request
  // tính ranh giới tháng, tránh lệch ~7 tiếng quanh nửa đêm 1 tây.
  const now = new Date();
  const vnParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const vnYear = Number(vnParts.find((p) => p.type === "year")?.value);
  const vnMonth = Number(vnParts.find((p) => p.type === "month")?.value);
  const monthStart = new Date(Date.UTC(vnYear, vnMonth - 1, 1) - 7 * 60 * 60 * 1000).toISOString();

  const [
    { data: mine, error: mineError },
    { data: incoming, error: incomingError },
    { data: managers },
    { data: peers },
    { count: usedThisMonth },
    { data: mySquadMember },
    { data: leaderSquad },
  ] = await Promise.all([
    supabase
      .from("support_requests")
      .select(
        "id, type, status, content, created_at, cancelled_at, target:profiles!support_requests_target_id_fkey(name, role)",
      )
      .eq("requester_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("support_requests")
      .select(
        "id, type, status, content, created_at, cancelled_at, requester:profiles!support_requests_requester_id_fkey(name, role)",
      )
      .eq("target_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, name, role, dept")
      .in("role", ["tu_lenh", "tong_tu_lenh"])
      .eq("active", true),
    supabase
      .from("profiles")
      .select("id, name, role, dept")
      .eq("role", "chien_sy")
      .eq("active", true)
      .neq("id", profile.id),
    supabase
      .from("support_requests")
      .select("id", { count: "exact", head: true })
      .eq("requester_id", profile.id)
      .gte("created_at", monthStart),
    supabase.from("squad_members").select("squad_id").eq("warrior_id", profile.id).maybeSingle(),
    supabase.from("squads").select("leader_id").or(`leader_id.eq.${profile.id},deputy_id.eq.${profile.id}`).maybeSingle(),
  ]);

  let defaultTargetId = leaderSquad?.leader_id ?? "";
  if (!defaultTargetId && mySquadMember) {
    const { data: squad } = await supabase
      .from("squads")
      .select("leader_id")
      .eq("id", mySquadMember.squad_id)
      .maybeSingle();
    defaultTargetId = squad?.leader_id ?? "";
  }
  // SUP-02: người nhận mặc định (lãnh đạo tiểu đội) có thể đã bị khoá —
  // trong trường hợp đó phải rơi về một quản lý đang hoạt động khác thay vì
  // giữ nguyên id không hợp lệ (form sẽ không chọn được người không có
  // trong danh sách quản lý active).
  const activeManagerIds = new Set((managers ?? []).map((m) => m.id));
  if (!defaultTargetId || !activeManagerIds.has(defaultTargetId)) {
    const { data: ceo } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "tong_tu_lenh")
      .eq("active", true)
      .maybeSingle();
    defaultTargetId = ceo?.id ?? (managers ?? [])[0]?.id ?? "";
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="bg-cb-panel-2 border-cb-line min-w-0 flex-1 rounded-lg border p-3.5 text-sm">
          <EmojiIcon glyph="🤝" /> Xin hỗ trợ từ quản lý/đồng đội, xin nghỉ phép, hoặc gửi đề xuất cần duyệt.
        </p>
        <CreateRequestButton
          managers={managers ?? []}
          peers={peers ?? []}
          defaultTargetId={defaultTargetId}
          usedThisMonth={usedThisMonth ?? 0}
        />
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Card className="bg-cb-panel border-cb-line">
          <CardContent>
            <TieuDeMuc icon="🗂">Yêu cầu của tôi</TieuDeMuc>
            {mineError ? (
              // SUP-04 AC3: lỗi truy vấn phải khác trạng thái "chưa có yêu cầu".
              <p className="text-cb-crimson text-sm" role="alert">
                Không tải được danh sách yêu cầu. Vui lòng thử lại.
              </p>
            ) : (mine ?? []).length === 0 ? (
              <p className="text-cb-ink-dim text-sm">Chưa có yêu cầu nào trong tháng.</p>
            ) : (
              (mine ?? []).map((r) => {
                const target = Array.isArray(r.target) ? r.target[0] : r.target;
                return (
                  <RequestRow
                    key={r.id}
                    id={r.id}
                    type={r.type}
                    status={r.status ?? "cho_duyet"}
                    otherPartyName={target?.name ?? "—"}
                    otherPartyRole={target ? ROLE_LABEL[target.role as Enums<"role_type">] : undefined}
                    content={r.content}
                    createdAt={r.created_at}
                    cancelledAt={r.cancelled_at}
                    mode="mine"
                  />
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="bg-cb-panel border-cb-line">
          <CardContent>
            <TieuDeMuc icon="📨">Yêu cầu cần tôi duyệt</TieuDeMuc>
            {incomingError ? (
              <p className="text-cb-crimson text-sm" role="alert">
                Không tải được danh sách yêu cầu. Vui lòng thử lại.
              </p>
            ) : (incoming ?? []).length === 0 ? (
              <p className="text-cb-ink-dim text-sm">Chưa có yêu cầu nào gửi tới bạn.</p>
            ) : (
              (incoming ?? []).map((r) => {
                const requester = Array.isArray(r.requester) ? r.requester[0] : r.requester;
                return (
                  <RequestRow
                    key={r.id}
                    id={r.id}
                    type={r.type}
                    status={r.status ?? "cho_duyet"}
                    otherPartyName={requester?.name ?? "—"}
                    otherPartyRole={requester ? ROLE_LABEL[requester.role as Enums<"role_type">] : undefined}
                    content={r.content}
                    createdAt={r.created_at}
                    cancelledAt={r.cancelled_at}
                    mode="incoming"
                  />
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
