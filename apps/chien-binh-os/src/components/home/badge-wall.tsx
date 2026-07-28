import { createClient } from "@/lib/supabase/server";
import { HuyHieu, type BadgeRarity } from "@/components/chung/huy-hieu";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export async function BadgeWall({ warriorId }: { warriorId: string }) {
  const supabase = await createClient();
  const [{ data: badges }, { data: owned }] = await Promise.all([
    supabase.from("badges").select("*").order("code"),
    supabase.from("warrior_badges").select("badge_code").eq("warrior_id", warriorId),
  ]);
  const ownedCodes = new Set((owned ?? []).map((o) => o.badge_code));

  return (
    <Card className="bg-cb-panel border-cb-line">
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center gap-1.5 font-semibold">
          <EmojiIcon glyph="🏅" />
          Kho huân chương (đổi ra tiền đào tạo / phần thưởng)
        </div>
        <div className="flex flex-wrap gap-2">
          {(badges ?? []).map((b) => (
            <HuyHieu
              key={b.code}
              icon={b.icon}
              name={b.name}
              description={b.description}
              rarity={(b.rarity ?? "common") as BadgeRarity}
              locked={!ownedCodes.has(b.code)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
