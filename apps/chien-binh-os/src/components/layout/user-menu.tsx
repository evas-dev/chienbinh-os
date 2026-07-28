import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import type { Profile } from "@/lib/auth/get-current-profile";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export function UserMenu({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-cb-ink-dim hover:text-cb-ink shrink-0"
        title="Nhật ký chiến công"
      >
        <Link href="/feed">
          <EmojiIcon glyph="🔔" />
        </Link>
      </Button>
      {/* whitespace-nowrap: tên không bị ngắt thành 2 dòng làm header cao lên trên mobile. */}
      <span className="max-w-[9rem] truncate text-sm font-medium whitespace-nowrap">
        {profile.name}
      </span>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="sm" className="shrink-0">
          Đăng xuất
        </Button>
      </form>
    </div>
  );
}
