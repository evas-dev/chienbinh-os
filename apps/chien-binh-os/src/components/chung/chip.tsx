import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Nhãn tròn nhỏ (loại nhiệm vụ, trạng thái, thẻ đếm...).
 *
 * Gom lại từ cụm `bg-cb-panel-2 text-cb-ink-dim rounded-full px-2 py-0.5
 * text-xs` bị chép lại ở nhiều trang — mỗi nơi lệch một chút về cỡ chữ và
 * padding. Kiểu game: viền rõ, chữ đậm, có gờ sáng mép trên.
 */
const chipVariants = cva(
  // Nền đặc + viền tối dày + gờ đáy — cùng ngữ pháp với nút, chỉ thu nhỏ lại.
  "font-heading inline-flex items-center gap-1 rounded-lg border-2 border-black/65 px-2.5 py-0.5 text-xs font-bold tracking-wide whitespace-nowrap uppercase shadow-[inset_0_-2px_0_0_rgb(0_0_0/0.2),inset_0_1px_0_0_rgb(255_255_255/0.25)]",
  {
    variants: {
      mau: {
        xam: "bg-cb-panel-2 text-cb-ink-dim",
        vang: "bg-cb-gold text-cb-bg",
        xanh: "bg-cb-green text-white [text-shadow:0_1px_0_rgb(0_0_0/0.45)]",
        do: "bg-cb-crimson text-white [text-shadow:0_1px_0_rgb(0_0_0/0.45)]",
        tim: "bg-cb-purple text-white [text-shadow:0_1px_0_rgb(0_0_0/0.45)]",
        lam: "bg-cb-blue text-white [text-shadow:0_1px_0_rgb(0_0_0/0.45)]",
      },
    },
    defaultVariants: { mau: "xam" },
  },
);

export function Chip({
  children,
  mau,
  className,
}: VariantProps<typeof chipVariants> & {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn(chipVariants({ mau }), className)}>{children}</span>;
}
