import type { Enums } from "@/types/database";

export const TYPE_LABEL: Record<Enums<"mission_type">, string> = {
  chien_dich: "Chiến dịch",
  thang: "Nhiệm vụ tháng",
  ngay: "Nhiệm vụ ngày",
};

export const STATUS_LABEL: Record<Enums<"mission_status">, string> = {
  todo: "Chưa nhận",
  doing: "Đang làm",
  review: "Chờ duyệt",
  done: "Hoàn thành",
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
