import type { Enums } from "@/types/database";

export const REQUEST_TYPES: {
  code: Enums<"support_type">;
  label: string;
  icon: string;
  to: "manager" | "staff";
}[] = [
  { code: "ho_tro_quan_ly", label: "Hỗ trợ từ quản lý", icon: "🎖", to: "manager" },
  { code: "ho_tro_nhan_su", label: "Hỗ trợ từ nhân sự khác", icon: "🤝", to: "staff" },
  { code: "nghi_phep", label: "Nghỉ phép", icon: "🌴", to: "manager" },
  { code: "de_xuat", label: "Đề xuất cần duyệt", icon: "💡", to: "manager" },
];

export const MAX_REQUESTS_PER_MONTH = 4;
