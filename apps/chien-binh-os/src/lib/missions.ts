import type { Enums } from "@/types/database";

export const TYPE_LABEL: Record<Enums<"mission_type">, string> = {
  chien_dich: "Chiến dịch",
  tuan: "Nhiệm vụ tuần",
  ngay: "Nhiệm vụ Daily",
};

/**
 * Nhãn loại nhiệm vụ hiển thị cho người dùng.
 *
 * Enum trong DB chỉ có `ngay`, nhưng cờ `fixed` chia nó thành hai loại mà người
 * dùng thấy khác nhau hẳn — nên chỉ tra TYPE_LABEL[type] là chưa đủ:
 *   fixed = true  -> Nhiệm vụ Daily (lặp lại mỗi ngày, giao từ Mục tiêu tuần)
 *   fixed = false -> Nhiệm vụ Bonus (giao thêm để bứt phá, thưởng lớn hơn)
 */
export function nhanLoaiNhiemVu(type: Enums<"mission_type">, fixed: boolean | null | undefined) {
  if (type === "ngay") return fixed ? "Nhiệm vụ Daily" : "Nhiệm vụ Bonus";
  return TYPE_LABEL[type];
}

export const STATUS_LABEL: Record<Enums<"mission_status">, string> = {
  todo: "Chưa nhận",
  doing: "Đang làm",
  review: "Chờ duyệt",
  done: "Hoàn thành",
};

/**
 * Màu nhãn trạng thái. Khớp đúng bảng trạng thái đã in trong cẩm nang
 * (/huong-dan mục 5.2) — nếu đổi ở đây thì phải sửa cả cẩm nang.
 */
export const STATUS_MAU: Record<Enums<"mission_status">, "xam" | "vang" | "tim" | "xanh"> = {
  todo: "xam",
  doing: "vang",
  review: "tim",
  done: "xanh",
};

// Khớp CONTENT_TYPES trong js/submission.js — dùng cho form nộp kết quả và
// khớp trực tiếp với case metric_key trong RPC approve_submission.
export const CONTENT_TYPES = [
  { key: "video", label: "Video", unit: "video", numeric: true },
  { key: "view", label: "Số view", unit: "view", numeric: true },
  { key: "lead", label: "Số lead", unit: "lead", numeric: true },
  { key: "bai_viet", label: "Bài viết", unit: "bài", numeric: true },
  { key: "bai_web", label: "Bài web/SEO", unit: "bài", numeric: true },
  { key: "khac", label: "Nội dung khác", unit: "", numeric: false },
] as const;
