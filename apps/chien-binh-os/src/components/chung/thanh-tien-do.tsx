import { cn } from "@/lib/utils";

/**
 * Thanh tiến độ kiểu game: rãnh lõm có viền tối, thanh chạy phủ gradient vàng
 * kèm vệt bóng ở nửa trên cho ra chất "thuỷ tinh", và quầng sáng nhẹ toả ra.
 *
 * `co="lon"` dùng cho thanh EXP ở hồ sơ — nơi đáng để nhìn to; mặc định vẫn
 * mảnh để không lấn át các danh sách nhiệm vụ dày đặc.
 */
export function ThanhTienDo({
  pct,
  co = "thuong",
  soDoan = 0,
  className,
}: {
  pct: number;
  co?: "thuong" | "lon";
  /**
   * Chia thanh thành N ô rời (kiểu thanh cấp độ trong game bắn súng di động).
   * 0 = thanh liền. Chỉ nên dùng cho thanh lớn — ô quá nhỏ thì khe cắt nhìn
   * như lỗi hiển thị.
   */
  soDoan?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const rong = soDoan > 0 ? 100 / soDoan : 0;

  return (
    <div
      className={cn(
        "bg-cb-bg-2 relative overflow-hidden ring-2 ring-black/55 ring-inset",
        "shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.55)]",
        // Ô rời thì bo góc vuông vắn hơn cho khe cắt thẳng thớm.
        soDoan > 0 ? "rounded-md" : "rounded-full",
        co === "lon" ? "h-5" : "h-3",
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "bg-cb-gold relative h-full transition-all duration-500",
          soDoan > 0 ? "rounded-none" : "rounded-full",
          // Không đổ quầng sáng khi thanh rỗng, tránh đốm sáng lơ lửng ở mép trái.
          clamped > 0 && "shadow-[0_0_10px_0_rgb(227_178_60/0.45)]",
        )}
        style={{ width: `${clamped}%` }}
      >
        {/* Gờ sáng mép trên: cho thanh có mặt cong thay vì mảng màu bẹt. */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/22" />
      </div>

      {/* Khe cắt vẽ ĐÈ LÊN thanh chạy, không phải ghép từng ô: giữ được hiệu
          ứng chạy mượt mà vẫn ra hình ô rời, và ô cuối cùng lấp đầy một phần
          vẫn hiển thị đúng. */}
      {soDoan > 0 ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent 0 calc(${rong}% - 4px), var(--cb-bg) calc(${rong}% - 4px) ${rong}%)`,
          }}
        />
      ) : null}
    </div>
  );
}
