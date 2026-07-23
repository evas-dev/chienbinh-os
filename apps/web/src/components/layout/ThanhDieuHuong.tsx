import { LayoutDashboard, FolderKanban, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Một mục trên thanh điều hướng chính. */
export interface MucDieuHuong {
  khoa: string;
  nhan: string;
  icon: typeof LayoutDashboard;
}

export const CAC_MUC_DIEU_HUONG: MucDieuHuong[] = [
  { khoa: 'tong-quan', nhan: 'Tổng quan', icon: LayoutDashboard },
  { khoa: 'cong-viec', nhan: 'Công việc', icon: FolderKanban },
  { khoa: 'nhan-su', nhan: 'Nhân sự', icon: Users },
  { khoa: 'cai-dat', nhan: 'Cài đặt', icon: Settings },
];

interface Props {
  mucDangChon: string;
  onChonMuc: (khoa: string) => void;
}

/**
 * Thanh điều hướng dọc bên trái.
 *
 * Giai đoạn 0 mới chỉ đổi trạng thái tại chỗ; sẽ nối với react-router
 * ở giai đoạn 2 khi có các trang thật.
 */
export function ThanhDieuHuong({ mucDangChon, onChonMuc }: Props) {
  return (
    <nav aria-label="Điều hướng chính" className="flex flex-col gap-1 p-3">
      {CAC_MUC_DIEU_HUONG.map(({ khoa, nhan, icon: Icon }) => {
        const dangChon = khoa === mucDangChon;
        return (
          <button
            key={khoa}
            type="button"
            onClick={() => onChonMuc(khoa)}
            aria-current={dangChon ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
              'transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              dangChon
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{nhan}</span>
          </button>
        );
      })}
    </nav>
  );
}
