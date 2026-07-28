export function fmtNum(n: number) {
  return n.toLocaleString("vi-VN");
}

export function fmtVnd(n: number) {
  return Math.round(n).toLocaleString("vi-VN") + "₫";
}

export function initials(name: string) {
  const last = name.trim().split(/\s+/).at(-1) ?? "";
  return last.charAt(0).toUpperCase();
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
