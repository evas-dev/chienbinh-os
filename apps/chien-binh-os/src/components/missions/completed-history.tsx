import { Card, CardContent } from "@/components/ui/card";
import { fmtDateTime } from "@/lib/format";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import type { Tables } from "@/types/database";

type Submission = Tables<"submissions">;

export function CompletedHistory({ submissions }: { submissions: Submission[] }) {
  if (!submissions.length) return null;

  return (
    <Card className="bg-cb-panel border-cb-line mt-4">
      <CardContent className="pt-6">
        <div className="mb-2 flex items-center gap-1.5 font-semibold">
          <EmojiIcon glyph="✅" /> Công việc đã hoàn thành ({submissions.length})
        </div>
        <div className="space-y-2">
          {submissions.map((s) => (
            <div key={s.id} className="border-cb-line-soft flex items-center justify-between gap-3 border-b py-2 last:border-none">
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
