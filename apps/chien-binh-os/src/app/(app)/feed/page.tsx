import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  return `${Math.floor(hr / 24)} ngày trước`;
}

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: feed } = await supabase
    .from("feed")
    .select("id, icon, text, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <Card className="bg-cb-panel border-cb-line">
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center gap-1.5 font-semibold">
          <EmojiIcon glyph="📣" />
          Nhật ký chiến công
        </div>
        <div className="divide-cb-line-soft divide-y">
          {(feed ?? []).length === 0 ? (
            <p className="text-cb-ink-dim py-4 text-sm">Chưa có hoạt động nào.</p>
          ) : (
            (feed ?? []).map((f) => (
              <div key={f.id} className="flex items-start gap-3 py-3">
                <EmojiIcon glyph={f.icon} className="mt-0.5" />
                <div>
                  <div
                    className="text-sm [&_b]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: f.text }}
                  />
                  <div className="text-cb-ink-faint mt-0.5 text-xs">
                    {f.created_at ? timeAgo(f.created_at) : ""}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
