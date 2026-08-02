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

  // Vạch ngăn đặt trước mục tra cứu đầu tiên, tách nhóm "thao tác hàng ngày"
  // khỏi nhóm "chỉ để xem".
  const moNhomPhu = items.findIndex((i) => i.nhomPhu);

  return (
    <nav className="border-cb-line border-b">
      {/*
        Mobile: cuộn ngang 1 hàng trong khung nav (không đẩy cả trang cuộn theo).
        Desktop: cho xuống hàng. 14 mục cần 1547px mà khung chỉ rộng 1216–1280px,
        nên ép 1 hàng thì các mục cuối bị khuất sau vùng cuộn KHÔNG có thanh
        scrollbar — người dùng không biết là còn mục. Xuống 2 hàng thì thấy hết,
        và nhãn ngắn + chip sát đã kéo nav từ 91px xuống ~65px.
      */}
      <div className="scrollbar-none mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6 lg:flex-wrap lg:overflow-x-visible lg:px-8">
        {items.map((item, i) => {
          const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
          return (
            <div key={item.path} className="contents">
              {i === moNhomPhu && moNhomPhu > 0 ? (
                <span aria-hidden className="bg-cb-line mx-1 h-4 w-px shrink-0" />
              ) : null}
              <Link
                href={item.path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] whitespace-nowrap transition-colors",
                  active
                    ? "bg-cb-gold text-cb-bg font-semibold"
                    : "text-cb-ink-dim hover:bg-cb-panel-2 hover:text-cb-ink",
                )}
              >
                <EmojiIcon glyph={item.icon} />
                {item.label}
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
