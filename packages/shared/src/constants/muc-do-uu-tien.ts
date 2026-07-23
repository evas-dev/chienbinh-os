/**
 * Mức độ ưu tiên của công việc.
 *
 * Mỗi enum đều đi kèm bản đồ nhãn tiếng Việt và bản đồ màu, để giao diện
 * không phải hardcode chuỗi ở từng chỗ — thêm một mức mới chỉ sửa đúng file này.
 */

export const MUC_DO_UU_TIEN = ['CAO', 'TRUNG_BINH', 'THAP'] as const;

export type MucDoUuTien = (typeof MUC_DO_UU_TIEN)[number];

export const NHAN_UU_TIEN: Record<MucDoUuTien, string> = {
  CAO: 'Cao',
  TRUNG_BINH: 'Trung bình',
  THAP: 'Thấp',
};

/** Lớp CSS cho huy hiệu ưu tiên. Đỏ dành riêng cho quá hạn nên ưu tiên Cao dùng cam. */
export const MAU_UU_TIEN: Record<MucDoUuTien, string> = {
  CAO: 'bg-orange-100 text-orange-700 border-orange-200',
  TRUNG_BINH: 'bg-sky-100 text-sky-700 border-sky-200',
  THAP: 'bg-slate-100 text-slate-600 border-slate-200',
};

/** Thứ tự sắp xếp: ưu tiên cao lên trước. */
export const THU_TU_UU_TIEN: Record<MucDoUuTien, number> = {
  CAO: 0,
  TRUNG_BINH: 1,
  THAP: 2,
};
