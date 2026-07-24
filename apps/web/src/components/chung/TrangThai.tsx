import type { ReactNode } from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoiApi } from '@/lib/api-client';

/**
 * Ba trạng thái của mọi danh sách: đang tải, rỗng, lỗi.
 *
 * Dùng chung ở MỌI chỗ hiển thị danh sách để trải nghiệm nhất quán và để
 * không bao giờ có màn hình trắng không rõ chuyện gì đang xảy ra.
 */

export function DangTai({ soDong = 3 }: { soDong?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Đang tải dữ liệu">
      {Array.from({ length: soDong }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}

interface RongProps {
  tieuDe: string;
  moTa?: string;
  hanhDong?: ReactNode;
}

export function Rong({ tieuDe, moTa, hanhDong }: RongProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center">
      <Inbox className="mb-3 size-9 text-muted-foreground/40" aria-hidden />
      <p className="font-medium">{tieuDe}</p>
      {moTa && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{moTa}</p>}
      {hanhDong && <div className="mt-5">{hanhDong}</div>}
    </div>
  );
}

interface LoiProps {
  loi: unknown;
  onThuLai?: () => void;
}

export function Loi({ loi, onThuLai }: LoiProps) {
  const thongBao =
    loi instanceof LoiApi
      ? loi.message
      : loi instanceof Error
        ? loi.message
        : 'Đã xảy ra lỗi không xác định';

  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/60 px-6 py-12 text-center"
      role="alert"
    >
      <AlertCircle className="mb-3 size-9 text-red-500" aria-hidden />
      <p className="font-medium text-red-900">Không tải được dữ liệu</p>
      <p className="mt-1 max-w-md text-sm text-red-700">{thongBao}</p>
      {onThuLai && (
        <Button variant="outline" size="sm" onClick={onThuLai} className="mt-5">
          <RefreshCw className="size-3.5" aria-hidden />
          Thử lại
        </Button>
      )}
    </div>
  );
}

interface KhungDuLieuProps {
  dangTai: boolean;
  loi: unknown;
  rong: boolean;
  onThuLai?: () => void;
  khiRong: RongProps;
  soDongTai?: number;
  children: ReactNode;
}

/** Gói ba trạng thái vào một chỗ để component gọi không phải lặp lại điều kiện. */
export function KhungDuLieu({
  dangTai,
  loi,
  rong,
  onThuLai,
  khiRong,
  soDongTai,
  children,
}: KhungDuLieuProps) {
  if (dangTai) return <DangTai soDong={soDongTai} />;
  if (loi) return <Loi loi={loi} onThuLai={onThuLai} />;
  if (rong) return <Rong {...khiRong} />;
  return <>{children}</>;
}
