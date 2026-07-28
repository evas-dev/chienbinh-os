import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HuyHieu } from "@/components/chung/huy-hieu";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import type { BadgeRarity } from "@/components/chung/huy-hieu";

export default async function LadderPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const [{ data: ranks }, { data: badges }, { data: rewards }] = await Promise.all([
    supabase.from("ranks").select("*").order("ord"),
    supabase.from("badges").select("*").order("code"),
    supabase.from("rewards").select("*"),
  ]);

  const currentOrd =
    [...(ranks ?? [])].reverse().find((r) => profile.exp >= r.min_exp)?.ord ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-cb-panel border-cb-line">
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center gap-1.5 font-semibold">
            <EmojiIcon glyph="🎖" />
            Thang quân hàm
          </div>
          <div className="space-y-1">
            {[...(ranks ?? [])].reverse().map((r) => {
              const passed = r.ord < currentOrd;
              const current = r.ord === currentOrd;
              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2",
                    current && "bg-cb-gold/10 border-cb-gold/40 border",
                  )}
                >
                  <span className="text-cb-gold w-10 text-center text-lg">{r.insignia}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-cb-ink-faint text-xs">{fmtNum(r.min_exp)} EXP</div>
                  </div>
                  {current ? (
                    <span className="text-cb-gold text-xs font-semibold">Đang ở đây</span>
                  ) : passed ? (
                    <span className="text-cb-ink-faint text-xs">Đã qua</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="🎖" />
              Hệ thống huân chương
            </div>
            <div className="flex flex-wrap gap-2">
              {(badges ?? []).map((b) => (
                <HuyHieu
                  key={b.code}
                  icon={b.icon}
                  name={b.name}
                  description={b.description}
                  rarity={(b.rarity ?? "common") as BadgeRarity}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cb-panel border-cb-line">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center gap-1.5 font-semibold">
              <EmojiIcon glyph="🎁" />
              Đổi huân chương lấy thưởng
            </div>
            <div className="flex flex-wrap gap-2">
              {(rewards ?? []).map((r) => (
                <span
                  key={r.id}
                  className="border-cb-line bg-cb-panel-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                >
                  <EmojiIcon glyph={r.icon} />
                  {r.name}
                  <span className="text-cb-ink-faint">· {r.cost}</span>
                </span>
              ))}
            </div>
            <p className="text-cb-ink-dim mt-3 text-xs">
              <b>Cấp bậc</b> = danh vọng (không tiêu được). <b>Huân chương</b> = đổi tiền đào
              tạo/quà/nghỉ phép. <b>EXP</b> = chia quỹ thưởng lớn cuối kỳ.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
