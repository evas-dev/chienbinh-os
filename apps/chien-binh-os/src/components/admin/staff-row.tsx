"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AnhDaiDien } from "@/components/chung/anh-dai-dien";
import { Chip } from "@/components/chung/chip";
import { CapLaiMatKhauButton } from "./cap-lai-mat-khau-button";
import { ROLE_LABEL } from "@/lib/nav";
import { setActiveAction } from "@/lib/actions/admin";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import type { Tables } from "@/types/database";

export function StaffRow({ warrior, isSelf }: { warrior: Tables<"profiles">; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const isCeo = warrior.role === "tong_tu_lenh";

  function toggle() {
    startTransition(async () => {
      const res = await setActiveAction(warrior.id, !warrior.active);
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      toast.success(warrior.active ? "Đã ngưng tài khoản" : "Đã kích hoạt lại");
    });
  }

  return (
    <div className={`flex items-center gap-3 py-3.5 ${warrior.active ? "" : "opacity-60"}`}>
      {/* Danh sách này chỉ Tổng Tư Lệnh thấy, mà CEO xem được hồ sơ mọi người —
          nên link ở đây không cần xét quyền như ở Tiểu đội / Bảng xếp hạng. */}
      <Link
        href={`/nhan-su/${warrior.id}`}
        className="hover:text-cb-gold-soft flex min-w-0 flex-1 items-center gap-3 transition-colors"
      >
        <AnhDaiDien id={warrior.id} ten={warrior.name} className="size-10" canhPx={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">
            {warrior.name} {isSelf ? <span className="text-cb-ink-faint">· Bạn</span> : null}
          </div>
          <div className="text-cb-ink-faint truncate text-xs">
            {ROLE_LABEL[warrior.role]} · {warrior.dept} ·{" "}
            <span className="inline-flex items-center gap-1">
              <EmojiIcon glyph="📱" />
              {warrior.phone}
            </span>
          </div>
        </div>
      </Link>
      <Chip mau={warrior.active ? "xanh" : "do"}>
        {warrior.active ? "Đang hoạt động" : "Đã ngưng"}
      </Chip>
      {/* Cấp lại mật khẩu cho cả tài khoản đã ngưng: có khi phải mở lại rồi
          bàn giao, lúc đó vẫn cần đặt mật khẩu mới. Riêng chính mình thì dùng
          trang Đổi mật khẩu, không cần đường vòng qua đây. */}
      {!isSelf ? <CapLaiMatKhauButton warriorId={warrior.id} tenNhanSu={warrior.name} /> : null}
      {isCeo || isSelf ? (
        <span className="text-cb-ink-faint w-20 shrink-0 text-right text-xs">
          {isCeo ? "CEO" : "Bạn"}
        </span>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={toggle}
          className="w-20 shrink-0"
        >
          {warrior.active ? "Ngưng" : "Kích hoạt"}
        </Button>
      )}
    </div>
  );
}
