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
//
// Nhãn cố tình ngắn (1–2 từ): Tổng Tư Lệnh thấy 14 mục, nhãn dài ("Quân hàm &
// Huân chương", "Nhật ký chiến công") đẩy thanh nav xuống 2 hàng, ăn 156px chiều
// dọc trước MỌI trang. Tiêu đề đầy đủ vẫn nằm trong từng trang nên không mất
// thông tin. `nhomPhu: true` = trang tra cứu, ít dùng hàng ngày — dồn về cuối và
// gom vào menu "Thêm" trên màn hình hẹp.
export const NAV_ITEMS: {
  path: string;
  icon: string;
  label: string;
  roles: Role[];
  nhomPhu?: boolean;
}[] = [
  { path: "/", icon: "🎖", label: "Sở chỉ huy", roles: ALL_ROLES },
  { path: "/missions", icon: "🎯", label: "Nhiệm vụ", roles: ALL_ROLES },
  { path: "/objectives", icon: "🧭", label: "Mục tiêu", roles: MGMT },
  { path: "/commend", icon: "🏆", label: "Khen thưởng", roles: MGMT },
  { path: "/penalty", icon: "⚖️", label: "Xử phạt", roles: MGMT },
  { path: "/requests", icon: "🤝", label: "Hỗ trợ", roles: ALL_ROLES },
  // Bảng xếp hạng nằm trong trang Nhân sự dưới dạng thẻ (`/admin?xem=xep-hang`),
  // không còn mục riêng. Vì vậy mục này mở cho cả Tư Lệnh — họ chỉ thấy thẻ xếp
  // hạng, danh sách nhân sự vẫn chỉ CEO xem được (xem admin/page.tsx).
  { path: "/admin", icon: "👤", label: "Nhân sự", roles: MGMT },
  { path: "/squad", icon: "🛡", label: "Tiểu đội", roles: CEO_ONLY },
  { path: "/bonus", icon: "💰", label: "Quỹ thưởng", roles: CEO_ONLY },

  // --- Nhóm tra cứu: xem chứ không thao tác, không cần đứng hàng đầu ---
  { path: "/feed", icon: "📣", label: "Nhật ký", roles: ALL_ROLES, nhomPhu: true },
  { path: "/ladder", icon: "🏅", label: "Quân hàm", roles: ALL_ROLES, nhomPhu: true },
  { path: "/guide", icon: "📖", label: "Cẩm nang", roles: ALL_ROLES, nhomPhu: true },
  // Cẩm nang (/guide) giải thích khung chỉ số EXP/huy hiệu/quân hàm; trang này
  // hướng dẫn thao tác trong app (nhận việc, nộp, duyệt...) — hai nội dung khác
  // nhau nên tách route riêng thay vì nhồi chung một trang.
  { path: "/huong-dan", icon: "🎓", label: "Hướng dẫn", roles: ALL_ROLES, nhomPhu: true },
  // Đổi mật khẩu KHÔNG nằm ở đây: đó là thao tác lên tài khoản của chính mình,
  // vài tháng mới làm một lần, đã chuyển vào menu ảnh đại diện ở góc phải
  // header (components/layout/user-menu.tsx) cùng chỗ với Đăng xuất.
];
