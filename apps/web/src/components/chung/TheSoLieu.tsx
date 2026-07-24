import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  nhan: string;
  giaTri: number | string;
  icon: LucideIcon;
  /** Kiểu nhấn mạnh: cảnh báo dùng màu, còn lại để trung tính cho đỡ rối mắt. */
  kieu?: 'binh-thuong' | 'canh-bao' | 'sap-toi' | 'tot';
  onBam?: () => void;
}

const KIEU: Record<NonNullable<Props['kieu']>, { vien: string; so: string; icon: string }> = {
  'binh-thuong': { vien: 'border-slate-200', so: 'text-foreground', icon: 'text-slate-400' },
  'canh-bao': { vien: 'border-red-200 bg-red-50/50', so: 'text-red-600', icon: 'text-red-400' },
  'sap-toi': { vien: 'border-amber-200 bg-amber-50/50', so: 'text-amber-700', icon: 'text-amber-400' },
  tot: { vien: 'border-emerald-200 bg-emerald-50/50', so: 'text-emerald-700', icon: 'text-emerald-400' },
};

/** Thẻ số liệu ở đầu trang Tổng quan. Bấm được để áp bộ lọc tương ứng. */
export function TheSoLieu({ nhan, giaTri, icon: Icon, kieu = 'binh-thuong', onBam }: Props) {
  const mau = KIEU[kieu];

  return (
    <button
      type="button"
      onClick={onBam}
      disabled={!onBam}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-all',
        mau.vien,
        onBam && 'hover:shadow-sm cursor-pointer',
        !onBam && 'cursor-default',
      )}
    >
      <Icon className={cn('size-8 shrink-0', mau.icon)} aria-hidden />
      <div className="min-w-0">
        <div className={cn('text-2xl font-semibold tabular-nums leading-tight', mau.so)}>
          {giaTri}
        </div>
        <div className="truncate text-xs text-muted-foreground">{nhan}</div>
      </div>
    </button>
  );
}
