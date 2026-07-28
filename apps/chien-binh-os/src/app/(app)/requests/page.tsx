import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { CreateRequestButton } from "@/components/requests/create-request-button";
import { RequestRow } from "@/components/requests/request-row";
import { Card, CardContent } from "@/components/ui/card";
import { ROLE_LABEL } from "@/lib/nav";
import type { Enums } from "@/types/database";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export default async function RequestsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: mine },
    { data: incoming },
    { data: managers },
    { data: peers },
    { count: usedThisMonth },
    { data: mySquadMember },
    { data: leaderSquad },
  ] = await Promise.all([
    supabase
      .from("support_requests")
      .select("id, type, status, content, created_at, target:profiles!support_requests_target_id_fkey(name, role)")
      .eq("requester_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("support_requests")
      .select("id, type, status, content, created_at, requester:profiles!support_requests_requester_id_fkey(name, role)")
      .eq("target_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, name, role, dept").in("role", ["tu_lenh", "tong_tu_lenh"]),
    supabase.from("profiles").select("id, name, role, dept").eq("role", "chien_sy").neq("id", profile.id),
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
  if (!defaultTargetId) {
    const { data: ceo } = await supabase.from("profiles").select("id").eq("role", "tong_tu_lenh").maybeSingle();
    defaultTargetId = ceo?.id ?? "";
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="bg-cb-panel-2 border-cb-line flex-1 rounded-lg border p-3 text-sm">
          <EmojiIcon glyph="🤝" /> Xin hỗ trợ từ quản lý/đồng đội, xin nghỉ phép, hoặc gửi đề xuất cần duyệt.
        </p>
        <CreateRequestButton
          managers={managers ?? []}
          peers={peers ?? []}
          defaultTargetId={defaultTargetId}
          usedThisMonth={usedThisMonth ?? 0}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="🗂" /> Yêu cầu của tôi
            </div>
            {(mine ?? []).length === 0 ? (
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
                    mode="mine"
                  />
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="📨" /> Yêu cầu cần tôi duyệt
            </div>
            {(incoming ?? []).length === 0 ? (
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
