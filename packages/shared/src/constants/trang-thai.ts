/** Trạng thái tổng thể của một công việc. */
export const TRANG_THAI_CONG_VIEC = [
  'CHUA_BAT_DAU',
  'DANG_LAM',
  'TAM_DUNG',
  'HOAN_THANH',
  'HUY',
] as const;

export type TrangThaiCongViec = (typeof TRANG_THAI_CONG_VIEC)[number];

export const NHAN_TRANG_THAI_CONG_VIEC: Record<TrangThaiCongViec, string> = {
  CHUA_BAT_DAU: 'Chưa bắt đầu',
  DANG_LAM: 'Đang làm',
  TAM_DUNG: 'Tạm dừng',
  HOAN_THANH: 'Hoàn thành',
  HUY: 'Đã hủy',
};

/** Trạng thái của một hạng mục. */
export const TRANG_THAI_HANG_MUC = [
  'CHUA_BAT_DAU',
  'DANG_LAM',
  'CHO_XAC_NHAN',
  'HOAN_THANH',
] as const;

export type TrangThaiHangMuc = (typeof TRANG_THAI_HANG_MUC)[number];

export const NHAN_TRANG_THAI_HANG_MUC: Record<TrangThaiHangMuc, string> = {
  CHUA_BAT_DAU: 'Chưa bắt đầu',
  DANG_LAM: 'Đang làm',
  CHO_XAC_NHAN: 'Chờ xác nhận',
  HOAN_THANH: 'Hoàn thành',
};

/**
 * Cách theo dõi tiến độ của hạng mục.
 * CHECKBOX = xong/chưa xong · PHAN_TRAM = nhập % thủ công.
 */
export const LOAI_TIEN_DO = ['CHECKBOX', 'PHAN_TRAM'] as const;
export type LoaiTienDo = (typeof LOAI_TIEN_DO)[number];

export const NHAN_LOAI_TIEN_DO: Record<LoaiTienDo, string> = {
  CHECKBOX: 'Đánh dấu hoàn thành',
  PHAN_TRAM: 'Nhập phần trăm',
};

/**
 * Mức cảnh báo theo hạn — TÍNH LÚC ĐỌC, không lưu trong cơ sở dữ liệu.
 * Xem giải thích trong utils/ngay-thang.ts.
 */
export const MUC_CANH_BAO = ['QUA_HAN', 'HOM_NAY', 'SAP_TOI', 'BINH_THUONG'] as const;
export type MucCanhBao = (typeof MUC_CANH_BAO)[number];

export const NHAN_MUC_CANH_BAO: Record<MucCanhBao, string> = {
  QUA_HAN: 'Quá hạn',
  HOM_NAY: 'Đến hạn hôm nay',
  SAP_TOI: 'Sắp tới hạn',
  BINH_THUONG: 'Còn thời gian',
};

/** Chỉ dùng HAI màu cảnh báo. Thêm màu nữa là mất tác dụng cảnh báo. */
export const MAU_MUC_CANH_BAO: Record<MucCanhBao, string> = {
  QUA_HAN: 'bg-red-100 text-red-700 border-red-200',
  HOM_NAY: 'bg-amber-200 text-amber-900 border-amber-300',
  SAP_TOI: 'bg-amber-100 text-amber-700 border-amber-200',
  BINH_THUONG: 'bg-slate-100 text-slate-600 border-slate-200',
};
