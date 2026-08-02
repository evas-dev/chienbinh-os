import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { rankOf } from "@/lib/ranks";
import { fmtNum, fmtVnd } from "@/lib/format";
import { FRONT_LABEL } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { BonusConfigForm } from "@/components/home/bonus-config-form";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { cn } from "@/lib/utils";

export default async function BonusPage() {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh"]);
  if (!profile) return null;

  const supabase = await createClient();
  const [{ data: warriors }, { data: ranks }, { data: config, error: configError }] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("ranks").select("*"),
    supabase.from("app_config").select("value").eq("key", "bonus_pool").single(),
  ]);

  // BON-01 AC3: cấu hình chưa tồn tại hoặc đọc lỗi phải báo lỗi rõ, không
  // được âm thầm hiển thị quỹ = 0 như thể đó là số liệu thật.
  if (configError || !config) {
    return (
      <Card className="max-w-xl">
        <CardContent>
          <p className="text-cb-crimson text-sm" role="alert">
            Không tải được cấu hình quỹ thưởng. Vui lòng thử lại hoặc kiểm tra lại cấu hình
            `bonus_pool`.
          </p>
        </CardContent>
      </Card>
    );
  }

  const bonus = config.value as { pool: number; months: number };
  const people = (warriors ?? []).filter((w) => w.role !== "tong_tu_lenh");
  const totalExp = people.reduce((sum, w) => sum + w.exp, 0);

  const rows = [...people]
    .sort((a, b) => b.exp - a.exp)
    .map((w) => {
      const pct = totalExp ? (w.exp / totalExp) * 100 : 0;
      const money = totalExp ? (w.exp / totalExp) * bonus.pool : 0;
      return { w, pct, money };
    });

  return (
    <div>
      <p className="bg-cb-panel-2 border-cb-line mb-4 flex items-start gap-1.5 rounded-lg border p-3 text-sm">
        <EmojiIcon glyph="💰" className="mt-0.5" />
        <span>
          Công thức: <b>Thưởng mỗi người = (EXP người đó ÷ Tổng EXP toàn đội) × Quỹ</b>. EXP
          tích trong kỳ {bonus.months} tháng; cấp bậc là danh vọng riêng, không ảnh hưởng số tiền.
        </span>
      </p>
      {/* Cột cấu hình hẹp bên trái, bảng chia thưởng rộng bên phải — items-start để
          thẻ cấu hình (ngắn) không bị kéo cao bằng bảng 11 người. */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Card>
          <CardContent>
            <TieuDeMuc icon="⚙️">Thiết lập quỹ (Tổng Tư Lệnh)</TieuDeMuc>
            <BonusConfigForm pool={bonus.pool} months={bonus.months} />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-cb-panel-2 rounded-xl p-3">
                <div className="font-bold">{fmtNum(totalExp)}</div>
                <div className="text-cb-ink-faint mt-1 text-xs">TỔNG EXP</div>
              </div>
              <div className="bg-cb-panel-2 rounded-xl p-3">
                <div className="font-bold">{people.length}</div>
                <div className="text-cb-ink-faint mt-1 text-xs">CHIẾN BINH</div>
              </div>
              <div className="bg-cb-panel-2 rounded-xl p-3">
                <div className="text-sm font-bold">{fmtVnd(bonus.pool)}</div>
                <div className="text-cb-ink-faint mt-1 text-xs">QUỸ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TieuDeMuc icon="🏆" hint={`Chia theo tỷ lệ EXP tích luỹ trong kỳ ${bonus.months} tháng`}>
              Bảng chia thưởng cuối kỳ
            </TieuDeMuc>
            {/* BON-04 AC3: nêu rõ quy tắc làm tròn — số tiền mỗi người được
                làm tròn tới đồng để hiển thị, phần chênh lệch làm tròn cộng
                dồn không vượt quá tổng quỹ. */}
            <p className="text-cb-ink-faint mb-2 text-xs">
              Số tiền mỗi người được làm tròn tới đồng gần nhất để hiển thị; tổng chênh lệch làm
              tròn không vượt quá tổng quỹ.
            </p>
            <div className="space-y-1">
              {rows.map(({ w, pct, money }) => (
                <div
                  key={w.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5",
                    w.id === profile.id && "bg-cb-gold/10 border-cb-gold/40 border",
                  )}
                >
                  <div className="text-cb-gold w-14 shrink-0 text-center text-sm leading-none whitespace-nowrap">
                    {rankOf(w.exp, ranks ?? []).insignia}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {w.name}
                      {w.id === profile.id ? (
                        <span className="text-cb-gold-soft ml-1.5 text-xs">· Bạn</span>
                      ) : null}
                    </div>
                    <div className="text-cb-ink-faint truncate text-xs">
                      {w.front ? FRONT_LABEL[w.front] : "—"} · {w.dept} ·{" "}
                      {rankOf(w.exp, ranks ?? []).name} · {fmtNum(w.exp)} EXP
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-cb-gold font-semibold">{fmtVnd(money)}</div>
                    <div className="text-cb-ink-faint text-xs">{pct.toFixed(1)}% QUỸ</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
