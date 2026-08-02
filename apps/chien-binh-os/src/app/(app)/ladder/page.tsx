import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HuyHieu } from "@/components/chung/huy-hieu";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
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
    <div className="space-y-4">
      {/* Thang quân hàm trải ngang + chia cột để 18 bậc không tạo cột quá cao,
          để lại khoảng trắng lớn bên cạnh như layout 2 cột trước đây. */}
      <Card>
        <CardContent>
          <TieuDeMuc icon="🎖" hint={`Bậc hiện tại của bạn: ${fmtNum(profile.exp)} EXP`}>
            Thang quân hàm
          </TieuDeMuc>
          <div className="gap-x-6 sm:columns-2 xl:columns-3">
            {[...(ranks ?? [])].reverse().map((r) => {
              const passed = r.ord < currentOrd;
              const current = r.ord === currentOrd;
              return (
                <div
                  key={r.id}
                  className={cn(
                    "mb-1 flex break-inside-avoid items-center gap-3 rounded-lg px-3 py-2",
                    current
                      ? "bg-cb-gold/10 border-cb-gold/40 border"
                      : passed && "opacity-60",
                  )}
                >
                  <span className="text-cb-gold w-14 shrink-0 text-center text-sm leading-none whitespace-nowrap">
                    {r.insignia}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.name}</div>
                    <div className="text-cb-ink-faint text-xs">{fmtNum(r.min_exp)} EXP</div>
                  </div>
                  {current ? (
                    <span className="text-cb-gold shrink-0 text-xs font-semibold">Đang ở đây</span>
                  ) : passed ? (
                    <span className="text-cb-ink-faint shrink-0 text-xs">Đã qua</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <TieuDeMuc icon="🏅" hint="Thưởng theo kết quả — đổi ra tiền đào tạo, quà, nghỉ phép">
              Hệ thống huân chương
            </TieuDeMuc>
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

        <Card>
          <CardContent>
            <TieuDeMuc icon="🎁">Đổi huân chương lấy thưởng</TieuDeMuc>
            <div className="space-y-1.5">
              {(rewards ?? []).map((r) => (
                <div
                  key={r.id}
                  className="border-cb-line-soft flex items-center gap-2 border-b py-2 text-sm last:border-none"
                >
                  <EmojiIcon glyph={r.icon} className="text-cb-gold-soft" />
                  <span className="flex-1">{r.name}</span>
                  <span className="text-cb-ink-faint text-xs">{r.cost}</span>
                </div>
              ))}
            </div>
            <p className="text-cb-ink-dim border-cb-line mt-4 border-t pt-3 text-xs leading-relaxed">
              <b>Cấp bậc</b> = danh vọng (không tiêu được). <b>Huân chương</b> = đổi tiền đào
              tạo/quà/nghỉ phép. <b>EXP</b> = chia quỹ thưởng lớn cuối kỳ.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
