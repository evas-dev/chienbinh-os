import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";

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
  const { data: feed, error } = await supabase
    .from("feed")
    .select("id, icon, text, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    // Giới hạn bề rộng cho dễ đọc — dòng nhật ký ngắn, trải hết 1200px sẽ rất loãng.
    <Card className="bg-cb-panel border-cb-line max-w-3xl">
      <CardContent>
        <TieuDeMuc icon="📣" hint="50 hoạt động gần nhất của toàn đội">
          Nhật ký chiến công
        </TieuDeMuc>
        <div className="divide-cb-line-soft divide-y">
          {error ? (
            // FEE-01 AC3: lỗi tải dữ liệu phải khác trạng thái "chưa có hoạt động".
            <p className="text-cb-crimson py-4 text-sm" role="alert">
              Không tải được nhật ký chiến công. Vui lòng thử lại.
            </p>
          ) : (feed ?? []).length === 0 ? (
            <p className="text-cb-ink-dim py-4 text-sm">Chưa có hoạt động nào.</p>
          ) : (
            (feed ?? []).map((f) => (
              <div key={f.id} className="flex items-start gap-3 py-3">
                <EmojiIcon glyph={f.icon} className="text-cb-gold-soft mt-0.5" />
                <div className="min-w-0">
                  {/* FEE-02: text feed có thể chứa lý do do người dùng nhập
                      (VD: lý do từ chối/thu hồi kết quả) — không tin cậy
                      HTML lưu sẵn trong DB. Render dạng text thuần để React
                      tự escape, tránh stored XSS thay vì dangerouslySetInnerHTML. */}
                  <div className="text-sm leading-relaxed">{f.text}</div>
                  <div className="text-cb-ink-faint mt-1 text-xs">
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
