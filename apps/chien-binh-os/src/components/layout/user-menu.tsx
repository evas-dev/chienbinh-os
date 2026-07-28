import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import type { Profile } from "@/lib/auth/get-current-profile";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export function UserMenu({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost" size="sm" className="text-cb-ink-dim">
        <Link href="/feed">
          <EmojiIcon glyph="🔔" />
        </Link>
      </Button>
      <span className="text-sm font-medium">{profile.name}</span>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="sm">
          Đăng xuất
        </Button>
      </form>
    </div>
  );
}
