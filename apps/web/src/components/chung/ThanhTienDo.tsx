import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  phanTram: number;
  /** Đặt true cho nút cha: số này do hệ thống tính từ các hạng mục con. */
  laTuTinh?: boolean;
  kichThuoc?: 'nho' | 'vua';
  className?: string;
}

/**
 * Thanh tiến độ kèm số phần trăm.
 *
 * Nút cha hiện thêm biểu tượng ổ khóa để người dùng hiểu ngay vì sao sửa
 * không được, thay vì bấm mãi rồi thắc mắc.
 */
export function ThanhTienDo({ phanTram, laTuTinh, kichThuoc = 'vua', className }: Props) {
  const giaTri = Math.min(100, Math.max(0, phanTram));

  const mauThanh =
    giaTri === 100 ? 'bg-emerald-500' : giaTri > 0 ? 'bg-blue-500' : 'bg-slate-300';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'relative flex-1 overflow-hidden rounded-full bg-slate-150 bg-slate-200/70',
          kichThuoc === 'nho' ? 'h-1.5' : 'h-2',
        )}
        role="progressbar"
        aria-valuenow={giaTri}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Hoàn thành ${giaTri}%`}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', mauThanh)}
          style={{ width: `${giaTri}%` }}
        />
      </div>

      <span
        className={cn(
          'shrink-0 tabular-nums font-medium',
          kichThuoc === 'nho' ? 'text-xs' : 'text-sm',
          giaTri === 100 ? 'text-emerald-600' : 'text-muted-foreground',
        )}
      >
        {giaTri}%
      </span>

      {laTuTinh && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Lock className="size-3 shrink-0 text-muted-foreground/50" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Tự tính từ các hạng mục con</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
