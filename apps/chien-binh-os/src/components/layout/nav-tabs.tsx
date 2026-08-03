"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const VIEN_NAV =
  "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] whitespace-nowrap transition-colors";
const VIEN_BAT = "bg-cb-gold text-cb-bg font-semibold";
const VIEN_TAT = "text-cb-ink-dim hover:bg-cb-panel-2 hover:text-cb-ink";

export function NavTabs({ role }: { role: Enums<"role_type"> }) {
  const pathname = usePathname();
  const [moThem, setMoThem] = useState(false);

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const chinh = items.filter((i) => !i.nhomPhu);
  const phu = items.filter((i) => i.nhomPhu);

  const dangO = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));
  const dangOTrangPhu = phu.some((i) => dangO(i.path));

  return (
    <nav className="border-cb-line border-b">
      {/*
        Gom nhóm tra cứu vào một nút "Thêm" nên số mục hiện ra vừa một hàng ở mọi
        vai: Tổng Tư Lệnh 6, Tư Lệnh 5, Chiến Sỹ 4. Trước đây 13 mục trải phẳng
        phải xuống 2 hàng, ăn mất chiều dọc trước MỌI trang.
        Mobile vẫn cuộn ngang trong khung nav, không đẩy cả trang cuộn theo.
      */}
      <div className="scrollbar-none mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6 lg:overflow-x-visible lg:px-8">
        {chinh.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            aria-current={dangO(item.path) ? "page" : undefined}
            className={cn(VIEN_NAV, dangO(item.path) ? VIEN_BAT : VIEN_TAT)}
          >
            <EmojiIcon glyph={item.icon} />
            {item.label}
          </Link>
        ))}

        {phu.length > 0 ? (
          <>
            <span aria-hidden className="bg-cb-line mx-1 h-4 w-px shrink-0" />
            <Popover open={moThem} onOpenChange={setMoThem}>
              <PopoverTrigger
                // Sáng lên khi đang đứng ở một trang bên trong: nếu không thì
                // vào Cẩm nang xong nhìn thanh nav tưởng như chẳng ở đâu cả.
                className={cn(VIEN_NAV, dangOTrangPhu ? VIEN_BAT : VIEN_TAT, "outline-none")}
              >
                Thêm
                <ChevronDown className="size-3.5 stroke-[2.5]" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-2">
                {phu.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMoThem(false)}
                    aria-current={dangO(item.path) ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      dangO(item.path)
                        ? "bg-cb-gold text-cb-bg"
                        : "text-cb-ink-dim hover:bg-cb-panel-2 hover:text-cb-ink",
                    )}
                  >
                    <EmojiIcon glyph={item.icon} />
                    {item.label}
                  </Link>
                ))}
              </PopoverContent>
            </Popover>
          </>
        ) : null}
      </div>
    </nav>
  );
}
