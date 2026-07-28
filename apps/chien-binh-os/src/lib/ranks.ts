import type { Tables } from "@/types/database";

type Rank = Tables<"ranks">;

// EXP-02 AC3: ngưỡng quân hàm phải tăng dần, không trùng/chồng lấn (quy tắc
// nghiệp vụ). ranks hiện là dữ liệu seed tin cậy không có constraint DB nào
// bảo vệ (không có unique/check trên ord hay min_exp) — kiểm tra ở tầng ứng
// dụng để không tính sai tiến độ nếu cấu hình sau này bị sửa lỗi.
export function ranksConfigIssue(ranks: Rank[]): string | null {
  if (!ranks.length) return null;
  const sorted = [...ranks].sort((a, b) => a.ord - b.ord);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].ord === sorted[i - 1].ord) {
      return "Cấu hình quân hàm có hai bậc trùng thứ tự (ord) — cần rà soát.";
    }
    if (sorted[i].min_exp <= sorted[i - 1].min_exp) {
      return "Cấu hình quân hàm có ngưỡng EXP không tăng dần hoặc bị trùng — cần rà soát.";
    }
  }
  return null;
}

// Thuần hàm, cổng vào là danh sách ranks đã fetch từ DB (không hardcode nữa).
export function rankOf(exp: number, ranks: Rank[]): Rank {
  const sorted = [...ranks].sort((a, b) => a.ord - b.ord);
  let current = sorted[0];
  for (const r of sorted) {
    if (exp >= r.min_exp) current = r;
  }
  return current;
}

export function expProgress(exp: number, ranks: Rank[]) {
  const configIssue = ranksConfigIssue(ranks);
  const sorted = [...ranks].sort((a, b) => a.ord - b.ord);
  const current = rankOf(exp, ranks);
  const idx = sorted.findIndex((r) => r.id === current.id);
  const next = sorted[idx + 1];
  if (!next) return { pct: 100, remaining: 0, nextName: "Đỉnh cao", configIssue };
  const span = next.min_exp - current.min_exp;
  const into = exp - current.min_exp;
  return {
    pct: Math.round((into / span) * 100),
    remaining: span - into,
    nextName: next.name,
    configIssue,
  };
}
