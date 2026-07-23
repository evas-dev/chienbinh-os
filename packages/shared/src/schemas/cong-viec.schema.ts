import { z } from 'zod';
import { MUC_DO_UU_TIEN, type MucDoUuTien } from '../constants/muc-do-uu-tien.js';
import { TRANG_THAI_CONG_VIEC, type TrangThaiCongViec } from '../constants/trang-thai.js';

/** Nhận cả chuỗi ISO lẫn Date, luôn trả về Date. */
const ngay = z.coerce.date({ error: 'Ngày không hợp lệ' });

export const taoCongViecSchema = z
  .object({
    ten: z
      .string()
      .trim()
      .min(3, 'Tên công việc phải có ít nhất 3 ký tự')
      .max(200, 'Tên công việc quá dài'),

    moTa: z.string().trim().max(5000).optional().or(z.literal('')),

    ngayBatDau: ngay,
    ngayKetThucDuKien: ngay,

    mucDoUuTien: z.enum(MUC_DO_UU_TIEN).default('TRUNG_BINH'),
    trangThai: z.enum(TRANG_THAI_CONG_VIEC).default('CHUA_BAT_DAU'),
  })
  // Kiểm tra liên trường: ngày kết thúc phải sau ngày bắt đầu.
  // Gắn lỗi vào đúng ô "ngày kết thúc" để giao diện hiện lỗi ngay dưới ô đó.
  .refine((d) => d.ngayKetThucDuKien >= d.ngayBatDau, {
    error: 'Ngày kết thúc dự kiến phải sau ngày bắt đầu',
    path: ['ngayKetThucDuKien'],
  });

/**
 * Dùng .partial() trên object gốc (trước .refine) rồi thêm lại ràng buộc,
 * vì ZodEffects sinh ra bởi .refine không có sẵn .partial().
 */
export const capNhatCongViecSchema = z
  .object({
    ten: z.string().trim().min(3).max(200).optional(),
    moTa: z.string().trim().max(5000).optional().or(z.literal('')),
    ngayBatDau: ngay.optional(),
    ngayKetThucDuKien: ngay.optional(),
    mucDoUuTien: z.enum(MUC_DO_UU_TIEN).optional(),
    trangThai: z.enum(TRANG_THAI_CONG_VIEC).optional(),
  })
  .refine(
    (d) =>
      d.ngayBatDau === undefined ||
      d.ngayKetThucDuKien === undefined ||
      d.ngayKetThucDuKien >= d.ngayBatDau,
    { error: 'Ngày kết thúc dự kiến phải sau ngày bắt đầu', path: ['ngayKetThucDuKien'] },
  );

export const locCongViecSchema = z.object({
  q: z.string().trim().optional(),
  trangThai: z.enum(TRANG_THAI_CONG_VIEC).optional(),
  mucDoUuTien: z.enum(MUC_DO_UU_TIEN).optional(),
  sapXep: z.enum(['ngayTao', 'hanChot', 'uuTien', 'tienDo']).default('ngayTao'),
  chieu: z.enum(['asc', 'desc']).default('desc'),
});

export type TaoCongViecInput = z.infer<typeof taoCongViecSchema>;
export type CapNhatCongViecInput = z.infer<typeof capNhatCongViecSchema>;
export type LocCongViecInput = z.infer<typeof locCongViecSchema>;

export interface CongViecDTO {
  id: string;
  ma: string;
  ten: string;
  moTa: string | null;
  ngayBatDau: string;
  ngayKetThucDuKien: string;
  mucDoUuTien: MucDoUuTien;
  trangThai: TrangThaiCongViec;
  phanTramHoanThanh: number;
  soHangMuc: number;
  soHangMucQuaHan: number;
}
