import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { EmojiIcon } from "./emoji-icon";

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      rarity: {
        common: "border-cb-line text-cb-ink-dim bg-cb-panel-2",
        rare: "border-cb-blue/40 text-cb-blue bg-cb-blue/10",
        epic: "border-cb-purple/40 text-cb-purple bg-cb-purple/10",
        legendary: "border-cb-gold/50 text-cb-gold bg-cb-gold/10",
      },
      locked: {
        true: "opacity-40 grayscale",
        false: "",
      },
    },
    defaultVariants: { rarity: "common", locked: false },
  },
);

interface HuyHieuProps extends VariantProps<typeof badgeVariants> {
  icon: string | null;
  name: string;
  description?: string | null;
  className?: string;
}

// Thay cho .badge.r-{rarity}.locked trong css/styles.css cũ.
export function HuyHieu({ icon, name, description, rarity, locked, className }: HuyHieuProps) {
  return (
    <span
      className={cn(badgeVariants({ rarity, locked }), className)}
      title={description ?? undefined}
    >
      <EmojiIcon glyph={icon} />
      {name}
    </span>
  );
}
