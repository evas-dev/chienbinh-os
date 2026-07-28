"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export function NavTabs({ role }: { role: Enums<"role_type"> }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <nav className="border-cb-line flex flex-wrap gap-1 border-b px-4 py-2">
      {items.map((item) => {
        const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
              active
                ? "bg-cb-gold text-cb-bg font-semibold"
                : "text-cb-ink-dim hover:bg-cb-panel-2 hover:text-cb-ink",
            )}
          >
            <EmojiIcon glyph={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
