import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { ThanhDieuHuong, CAC_MUC_DIEU_HUONG } from './ThanhDieuHuong';
import { TrangThaiHeThong } from './TrangThaiHeThong';

/**
 * Khung ngoài của toàn ứng dụng: thanh điều hướng trái + vùng nội dung phải.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const viTri = useLocation();

  // Trang chi tiết công việc không nằm trong menu; hiện tiêu đề riêng cho nó
  const mucHienTai = CAC_MUC_DIEU_HUONG.find((m) =>
    m.duongDan === '/' ? viTri.pathname === '/' : viTri.pathname.startsWith(m.duongDan),
  );
  const tieuDe = viTri.pathname.startsWith('/cong-viec/')
    ? 'Chi tiết công việc'
    : (mucHienTai?.nhan ?? 'Tổng quan');

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            QL
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Quản lý Công việc</div>
            <div className="text-xs text-muted-foreground">Bản chạy nội bộ</div>
          </div>
        </div>

        <ThanhDieuHuong />

        <div className="mt-auto border-t p-3">
          <TrangThaiHeThong />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-lg font-semibold tracking-tight">{tieuDe}</h1>
          <span className="hidden text-sm text-muted-foreground sm:block">
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
