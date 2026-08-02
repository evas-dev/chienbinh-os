import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Nút khối kiểu game bắn súng di động (tham chiếu: bộ UI Brawl Stars).
 *
 * Ngữ pháp hình khối gồm 4 lớp, thiếu lớp nào là mất chất ngay:
 *   1. Màu nền PHẲNG — không gradient mềm.
 *   2. Viền tối dày bao quanh, tách hẳn nút khỏi nền.
 *   3. "Gờ đáy": dải sẫm nằm BÊN TRONG mép dưới (inset shadow), khiến nút
 *      trông như khối nhựa dày chứ không phải hình chữ nhật dán phẳng.
 *   4. Khối bóng cứng bên dưới + nhấn thì tụt xuống đúng bằng khối bóng đó.
 *
 * Cố tình đi qua `shadow-[…]` thay vì tự viết box-shadow trong CSS: Tailwind
 * dựng `focus-visible:ring` cũng bằng box-shadow, chỉ khi cùng đi qua hệ thống
 * shadow của Tailwind thì gờ nổi và vòng focus mới cộng dồn được với nhau.
 *
 * Hover dùng `brightness` vì nhiều nơi gọi tự đè `bg-*`; lọc sáng thì ăn với
 * mọi màu nền, không phụ thuộc class nào thắng.
 */
const KHOI_NOI = [
  // Viền MẢNH (2px) — viền dày quá làm nút trông phù nề, không sắc như mẫu.
  "border-2 border-black/85",
  // Gờ đáy dày 6px là chi tiết ăn tiền: nó phải rõ như một dải màu sẫm riêng,
  // không phải bóng mờ. Gờ sáng mép trên thì ngược lại, phải rất nhẹ (18%) —
  // để mạnh thành ra vệt bạc bệt ngang đầu nút.
  "shadow-[inset_0_-6px_0_0_rgb(0_0_0/0.24),inset_0_2px_0_0_rgb(255_255_255/0.18),0_5px_0_0_rgb(0_0_0/0.75),0_9px_12px_-3px_rgb(0_0_0/0.5)]",
  "hover:brightness-110",
  "active:translate-y-[5px] active:shadow-[inset_0_-2px_0_0_rgb(0_0_0/0.24),inset_0_2px_5px_0_rgb(0_0_0/0.35)]",
  // Chữ TRẮNG + bóng đen cứng 2px, đúng như bộ kit (Lilita One, text-shadow:
  // 0 2px 0 black). Trước đây để chữ tối kèm bóng trắng cho dễ đọc, nhưng nhìn
  // bệt và mờ — người dùng đã chọn kiểu của kit.
  "font-heading text-white font-extrabold uppercase tracking-wide [text-shadow:0_2px_0_rgb(0_0_0/0.6)]",
].join(" ");

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: `bg-cb-gold ${KHOI_NOI}`,
        // Xanh lá = "mở khoá / bắt đầu", đúng quy ước màu của bộ kit.
        success: `bg-cb-green ${KHOI_NOI}`,
        outline:
          "border-2 border-cb-line bg-cb-panel-2 text-cb-ink font-heading font-bold shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06),0_2px_0_0_rgb(0_0_0/0.45)] hover:border-cb-gold/50 hover:brightness-110 active:translate-y-[2px] active:shadow-none aria-expanded:border-cb-gold/50",
        secondary: `bg-cb-panel-2 ${KHOI_NOI}`,
        ghost:
          "font-heading font-bold hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: `bg-cb-crimson focus-visible:ring-destructive/30 ${KHOI_NOI}`,
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 text-[0.95rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 rounded-xl px-3.5 text-[0.85rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-lg has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-xl in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
