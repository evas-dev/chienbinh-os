import { Card, CardContent } from "@/components/ui/card";
import { ThanhTienDo } from "@/components/chung/thanh-tien-do";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { weightedProgress, fmtTargetVal } from "@/lib/objectives";
import type { Tables } from "@/types/database";

type Item = Tables<"objective_items">;

export function ObjectiveCard({
  ownerName,
  ownerDept,
  items,
  actions,
}: {
  ownerName: string;
  ownerDept: string | null;
  items: Item[];
  actions?: React.ReactNode;
}) {
  const overall = items.length ? weightedProgress(items) : 0;
  return (
    <Card className="bg-cb-panel border-cb-line">
      <CardContent>
        <TieuDeMuc icon="🎯">
          {ownerName} · {ownerDept}
        </TieuDeMuc>
        <div className="mb-4">
          <div className="text-cb-ink-dim mb-1 flex justify-between text-xs">
            <span>Hoàn thành mục tiêu (có trọng số)</span>
            <span>{overall}%</span>
          </div>
          <ThanhTienDo pct={overall} />
        </div>
        <div>
          {items.length === 0 ? (
            <p className="text-cb-ink-dim text-sm">Chưa có chỉ tiêu nào.</p>
          ) : (
            items.map((it) => {
              const pct = it.target ? Math.min(100, Math.round((it.current / it.target) * 100)) : 0;
              return (
                <div key={it.id} className="border-cb-line-soft border-b py-3.5 first:pt-0 last:border-none last:pb-0">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <b className="text-sm">{it.metric}</b>
                    <span className="bg-cb-panel-2 text-cb-ink-dim rounded-full px-2 py-0.5 text-xs">
                      Trọng số {it.weight}%
                    </span>
                  </div>
                  <ThanhTienDo pct={pct} />
                  <div className="text-cb-ink-faint mt-1.5 flex justify-between text-xs">
                    <span>
                      {fmtTargetVal(it.current, it.unit ?? "")} / {fmtTargetVal(it.target, it.unit ?? "")}
                    </span>
                    <span>{pct}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}
