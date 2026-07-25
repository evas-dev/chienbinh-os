import { z } from 'zod';
import { TRANG_THAI_HANG_MUC } from '../constants/trang-thai.js';
import type { MucCanhBao } from '../constants/trang-thai.js';

/**
 * Tham số lọc cho bảng checklist tới hạn.
 *
 * Tất cả đều tùy chọn — không lọc gì thì trả toàn bộ hạng mục CÓ HẠN, sắp
 * theo hạn gần nhất. Ép kiểu chuỗi truy vấn về đúng kiểu ngay tại đây.
 */
export const locBangToiHanSchema = z.object({
  tuNgay: z.coerce.date().optional(),
  denNgay: z.coerce.date().optional(),
  nhanSuId: z.string().optional(),
  congViecId: z.string().optional(),
  trangThai: z.enum(TRANG_THAI_HANG_MUC).optional(),
  /** true = chỉ hiện việc chưa xong (mặc định của giao diện). */
  chuaXong: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  q: z.string().trim().optional(),
  trang: z.coerce.number().int().min(1).default(1),
  soDong: z.coerce.number().int().min(1).max(200).default(50),
});

export type LocBangToiHanInput = z.infer<typeof locBangToiHanSchema>;

/** Một dòng trong bảng tới hạn — đã phẳng và ghép sẵn mọi thứ cần hiển thị. */
export interface DongToiHanDTO {
  hangMucId: string;
  maHangMuc: string;
  tenHangMuc: string;
  congViecId: string;
  maCongViec: string;
  tenCongViec: string;
  hanHoanThanh: string;
  /** Tính ở tầng service theo giờ Việt Nam, KHÔNG lưu trong DB. */
  soNgayConLai: number;
  mucCanhBao: MucCanhBao;
  nguoiPhuTrach: {
    id: string;
    hoTen: string;
    email: string;
    soDienThoai: string | null;
  } | null;
  phanTramHoanThanh: number;
  trangThai: (typeof TRANG_THAI_HANG_MUC)[number];
  daHoanThanh: boolean;
  hoanThanhBoi: { hoTen: string } | null;
  ghiChu: string | null;
}

/** Số liệu tổng hợp trên TOÀN BỘ tập đã lọc, không phải chỉ trang hiện tại. */
export interface ThongKeToiHan {
  quaHan: number;
  denHanHomNay: number;
  sapToiHan: number;
  tongCong: number;
}

export interface KetQuaBangToiHan {
  duLieu: DongToiHanDTO[];
  tong: number;
  trang: number;
  soDong: number;
  thongKe: ThongKeToiHan;
}
