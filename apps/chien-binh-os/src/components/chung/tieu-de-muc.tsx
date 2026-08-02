import { cn } from "@/lib/utils";
import { EmojiIcon } from "./emoji-icon";

/**
 * Tiêu đề của một khối/thẻ nội dung — thay cho pattern lặp
 * `<div className="mb-2 flex items-center gap-1.5 font-semibold">` rải rác
 * khắp các trang (trước đây margin không nhất quán mb-1/mb-2/mb-3).
 */
export function TieuDeMuc({
  icon,
  children,
  hint,
  action,
  className,
}: {
  /** Glyph emoji, sẽ được render thành icon SVG qua EmojiIcon. */
  icon?: string;
  children: React.ReactNode;
  /** Dòng mô tả phụ dưới tiêu đề. */
  hint?: React.ReactNode;
  /** Nút/điều khiển đặt bên phải tiêu đề. */
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <div className="font-heading flex items-center gap-2 text-base font-extrabold tracking-wide uppercase">
          {icon ? <EmojiIcon glyph={icon} className="text-cb-gold-soft" /> : null}
          <span className="min-w-0">{children}</span>
        </div>
        {hint ? <p className="text-cb-ink-faint mt-1 text-xs">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
