import Image from "next/image";
import { cn } from "@/lib/utils";
import { nhanVatCua } from "@/lib/nhan-vat";

/**
 * Ảnh đại diện nhân sự: khung vuông bo góc, viền tối dày, nền màu rực — cùng
 * ngữ pháp với nút bấm, khớp lưới chân dung trong bộ UI kit.
 *
 * Nhân vật gán theo `id` nên cố định với từng người (xem `nhanVatCua`).
 */
export function AnhDaiDien({
  id,
  ten,
  className,
  canhPx = 80,
}: {
  /** id nhân sự — quyết định nhân vật và màu nền. */
  id: string;
  /** Tên, dùng cho văn bản thay thế. */
  ten: string;
  /** Cỡ khung, truyền class `size-*`. */
  className?: string;
  /** Cạnh khung tính bằng px — chỉ để trình duyệt chọn đúng cỡ ảnh cần tải. */
  canhPx?: number;
}) {
  const { anh, nen } = nhanVatCua(id);
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl border-2 border-black/85",
        "shadow-[inset_0_-4px_0_0_rgb(0_0_0/0.22),inset_0_2px_0_0_rgb(255_255_255/0.2),0_3px_0_0_rgb(0_0_0/0.6)]",
        className,
      )}
      style={{ backgroundColor: nen }}
    >
      {/* `object-top` chứ không phải `object-center`: chân dung nào cũng vẽ
          đầu nhân vật ở phần trên khung, canh giữa sẽ cắt mất trán. */}
      <Image
        src={`/avatars/${anh}.png`}
        alt={ten}
        fill
        sizes={`${canhPx}px`}
        className="object-cover object-top"
      />
    </div>
  );
}
