import type { Enums } from "@/types/database";

type Role = Enums<"role_type">;

const ALL_ROLES: Role[] = ["tong_tu_lenh", "tu_lenh", "chien_sy"];
const MGMT: Role[] = ["tong_tu_lenh", "tu_lenh"];
const CEO_ONLY: Role[] = ["tong_tu_lenh"];

export const ROLE_LABEL: Record<Role, string> = {
  tong_tu_lenh: "Tổng Tư Lệnh",
  tu_lenh: "Tư Lệnh",
  chien_sy: "Chiến Sỹ",
};

export const FRONT_LABEL: Record<Enums<"front_type">, string> = {
  hau_phuong: "Hậu Phương",
  tien_tuyen: "Tiền Tuyến",
};

// Thay cho TABS[] trong js/app.js — path thật thay vì state.tab client-side.
// `icon` là glyph tra qua EmojiIcon (components/chung/emoji-icon.tsx) để render SVG.
export const NAV_ITEMS: { path: string; icon: string; label: string; roles: Role[] }[] = [
  { path: "/", icon: "🎖", label: "Sở chỉ huy", roles: ALL_ROLES },
  { path: "/admin", icon: "👤", label: "Quản trị nhân sự", roles: CEO_ONLY },
  { path: "/objectives", icon: "🧭", label: "Mục tiêu tháng", roles: MGMT },
  { path: "/commend", icon: "🏆", label: "Đề xuất khen", roles: MGMT },
  { path: "/missions", icon: "🎯", label: "Bảng nhiệm vụ", roles: ALL_ROLES },
  { path: "/squad", icon: "🛡", label: "Tiểu đội", roles: CEO_ONLY },
  { path: "/ranks", icon: "📊", label: "Bảng xếp hạng", roles: MGMT },
  { path: "/bonus", icon: "💰", label: "Quỹ thưởng", roles: CEO_ONLY },
  { path: "/penalty", icon: "⚖️", label: "Xử phạt", roles: MGMT },
  { path: "/requests", icon: "🤝", label: "Yêu cầu hỗ trợ", roles: ALL_ROLES },
  { path: "/ladder", icon: "🏅", label: "Quân hàm & Huân chương", roles: ALL_ROLES },
  { path: "/feed", icon: "📣", label: "Nhật ký chiến công", roles: ALL_ROLES },
  { path: "/guide", icon: "📖", label: "Cẩm nang", roles: ALL_ROLES },
];
