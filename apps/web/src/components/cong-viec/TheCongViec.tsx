import { AlertTriangle, CalendarDays, ListChecks } from 'lucide-react';
import { dinhDangNgayVN, type CongViecDTO } from '@ceo/shared';
import { Card, CardContent } from '@/components/ui/card';
import { HuyHieuTrangThaiCongViec, HuyHieuUuTien } from '@/components/chung/HuyHieu';
import { ThanhTienDo } from '@/components/chung/ThanhTienDo';

interface Props {
  congViec: CongViecDTO;
  onMo: (id: string) => void;
}

/** Thẻ tóm tắt một công việc trên trang Tổng quan. */
export function TheCongViec({ congViec, onMo }: Props) {
  return (
    <Card
      onClick={() => onMo(congViec.id)}
      className="cursor-pointer transition-all hover:border-slate-300 hover:shadow-md"
    >
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{congViec.ten}</h3>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{congViec.ma}</p>
          </div>
          <HuyHieuUuTien muc={congViec.mucDoUuTien} />
        </div>

        <ThanhTienDo phanTram={congViec.phanTramHoanThanh} laTuTinh />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <HuyHieuTrangThaiCongViec trangThai={congViec.trangThai} />

          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" aria-hidden />
            {dinhDangNgayVN(new Date(congViec.ngayBatDau))} –{' '}
            {dinhDangNgayVN(new Date(congViec.ngayKetThucDuKien))}
          </span>

          <span className="flex items-center gap-1">
            <ListChecks className="size-3" aria-hidden />
            {congViec.soHangMuc} hạng mục
          </span>

          {congViec.soHangMucQuaHan > 0 && (
            <span className="flex items-center gap-1 font-medium text-red-600">
              <AlertTriangle className="size-3" aria-hidden />
              {congViec.soHangMucQuaHan} quá hạn
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
