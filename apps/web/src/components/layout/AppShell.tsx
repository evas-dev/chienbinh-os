import { useState, type ReactNode } from 'react';
import { ThanhDieuHuong, CAC_MUC_DIEU_HUONG } from './ThanhDieuHuong';
import { TrangThaiHeThong } from './TrangThaiHeThong';

interface Props {
  children?: ReactNode;
}

/**
 * Khung ngoài của toàn ứng dụng: thanh điều hướng trái + vùng nội dung phải.
 *
 * Bố cục theo đúng yêu cầu nghiệp vụ: phần TRÊN là quản lý công việc/hạng mục,
 * phần DƯỚI là bảng checklist tới hạn. Giai đoạn 0 mới dựng khung.
 */
export function AppShell({ children }: Props) {
  const [mucDangChon, setMucDangChon] = useState('tong-quan');

  const tenMuc =
    CAC_MUC_DIEU_HUONG.find((m) => m.khoa === mucDangChon)?.nhan ?? 'Tổng quan';

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Cột điều hướng */}
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

        <ThanhDieuHuong mucDangChon={mucDangChon} onChonMuc={setMucDangChon} />

        <div className="mt-auto border-t p-3">
          <TrangThaiHeThong />
        </div>
      </aside>

      {/* Vùng nội dung */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-lg font-semibold tracking-tight">{tenMuc}</h1>
          <span className="text-sm text-muted-foreground">
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
