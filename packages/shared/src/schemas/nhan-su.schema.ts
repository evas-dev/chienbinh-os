import { z } from 'zod';

/**
 * Schema nhân sự — dùng CHUNG cho backend (validate request) và frontend
 * (validate form). Nhờ vậy luật kiểm tra không bao giờ lệch giữa hai đầu.
 */

/** Số điện thoại Việt Nam: cho phép +84 hoặc 0 đầu, 9–10 chữ số sau đó. */
const soDienThoaiVN = z
  .string()
  .trim()
  .regex(/^(\+84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ (ví dụ: 0912345678)');

export const taoNhanSuSchema = z.object({
  hoTen: z
    .string()
    .trim()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên quá dài'),

  // Zod 4: z.email() thay cho z.string().email() của Zod 3
  email: z
    .email('Email không hợp lệ')
    .trim()
    .toLowerCase(),

  soDienThoai: soDienThoaiVN.optional().or(z.literal('')),
  chucVu: z.string().trim().max(100).optional().or(z.literal('')),
  ghiChu: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const capNhatNhanSuSchema = taoNhanSuSchema.partial().extend({
  dangHoatDong: z.boolean().optional(),
});

export const locNhanSuSchema = z.object({
  q: z.string().trim().optional(),
  dangHoatDong: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export type TaoNhanSuInput = z.infer<typeof taoNhanSuSchema>;
export type CapNhatNhanSuInput = z.infer<typeof capNhatNhanSuSchema>;
export type LocNhanSuInput = z.infer<typeof locNhanSuSchema>;

/** Hình dạng dữ liệu nhân sự trả về cho giao diện. */
export interface NhanSuDTO {
  id: string;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  chucVu: string | null;
  ghiChu: string | null;
  dangHoatDong: boolean;
  /** Số hạng mục đang gánh — chỉ có ở endpoint danh sách. */
  soHangMucDangLam?: number;
}
