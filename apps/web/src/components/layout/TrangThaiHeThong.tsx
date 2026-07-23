import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type TrangThai = 'dang-kiem-tra' | 'ok' | 'loi';

interface PhanHoiSucKhoe {
  trangThai: string;
  database: string;
}

/**
 * Đèn báo kết nối tới máy chủ, hiện ở đáy thanh điều hướng.
 *
 * Mục đích: khi có sự cố, người dùng thấy ngay "mất kết nối máy chủ" thay vì
 * ngồi đoán tại sao dữ liệu không hiện. Cũng là cách xác nhận proxy /api
 * giữa frontend và backend hoạt động.
 */
export function TrangThaiHeThong() {
  const [trangThai, setTrangThai] = useState<TrangThai>('dang-kiem-tra');

  useEffect(() => {
    let conHieuLuc = true;

    const kiemTra = async () => {
      try {
        const res = await fetch('/api/suc-khoe');
        const data = (await res.json()) as PhanHoiSucKhoe;
        if (!conHieuLuc) return;
        setTrangThai(res.ok && data.database === 'da-ket-noi' ? 'ok' : 'loi');
      } catch {
        if (conHieuLuc) setTrangThai('loi');
      }
    };

    void kiemTra();
    const dinhKy = setInterval(() => void kiemTra(), 30_000);

    return () => {
      conHieuLuc = false;
      clearInterval(dinhKy);
    };
  }, []);

  const nhan: Record<TrangThai, string> = {
    'dang-kiem-tra': 'Đang kiểm tra…',
    ok: 'Máy chủ hoạt động',
    loi: 'Mất kết nối máy chủ',
  };

  const mauDen: Record<TrangThai, string> = {
    'dang-kiem-tra': 'bg-muted-foreground/40',
    ok: 'bg-emerald-500',
    loi: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1.5" role="status" aria-live="polite">
      <span className={cn('size-2 shrink-0 rounded-full', mauDen[trangThai])} aria-hidden />
      <span
        className={cn(
          'text-xs',
          trangThai === 'loi' ? 'font-medium text-red-600' : 'text-muted-foreground',
        )}
      >
        {nhan[trangThai]}
      </span>
    </div>
  );
}
