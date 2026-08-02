import type { Profile } from "@/lib/auth/get-current-profile";
import { NavTabs } from "./nav-tabs";
import { UserMenu } from "./user-menu";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { khoaTuan, nhanTuan, soNgayConLaiTrongTuan } from "@/lib/tuan";

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  // Chu kỳ mục tiêu là TUẦN (Thứ Hai – Chủ Nhật), chốt theo giờ VN chứ không
  // dùng new Date() trần — server chạy UTC nên chiều Chủ Nhật sẽ nhảy sớm tuần.
  const tuan = nhanTuan(khoaTuan());
  const conLai = soNgayConLaiTrongTuan();

  return (
    <div className="bg-cb-bg text-cb-ink min-h-screen">
      {/* Header dính trên khi cuộn — luôn thấy tài khoản & mốc thời gian mục tiêu. */}
      <header className="border-cb-line bg-cb-bg/95 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <EmojiIcon glyph="⚔" className="text-cb-crimson size-7 shrink-0" />
            <div className="min-w-0">
              <div className="font-heading text-base leading-tight tracking-wide">
                CHIẾN BINH<span className="text-cb-gold"> OS</span>
              </div>
              {/* Ẩn tagline trên mobile để header không bị cao 2 dòng. */}
              <div className="text-cb-ink-faint hidden truncate text-xs sm:block">
                Vận hành công ty như một cuộc chiến
              </div>
            </div>
          </div>
          <div className="text-cb-ink-dim mx-auto hidden items-center gap-2 text-xs lg:flex">
            <span className="text-cb-gold-soft font-semibold tracking-wide">MỤC TIÊU</span>
            <span>TUẦN {tuan}</span>
            <span className="text-cb-line">·</span>
            <span>{conLai > 0 ? `còn ${conLai} ngày` : "hôm nay chốt"}</span>
          </div>
          <div className="ml-auto lg:ml-0">
            <UserMenu profile={profile} />
          </div>
        </div>
      </header>
      <NavTabs role={profile.role} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
