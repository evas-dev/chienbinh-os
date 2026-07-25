import { z } from 'zod';

/**
 * Các khóa cấu hình lưu trong bảng CauHinh (dạng khóa–giá trị).
 *
 * Gom về một chỗ để tránh gõ sai chuỗi rải rác, và để frontend lẫn backend
 * hiểu cùng một tập khóa.
 */
export const KHOA_CAU_HINH = {
  /** Số ngày trước hạn bắt đầu tô màu vàng cảnh báo. */
  NGUONG_CANH_BAO_VANG: 'NGUONG_CANH_BAO_VANG',
  /** Tự động gửi email khi giao việc (dùng ở giai đoạn 4). */
  TU_DONG_GUI_MAIL: 'TU_DONG_GUI_MAIL',
  /** Bật vòng lặp quét hộp thư (giai đoạn 4). */
  BAT_CRON_QUET_MAIL: 'BAT_CRON_QUET_MAIL',
  /** Chu kỳ quét hộp thư, tính bằng phút (giai đoạn 4). */
  CHU_KY_QUET_PHUT: 'CHU_KY_QUET_PHUT',
} as const;

export const NGUONG_CANH_BAO_MAC_DINH = 3;

/** Cập nhật cấu hình: chỉ nhận các khóa đã biết, giá trị luôn là chuỗi. */
export const capNhatCauHinhSchema = z.object({
  NGUONG_CANH_BAO_VANG: z.coerce.number().int().min(1).max(60).optional(),
  TU_DONG_GUI_MAIL: z.boolean().optional(),
  BAT_CRON_QUET_MAIL: z.boolean().optional(),
  CHU_KY_QUET_PHUT: z.coerce.number().int().min(1).max(1440).optional(),
});

export type CapNhatCauHinhInput = z.infer<typeof capNhatCauHinhSchema>;

/** Cấu hình trả về cho giao diện, đã ép về đúng kiểu. */
export interface CauHinhDTO {
  NGUONG_CANH_BAO_VANG: number;
  TU_DONG_GUI_MAIL: boolean;
  BAT_CRON_QUET_MAIL: boolean;
  CHU_KY_QUET_PHUT: number;
}
