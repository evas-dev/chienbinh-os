import type { Tables } from "@/types/database";

type Rank = Tables<"ranks">;

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
  const sorted = [...ranks].sort((a, b) => a.ord - b.ord);
  const current = rankOf(exp, ranks);
  const idx = sorted.findIndex((r) => r.id === current.id);
  const next = sorted[idx + 1];
  if (!next) return { pct: 100, remaining: 0, nextName: "Đỉnh cao" };
  const span = next.min_exp - current.min_exp;
  const into = exp - current.min_exp;
  return { pct: Math.round((into / span) * 100), remaining: span - into, nextName: next.name };
}
