// Mẫu nhiệm vụ ngày để quản lý bấm giao nhanh cho lính — khớp FIXED_TASKS trong js/data.js.
export const FIXED_TASKS = [
  { title: "Viết 1 bài / đăng nội dung", unit: "bài", target: 1, exp: 40 },
  { title: "Sản xuất video ngắn", unit: "video", target: 3, exp: 60 },
  { title: "Đạt view nội dung", unit: "view", target: 5000, exp: 50 },
  { title: "Học xong 1 kỹ năng mới", unit: "kỹ năng", target: 1, exp: 80 },
  { title: "Cập nhật 1 thông tin / insight mới", unit: "tin", target: 1, exp: 30 },
  { title: "Chăm sóc khách hàng", unit: "khách", target: 10, exp: 50 },
] as const;

// Σ(min(current/target,1) × weight) / Σweight — tiến độ có trọng số, giới hạn 100%/mục.
export function weightedProgress(items: { current: number; target: number; weight: number }[]) {
  const totalW = items.reduce((s, it) => s + it.weight, 0) || 1;
  const got = items.reduce((s, it) => s + Math.min(it.current / it.target, 1) * it.weight, 0);
  return Math.round((got / totalW) * 100);
}

export function fmtTargetVal(v: number, unit: string) {
  if (unit === "₫") return Math.round(v).toLocaleString("vi-VN") + "₫";
  return v.toLocaleString("vi-VN") + " " + unit;
}

// Không giới hạn 100% — để CEO nhận biết phòng ban đang "vượt" chỉ tiêu.
export function weightedRaw(items: { current: number; target: number; weight: number }[]) {
  const tw = items.reduce((s, it) => s + it.weight, 0) || 1;
  return Math.round(
    (items.reduce((s, it) => s + (it.current / it.target) * it.weight, 0) / tw) * 100,
  );
}

// Số liệu cùng kỳ trước để so sánh cảnh báo tăng/giảm — dữ liệu demo gốc (js/data.js PREV_PERIOD).
export const PREV_PERIOD = { revenue: 1050000000, newCustomers: 64, leads: 210 };

