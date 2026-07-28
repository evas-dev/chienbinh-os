import { createClient } from "@/lib/supabase/server";
import { HuyHieu, type BadgeRarity } from "@/components/chung/huy-hieu";
import { Card, CardContent } from "@/components/ui/card";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";

export async function BadgeWall({ warriorId }: { warriorId: string }) {
  const supabase = await createClient();
  const [{ data: badges }, { data: owned }] = await Promise.all([
    supabase.from("badges").select("*").order("code"),
    supabase.from("warrior_badges").select("badge_code").eq("warrior_id", warriorId),
  ]);
  const ownedCodes = new Set((owned ?? []).map((o) => o.badge_code));

  return (
    <Card className="bg-cb-panel border-cb-line">
      <CardContent>
        <TieuDeMuc
          icon="🏅"
          hint={`Đã đạt ${ownedCodes.size}/${(badges ?? []).length} — đổi ra tiền đào tạo / phần thưởng`}
        >
          Kho huân chương
        </TieuDeMuc>
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
