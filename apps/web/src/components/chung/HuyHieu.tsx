import {
  MAU_MUC_CANH_BAO,
  MAU_UU_TIEN,
  NHAN_TRANG_THAI_CONG_VIEC,
  NHAN_TRANG_THAI_HANG_MUC,
  NHAN_UU_TIEN,
  moTaSoNgayConLai,
  tinhSoNgayConLai,
  xepMucCanhBao,
  type MucDoUuTien,
  type TrangThaiCongViec,
  type TrangThaiHangMuc,
} from '@ceo/shared';
import { cn } from '@/lib/utils';

const NEN_HUY_HIEU =
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap';

export function HuyHieuUuTien({ muc }: { muc: MucDoUuTien }) {
  return <span className={cn(NEN_HUY_HIEU, MAU_UU_TIEN[muc])}>{NHAN_UU_TIEN[muc]}</span>;
}

const MAU_TRANG_THAI_CONG_VIEC: Record<TrangThaiCongViec, string> = {
  CHUA_BAT_DAU: 'bg-slate-100 text-slate-600 border-slate-200',
  DANG_LAM: 'bg-blue-100 text-blue-700 border-blue-200',
  TAM_DUNG: 'bg-orange-100 text-orange-700 border-orange-200',
  HOAN_THANH: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  HUY: 'bg-slate-100 text-slate-400 border-slate-200 line-through',
};

export function HuyHieuTrangThaiCongViec({ trangThai }: { trangThai: TrangThaiCongViec }) {
  return (
    <span className={cn(NEN_HUY_HIEU, MAU_TRANG_THAI_CONG_VIEC[trangThai])}>
      {NHAN_TRANG_THAI_CONG_VIEC[trangThai]}
    </span>
  );
}

const MAU_TRANG_THAI_HANG_MUC: Record<TrangThaiHangMuc, string> = {
  CHUA_BAT_DAU: 'bg-slate-100 text-slate-600 border-slate-200',
  DANG_LAM: 'bg-blue-100 text-blue-700 border-blue-200',
  CHO_XAC_NHAN: 'bg-violet-100 text-violet-700 border-violet-200',
  HOAN_THANH: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function HuyHieuTrangThaiHangMuc({ trangThai }: { trangThai: TrangThaiHangMuc }) {
  return (
    <span className={cn(NEN_HUY_HIEU, MAU_TRANG_THAI_HANG_MUC[trangThai])}>
      {NHAN_TRANG_THAI_HANG_MUC[trangThai]}
    </span>
  );
}

interface HuyHieuHanProps {
  hanHoanThanh: string | null;
  daHoanThanh: boolean;
  nguongVang?: number;
}

/**
 * Huy hiệu hạn chót — trái tim của toàn bộ hệ thống cảnh báo.
 *
 * Mức cảnh báo KHÔNG lấy từ máy chủ mà tính ngay tại đây theo ngày giờ Việt
 * Nam, dùng chung đúng hàm với backend. Nhờ vậy con số không bao giờ ôi thiu
 * dù người dùng để trình duyệt mở qua đêm.
 */
export function HuyHieuHan({ hanHoanThanh, daHoanThanh, nguongVang = 3 }: HuyHieuHanProps) {
  if (!hanHoanThanh) return null;

  const soNgay = tinhSoNgayConLai(new Date(hanHoanThanh));
  const muc = xepMucCanhBao(soNgay, nguongVang, daHoanThanh);

  // Việc đã xong thì không cần nhắc còn mấy ngày nữa
  if (daHoanThanh) return null;

  return (
    <span className={cn(NEN_HUY_HIEU, MAU_MUC_CANH_BAO[muc])}>{moTaSoNgayConLai(soNgay)}</span>
  );
}
