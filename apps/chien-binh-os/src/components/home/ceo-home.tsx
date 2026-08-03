import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtNum, fmtVnd } from "@/lib/format";
import { weightedProgress, weightedRaw, PREV_PERIOD } from "@/lib/objectives";
import { CreateStaffButton } from "@/components/admin/create-staff-button";
import { Card, CardContent } from "@/components/ui/card";
import { ThanhTienDo } from "@/components/chung/thanh-tien-do";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { Chip } from "@/components/chung/chip";
import { cn } from "@/lib/utils";

function deptStatus(raw: number) {
  if (raw >= 100) return { label: "Vượt/Đạt", mau: "xanh" as const };
  if (raw >= 80) return { label: "Sắp đạt", mau: "xam" as const };
  if (raw >= 60) return { label: "Đang chạy", mau: "lam" as const };
  return { label: "Chậm tiến độ", mau: "do" as const };
}

export async function CeoHome() {
  const supabase = await createClient();
  const [{ data: objectives, error: objectivesError }, { data: squads }] = await Promise.all([
    supabase
      .from("objectives")
      .select(
        "id, owner_id, profiles!objectives_owner_id_fkey(name, dept, active), objective_items(*)",
      ),
    supabase.from("squads").select("id, name"),
  ]);

  // Bỏ KPI của người đã ngưng: mục tiêu bỏ dở của họ đứng yên mãi nên vừa kéo
  // tụt % hoàn thành toàn công ty, vừa đẻ ra cảnh báo "chậm tiến độ" không ai
  // xử lý được.
  const dangLam = (o: { profiles: { active: boolean } | { active: boolean }[] | null }) => {
    const owner = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
    return owner?.active ?? false;
  };
  const objs = (objectives ?? []).filter(dangLam);
  const findMetric = (name: string) => {
    for (const o of objs) {
      const item = o.objective_items.find((it) => it.metric.includes(name));
      if (item) return item;
    }
    return null;
  };
  const doanhSo = findMetric("Doanh số");
  const khMoi = findMetric("Khách hàng mới");
  const lead = findMetric("Lead");
  const congNo = findMetric("Công nợ");
  const csat = findMetric("CSAT");

  const completion = objs.length
    ? Math.round(objs.reduce((s, o) => s + weightedProgress(o.objective_items), 0) / objs.length)
    : 0;

  const alerts: { ok: boolean; text: string }[] = [];
  if (doanhSo) {
    alerts.push({
      ok: doanhSo.current >= PREV_PERIOD.revenue,
      text: `Doanh số ${fmtVnd(doanhSo.current)} so cùng kỳ`,
    });
  }
  if (khMoi) {
    alerts.push({
      ok: khMoi.current >= PREV_PERIOD.newCustomers,
      text: `Khách hàng mới ${fmtNum(khMoi.current)} so cùng kỳ`,
    });
  }
  for (const o of objs) {
    const raw = weightedRaw(o.objective_items);
    if (raw < 60) {
      const owner = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
      alerts.push({ ok: false, text: `${owner?.name} (${owner?.dept}) chậm tiến độ — mới ${raw}% trọng số` });
    }
  }
  const warnCount = alerts.filter((a) => !a.ok).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-heading flex items-center gap-1.5 text-xl tracking-wide">
            <EmojiIcon glyph="📊" /> BÁO CÁO TỔNG QUAN CÔNG TY
          </div>
          <div className="text-cb-ink-dim text-sm">Tổng hợp KPI cuối của cấp quản lý</div>
        </div>
        <CreateStaffButton squads={squads ?? []} />
      </div>

      {objectivesError ? (
        // Lỗi truy vấn phải khác trạng thái "không có mục tiêu nào" (CMD-05,
        // CMD-09) — báo rõ và cho cách thử lại, thay vì âm thầm hiển thị 0%/—.
        <p className="border-cb-crimson/40 bg-cb-crimson/10 text-cb-crimson rounded-lg border p-3.5 text-sm leading-relaxed">
          Không tải được dữ liệu mục tiêu công ty, vui lòng thử lại.{" "}
          <Link href="/" className="underline">
            Thử lại
          </Link>
        </p>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="bg-cb-bg-2 ring-cb-line rounded-xl p-4 text-center ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
              <div className="text-xl font-bold">{doanhSo ? fmtVnd(doanhSo.current) : "—"}</div>
              <div className="text-cb-ink-faint mt-1 text-xs tracking-wide">
                DOANH SỐ {doanhSo ? `(${Math.round((doanhSo.current / doanhSo.target) * 100)}%)` : ""}
              </div>
            </div>
            <div className="bg-cb-bg-2 ring-cb-line rounded-xl p-4 text-center ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
              <div className="text-xl font-bold">{khMoi ? fmtNum(khMoi.current) : "—"}</div>
              <div className="text-cb-ink-faint mt-1 text-xs tracking-wide">KHÁCH HÀNG MỚI</div>
            </div>
            <div className="bg-cb-bg-2 ring-cb-line rounded-xl p-4 text-center ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
              <div className="text-xl font-bold">{completion}%</div>
              <div className="text-cb-ink-faint mt-1 text-xs tracking-wide">HOÀN THÀNH MỤC TIÊU</div>
            </div>
            <div className="bg-cb-bg-2 ring-cb-line rounded-xl p-4 text-center ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
              <div className={`text-xl font-bold ${warnCount ? "text-red-400" : "text-green-400"}`}>
                {warnCount}
              </div>
              <div className="text-cb-ink-faint mt-1 text-xs tracking-wide">CẢNH BÁO</div>
            </div>
          </div>

          {/* items-start: thẻ ngắn không bị kéo cao bằng cột đối diện (tránh khoảng trắng chết). */}
          <div className="grid items-start gap-4 md:grid-cols-2">
            <Card>
              <CardContent>
                <TieuDeMuc icon="🎖">Tiến độ trọng số theo phòng ban</TieuDeMuc>
                {objs.map((o) => {
                  const owner = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
                  const raw = weightedRaw(o.objective_items);
                  const st = deptStatus(raw);
                  return (
                    <div key={o.id} className="border-cb-line-soft border-b py-3 last:border-none">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <b className="text-sm">
                          {owner?.name} · {owner?.dept}
                        </b>
                        <Chip mau={st.mau} className="shrink-0">
                          {st.label} · {raw}%
                        </Chip>
                      </div>
                      <ThanhTienDo pct={Math.min(100, raw)} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent>
                  <TieuDeMuc icon="📈">Chỉ số khách hàng &amp; tài chính</TieuDeMuc>
                  {[
                    ["Doanh số tháng", doanhSo],
                    ["Khách hàng mới", khMoi],
                    ["Lead tiềm năng", lead],
                    ["Công nợ thu hồi", congNo],
                    ["CSAT hài lòng", csat],
                  ].map(([label, m]) =>
                    m ? (
                      <div
                        key={label as string}
                        className="border-cb-line-soft flex justify-between gap-3 border-b py-2.5 text-sm last:border-none"
                      >
                        <span className="text-cb-ink-dim">{label as string}</span>
                        <b>
                          {(m as { unit: string | null; current: number; target: number }).unit === "₫"
                            ? fmtVnd((m as { current: number }).current)
                            : `${fmtNum((m as { current: number }).current)} ${(m as { unit: string | null }).unit}`}{" "}
                          / {(m as { unit: string | null; target: number }).unit === "₫" ? fmtVnd((m as { target: number }).target) : fmtNum((m as { target: number }).target)}
                        </b>
                      </div>
                    ) : null,
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <TieuDeMuc icon="🚨">Cảnh báo so với cùng kỳ</TieuDeMuc>
                  {alerts.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 py-2 text-sm">
                      <EmojiIcon
                        glyph={a.ok ? "✅" : "⚠️"}
                        className={cn("mt-0.5", a.ok ? "text-green-400" : "text-cb-crimson")}
                      />
                      <span>{a.text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
