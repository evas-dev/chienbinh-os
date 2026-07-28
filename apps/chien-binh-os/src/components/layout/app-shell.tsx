import type { Profile } from "@/lib/auth/get-current-profile";
import { NavTabs } from "./nav-tabs";
import { UserMenu } from "./user-menu";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(0, daysInMonth - now.getDate());

  return (
    <div className="bg-cb-bg text-cb-ink min-h-screen">
      <header className="border-cb-line flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <EmojiIcon glyph="⚔" className="text-cb-crimson size-7" />
          <div>
            <div className="font-heading text-base leading-tight tracking-wide">
              CHIẾN BINH<span className="text-cb-gold"> OS</span>
            </div>
            <div className="text-cb-ink-faint text-xs">Vận hành công ty như một cuộc chiến</div>
          </div>
        </div>
        <div className="text-cb-ink-dim hidden items-center gap-2 text-xs sm:flex">
          <span className="text-cb-gold-soft font-semibold">MỤC TIÊU</span>
          <span>THÁNG {now.getMonth() + 1}/{now.getFullYear()}</span>
          <span>còn {daysLeft} ngày</span>
        </div>
        <UserMenu profile={profile} />
      </header>
      <NavTabs role={profile.role} />
      <main className="p-4">{children}</main>
    </div>
  );
}
