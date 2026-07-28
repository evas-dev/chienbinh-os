import { Card, CardContent } from "@/components/ui/card";
import { fmtDateTime } from "@/lib/format";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import type { Tables } from "@/types/database";

type Submission = Tables<"submissions">;

export function CompletedHistory({ submissions }: { submissions: Submission[] }) {
  if (!submissions.length) return null;

  return (
    <Card className="bg-cb-panel border-cb-line mt-4">
      <CardContent>
        <TieuDeMuc icon="✅">Công việc đã hoàn thành ({submissions.length})</TieuDeMuc>
        <div>
          {submissions.map((s) => (
            <div key={s.id} className="border-cb-line-soft flex items-center justify-between gap-3 border-b py-3.5 last:border-none">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.mission_title}</div>
                <div className="text-cb-ink-faint text-xs">
                  {s.reviewed_at ? fmtDateTime(s.reviewed_at) : "—"}
                </div>
              </div>
              <span className="text-cb-gold shrink-0 text-sm font-semibold">
                +{s.exp_granted ?? 0} EXP
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
