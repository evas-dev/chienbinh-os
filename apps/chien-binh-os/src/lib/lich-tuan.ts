/**
 * Thứ trong tuần cho lịch giao nhiệm vụ lặp.
 *
 * Đánh số theo chuẩn ISO — 1 là Thứ Hai, 7 là Chủ Nhật — khớp với
 * `extract(isodow ...)` bên Postgres. KHÔNG dùng kiểu 0 = Chủ Nhật của
 * JavaScript: hai cách đánh số lẫn vào nhau là lệch nguyên một ngày.
 */
export const CAC_THU = [
  { so: 1, nhan: "T2", day: "Thứ Hai" },
  { so: 2, nhan: "T3", day: "Thứ Ba" },
  { so: 3, nhan: "T4", day: "Thứ Tư" },
  { so: 4, nhan: "T5", day: "Thứ Năm" },
  { so: 5, nhan: "T6", day: "Thứ Sáu" },
  { so: 6, nhan: "T7", day: "Thứ Bảy" },
  { so: 7, nhan: "CN", day: "Chủ Nhật" },
] as const;

/** Mặc định Thứ Hai đến Thứ Bảy — lịch làm việc thường của công ty. */
export const MAC_DINH_T2_T7 = [1, 2, 3, 4, 5, 6];

/** "T2 · T3 · T4" — hoặc gọn lại khi chọn trọn bộ hay gần trọn bộ. */
export function moTaLich(weekdays: number[]) {
  const sap = [...weekdays].sort((a, b) => a - b);
  if (sap.length === 7) return "Cả tuần";
  if (sap.join() === MAC_DINH_T2_T7.join()) return "T2 – T7";
  if (sap.join() === "1,2,3,4,5") return "T2 – T6";
  return sap.map((s) => CAC_THU.find((t) => t.so === s)?.nhan ?? s).join(" · ");
}
