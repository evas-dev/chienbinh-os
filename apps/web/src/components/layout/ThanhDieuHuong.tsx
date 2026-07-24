import { NavLink } from 'react-router';
import { LayoutDashboard, FolderKanban, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Một mục trên thanh điều hướng chính. */
export interface MucDieuHuong {
  duongDan: string;
  nhan: string;
  icon: typeof LayoutDashboard;
}

export const CAC_MUC_DIEU_HUONG: MucDieuHuong[] = [
  { duongDan: '/', nhan: 'Tổng quan', icon: LayoutDashboard },
  { duongDan: '/cong-viec', nhan: 'Công việc', icon: FolderKanban },
  { duongDan: '/nhan-su', nhan: 'Nhân sự', icon: Users },
  { duongDan: '/cai-dat', nhan: 'Cài đặt', icon: Settings },
];

/**
 * Thanh điều hướng dọc bên trái, nối với react-router.
 * "Tổng quan" và "Công việc" cùng trỏ về trang chủ vì danh sách công việc nằm
 * ngay trên trang chủ; đánh dấu đang chọn theo đường dẫn chính xác.
 */
export function ThanhDieuHuong() {
  return (
    <nav aria-label="Điều hướng chính" className="flex flex-col gap-1 p-3">
      {CAC_MUC_DIEU_HUONG.map(({ duongDan, nhan, icon: Icon }) => (
        <NavLink
          key={duongDan}
          to={duongDan}
          end={duongDan === '/'}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
              'transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )
          }
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span>{nhan}</span>
        </NavLink>
      ))}
    </nav>
  );
}
