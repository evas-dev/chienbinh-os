import { useNavigate } from 'react-router';
import { dinhDangNgayVN, moTaSoNgayConLai, type DongToiHanDTO } from '@ceo/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ThanhTienDo } from '@/components/chung/ThanhTienDo';

/** Nền và chữ cho từng mức cảnh báo — chỉ hai màu cảnh báo: đỏ và vàng. */
const NEN_DONG: Record<DongToiHanDTO['mucCanhBao'], string> = {
  QUA_HAN: 'bg-red-50/70 hover:bg-red-50',
  HOM_NAY: 'bg-amber-100/60 hover:bg-amber-100',
  SAP_TOI: 'bg-amber-50/60 hover:bg-amber-50',
  BINH_THUONG: '',
};

const CHU_CANH_BAO: Record<DongToiHanDTO['mucCanhBao'], string> = {
  QUA_HAN: 'text-red-600 font-medium',
  HOM_NAY: 'text-amber-700 font-medium',
  SAP_TOI: 'text-amber-600',
  BINH_THUONG: 'text-muted-foreground',
};

export function BangToiHan({ duLieu }: { duLieu: DongToiHanDTO[] }) {
  const dieuHuong = useNavigate();

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-52">Hạng mục</TableHead>
            <TableHead className="min-w-40">Công việc</TableHead>
            <TableHead className="min-w-32">Hạn</TableHead>
            <TableHead className="min-w-36">Người phụ trách</TableHead>
            <TableHead className="min-w-32">Tiến độ</TableHead>
            <TableHead className="min-w-28">Hoàn thành bởi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {duLieu.map((d) => (
            <TableRow
              key={d.hangMucId}
              className={cn(d.daHoanThanh ? 'opacity-55' : NEN_DONG[d.mucCanhBao])}
            >
              <TableCell>
                <div className={cn('font-medium', d.daHoanThanh && 'line-through')}>
                  {d.tenHangMuc}
                </div>
                <div className="font-mono text-xs text-muted-foreground">{d.maHangMuc}</div>
              </TableCell>

              <TableCell>
                <button
                  type="button"
                  onClick={() => dieuHuong(`/cong-viec/${d.congViecId}`)}
                  className="text-left text-sm text-primary underline-offset-2 hover:underline"
                >
                  {d.tenCongViec}
                </button>
              </TableCell>

              <TableCell>
                <div className="text-sm tabular-nums">
                  {dinhDangNgayVN(new Date(d.hanHoanThanh))}
                </div>
                <div className={cn('text-xs', CHU_CANH_BAO[d.mucCanhBao])}>
                  {d.daHoanThanh ? 'Đã xong' : moTaSoNgayConLai(d.soNgayConLai)}
                </div>
              </TableCell>

              <TableCell>
                {d.nguoiPhuTrach ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default text-sm">{d.nguoiPhuTrach.hoTen}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>{d.nguoiPhuTrach.email}</div>
                      {d.nguoiPhuTrach.soDienThoai && <div>{d.nguoiPhuTrach.soDienThoai}</div>}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-sm text-muted-foreground/60">Chưa giao</span>
                )}
              </TableCell>

              <TableCell>
                <ThanhTienDo phanTram={d.phanTramHoanThanh} kichThuoc="nho" />
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {d.hoanThanhBoi?.hoTen ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
