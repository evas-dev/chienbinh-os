import { z } from 'zod';
import { LOAI_TIEN_DO, TRANG_THAI_HANG_MUC, type LoaiTienDo, type TrangThaiHangMuc } from '../constants/trang-thai.js';
import { TRONG_SO_TOI_DA, TRONG_SO_TOI_THIEU } from '../utils/tien-do.js';

const ngay = z.coerce.date({ error: 'Ngày không hợp lệ' });

/**
 * Trọng số: SÀN LÀ 1, KHÔNG PHẢI 0.
 *
 * Đây là một trong ba chốt chặn khiến phép chia 0 không thể xảy ra khi tính
 * phần trăm của nút cha (hai chốt còn lại: giá trị mặc định trong DB và hàm
 * chiaDeuTrongSo). Xem giải thích đầy đủ trong utils/tien-do.ts.
 */
const trongSo = z
  .int()
  .min(TRONG_SO_TOI_THIEU, `Trọng số phải từ ${TRONG_SO_TOI_THIEU} trở lên`)
  .max(TRONG_SO_TOI_DA, `Trọng số tối đa là ${TRONG_SO_TOI_DA}`);

const phanTram = z
  .int()
  .min(0, 'Phần trăm không được nhỏ hơn 0')
  .max(100, 'Phần trăm không được lớn hơn 100');

export const taoHangMucSchema = z.object({
  congViecId: z.string().min(1, 'Thiếu mã công việc'),
  /** Rỗng = hạng mục gốc (con trực tiếp của công việc). */
  hangMucChaId: z.string().nullish(),

  ten: z
    .string()
    .trim()
    .min(2, 'Tên hạng mục phải có ít nhất 2 ký tự')
    .max(200, 'Tên hạng mục quá dài'),

  ghiChu: z.string().trim().max(2000).optional().or(z.literal('')),
  hanHoanThanh: ngay.nullish(),
  nguoiPhuTrachId: z.string().nullish(),

  loaiTienDo: z.enum(LOAI_TIEN_DO).default('CHECKBOX'),
  /** Bỏ trống thì hệ thống tự chia đều lại trọng số cho cả nhóm anh em. */
  trongSo: trongSo.optional(),
});

export const capNhatHangMucSchema = z.object({
  ten: z.string().trim().min(2).max(200).optional(),
  ghiChu: z.string().trim().max(2000).optional().or(z.literal('')),
  hanHoanThanh: ngay.nullish(),
  nguoiPhuTrachId: z.string().nullish(),
  loaiTienDo: z.enum(LOAI_TIEN_DO).optional(),
  trongSo: trongSo.optional(),
  trangThai: z.enum(TRANG_THAI_HANG_MUC).optional(),
});

/** Cập nhật tiến độ: hoặc tick hoàn thành, hoặc nhập %. */
export const capNhatTienDoSchema = z
  .object({
    daHoanThanh: z.boolean().optional(),
    phanTram: phanTram.optional(),
    hoanThanhBoiId: z.string().nullish(),
  })
  .refine((d) => d.daHoanThanh !== undefined || d.phanTram !== undefined, {
    error: 'Phải gửi lên daHoanThanh hoặc phanTram',
  });

export const ganPhuTrachSchema = z.object({
  nguoiPhuTrachId: z.string().nullable(),
});

/** Chỉnh trọng số hàng loạt cho cả nhóm anh em. */
export const capNhatTrongSoSchema = z
  .array(z.object({ id: z.string().min(1), trongSo }))
  .min(1, 'Danh sách trống');

/** Kéo thả sắp xếp lại cây. */
export const sapXepLaiSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      thuTu: z.int().min(0),
      hangMucChaId: z.string().nullish(),
    }),
  )
  .min(1, 'Danh sách trống');

export type TaoHangMucInput = z.infer<typeof taoHangMucSchema>;
export type CapNhatHangMucInput = z.infer<typeof capNhatHangMucSchema>;
export type CapNhatTienDoInput = z.infer<typeof capNhatTienDoSchema>;
export type CapNhatTrongSoInput = z.infer<typeof capNhatTrongSoSchema>;
export type SapXepLaiInput = z.infer<typeof sapXepLaiSchema>;

/** Một nút trong cây hạng mục trả về cho giao diện. */
export interface HangMucDTO {
  id: string;
  ma: string;
  ten: string;
  congViecId: string;
  hangMucChaId: string | null;
  ghiChu: string | null;
  hanHoanThanh: string | null;
  thuTu: number;
  trongSo: number;
  loaiTienDo: LoaiTienDo;
  phanTramHoanThanh: number;
  daHoanThanh: boolean;
  hoanThanhLuc: string | null;
  trangThai: TrangThaiHangMuc;
  nguoiPhuTrach: { id: string; hoTen: string; email: string; soDienThoai: string | null } | null;
  hoanThanhBoi: { id: string; hoTen: string } | null;
  soTepDinhKem: number;
  /** Nút lá là nút không có phần tử nào trong mảng này. */
  hangMucCon: HangMucDTO[];
}
