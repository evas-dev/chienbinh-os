import { createClient } from "@/lib/supabase/server";
import { fmtNum, fmtVnd } from "@/lib/format";
import { weightedProgress, weightedRaw, PREV_PERIOD } from "@/lib/objectives";
import { CreateStaffButton } from "@/components/admin/create-staff-button";
import { Card, CardContent } from "@/components/ui/card";
import { ThanhTienDo } from "@/components/chung/thanh-tien-do";
import { EmojiIcon } from "@/components/chung/emoji-icon";

function deltaTag(cur: number, prev: number) {
  const d = prev ? Math.round(((cur - prev) / prev) * 100) : 0;
  const up = d >= 0;
  return (
    <span className={up ? "font-bold text-green-400" : "font-bold text-red-400"}>
      {up ? "▲" : "▼"} {Math.abs(d)}%
    </span>
  );
}

function deptStatus(raw: number) {
  if (raw >= 100) return { label: "Vượt/Đạt", cls: "bg-green-500/10 text-green-400" };
  if (raw >= 80) return { label: "Sắp đạt", cls: "bg-cb-panel-2 text-cb-ink-dim" };
  if (raw >= 60) return { label: "Đang chạy", cls: "bg-cb-blue/10 text-cb-blue" };
  return { label: "Chậm tiến độ", cls: "bg-cb-crimson/10 text-cb-crimson" };
}

export async function CeoHome() {
  const supabase = await createClient();
  const [{ data: objectives }, { data: squads }] = await Promise.all([
    supabase
      .from("objectives")
      .select("id, owner_id, profiles!objectives_owner_id_fkey(name, dept), objective_items(*)"),
    supabase.from("squads").select("id, name"),
  ]);

  const objs = objectives ?? [];
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
          <div className="flex items-center gap-1.5 text-xl font-bold">
            <EmojiIcon glyph="📊" /> BÁO CÁO TỔNG QUAN CÔNG TY
          </div>
          <div className="text-cb-ink-dim text-sm">Tổng hợp KPI cuối của cấp quản lý</div>
        </div>
        <CreateStaffButton squads={squads ?? []} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="bg-cb-panel border-cb-line rounded-lg border p-3 text-center">
          <div className="text-lg font-bold">{doanhSo ? fmtVnd(doanhSo.current) : "—"}</div>
          <div className="text-cb-ink-faint text-[11px]">
            DOANH SỐ {doanhSo ? `(${Math.round((doanhSo.current / doanhSo.target) * 100)}%)` : ""}
          </div>
        </div>
        <div className="bg-cb-panel border-cb-line rounded-lg border p-3 text-center">
          <div className="text-lg font-bold">{khMoi ? fmtNum(khMoi.current) : "—"}</div>
          <div className="text-cb-ink-faint text-[11px]">KHÁCH HÀNG MỚI</div>
        </div>
        <div className="bg-cb-panel border-cb-line rounded-lg border p-3 text-center">
          <div className="text-lg font-bold">{completion}%</div>
          <div className="text-cb-ink-faint text-[11px]">HOÀN THÀNH MỤC TIÊU CTY</div>
        </div>
        <div className="bg-cb-panel border-cb-line rounded-lg border p-3 text-center">
          <div className={`text-lg font-bold ${warnCount ? "text-red-400" : "text-green-400"}`}>
            {warnCount}
          </div>
          <div className="text-cb-ink-faint text-[11px]">CẢNH BÁO</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="🎖" /> Tiến độ trọng số theo phòng ban
            </div>
            {objs.map((o) => {
              const owner = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
              const raw = weightedRaw(o.objective_items);
              const st = deptStatus(raw);
              return (
                <div key={o.id} className="border-cb-line-soft border-b py-2 last:border-none">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <b className="text-sm">
                      {owner?.name} · {owner?.dept}
                    </b>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${st.cls}`}>
                      {st.label} · {raw}%
                    </span>
                  </div>
                  <ThanhTienDo pct={Math.min(100, raw)} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-cb-panel border-cb-line">
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center gap-1.5 font-semibold">
                <EmojiIcon glyph="📈" /> Chỉ số khách hàng & tài chính
              </div>
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
                    className="border-cb-line-soft flex justify-between border-b py-1.5 text-sm last:border-none"
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
          <Card className="bg-cb-panel border-cb-line">
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center gap-1.5 font-semibold">
                <EmojiIcon glyph="🚨" /> Cảnh báo so với cùng kỳ
              </div>
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 text-sm">
                  <EmojiIcon glyph={a.ok ? "✅" : "⚠️"} />
                  <span>{a.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
