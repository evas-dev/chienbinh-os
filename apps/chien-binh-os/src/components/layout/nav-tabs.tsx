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
    <nav className="border-cb-line border-b">
      {/* Mobile: cuộn ngang 1 hàng (tránh nav cao 7 hàng). Desktop: xuống hàng bình thường. */}
      <div className="scrollbar-none mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 py-2.5 sm:px-6 lg:flex-wrap lg:overflow-x-visible lg:px-8">
        {items.map((item) => {
          const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
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
      </div>
    </nav>
  );
}
