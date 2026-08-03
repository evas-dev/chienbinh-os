"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, IdCard, KeyRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnhDaiDien } from "@/components/chung/anh-dai-dien";
import { Chip } from "@/components/chung/chip";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { FRONT_LABEL, ROLE_LABEL } from "@/lib/nav";
import { fmtNum } from "@/lib/format";
import { logoutAction } from "@/lib/actions/auth";
import type { Profile } from "@/lib/auth/get-current-profile";

/** Chỉ Tổng Tư Lệnh mới đeo chip vàng — để nhãn giữ được sức phân biệt. */
const MAU_CHIP: Record<Profile["role"], "vang" | "lam" | "xam"> = {
  tong_tu_lenh: "vang",
  tu_lenh: "lam",
  chien_sy: "xam",
};

/** Một dòng trong popover: cùng chiều cao, cùng khoảng cách icon. */
function MucMenu({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-cb-ink-dim hover:bg-cb-panel-2 hover:text-cb-ink flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors"
    >
      <span className="text-cb-gold-soft [&_svg]:size-4 [&_svg]:stroke-[2.5]">{icon}</span>
      {children}
    </Link>
  );
}

/**
 * Tài khoản ở góc phải header: ảnh đại diện + tên, bấm ra popover.
 *
 * Trước đây "Đổi mật khẩu" là một mục riêng trên thanh nav — việc mỗi năm làm
 * một lần mà chiếm chỗ ngang với Nhiệm vụ hay Mục tiêu. Gom vào đây cùng Đăng
 * xuất: đều là thao tác lên tài khoản của chính mình.
 */
export function UserMenu({ profile }: { profile: Profile }) {
  const [mo, setMo] = useState(false);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
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

      <Popover open={mo} onOpenChange={setMo}>
        <PopoverTrigger
          className="border-cb-line bg-cb-panel-2 hover:border-cb-gold/50 focus-visible:ring-ring/50 aria-expanded:border-cb-gold/50 flex items-center gap-2 rounded-xl border py-1 pr-2 pl-1 transition-colors outline-none focus-visible:ring-3"
          aria-label="Menu tài khoản"
        >
          <AnhDaiDien id={profile.id} ten={profile.name} className="size-8" canhPx={32} />
          {/* Ẩn tên trên mobile: ảnh đại diện đã đủ nhận diện, giữ header 1 dòng. */}
          <span className="hidden max-w-[9rem] truncate text-sm font-medium whitespace-nowrap sm:block">
            {profile.name}
          </span>
          <ChevronDown className="text-cb-ink-faint size-4 shrink-0 stroke-[2.5]" />
        </PopoverTrigger>

        <PopoverContent align="end" className="w-64 p-0">
          <div className="border-cb-line bg-cb-panel-2 flex items-center gap-3 border-b p-3.5">
            <AnhDaiDien id={profile.id} ten={profile.name} className="size-12" canhPx={48} />
            <div className="min-w-0">
              <div className="font-heading truncate text-sm leading-tight font-bold">
                {profile.name}
              </div>
              <Chip mau={MAU_CHIP[profile.role]} className="mt-1">
                {ROLE_LABEL[profile.role]}
              </Chip>
              <div className="text-cb-ink-faint mt-1 truncate text-xs">
                {profile.front ? FRONT_LABEL[profile.front] : "—"} · {profile.dept}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3.5 text-center">
            <div className="bg-cb-bg-2 ring-cb-line rounded-lg py-2 ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
              <div className="text-cb-gold text-sm font-bold">{fmtNum(profile.exp)}</div>
              <div className="text-cb-ink-faint text-[0.65rem] font-semibold tracking-wide">
                EXP
              </div>
            </div>
            <div className="bg-cb-bg-2 ring-cb-line rounded-lg py-2 ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
              <div className="text-cb-gold text-sm font-bold">{fmtNum(profile.season_points)}</div>
              <div className="text-cb-ink-faint text-[0.65rem] font-semibold tracking-wide">
                ĐIỂM MÙA
              </div>
            </div>
          </div>

          {/* Tự đóng khi bấm: điều hướng bằng Link không đóng popover, quay lại
              trang cũ sẽ thấy menu vẫn còn bung ra. */}
          <div className="px-2 pb-2">
            <MucMenu href={`/nhan-su/${profile.id}`} icon={<IdCard />} onClick={() => setMo(false)}>
              Hồ sơ của tôi
            </MucMenu>
            <MucMenu href="/doi-mat-khau" icon={<KeyRound />} onClick={() => setMo(false)}>
              Đổi mật khẩu
            </MucMenu>
          </div>

          <div className="border-cb-line border-t p-2.5">
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm" className="w-full">
                <LogOut /> Đăng xuất
              </Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
