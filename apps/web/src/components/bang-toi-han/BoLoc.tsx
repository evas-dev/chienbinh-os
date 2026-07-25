import { Search, X } from 'lucide-react';
import {
  NHAN_TRANG_THAI_HANG_MUC,
  TRANG_THAI_HANG_MUC,
  type CongViecDTO,
  type NhanSuDTO,
} from '@ceo/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { LocToiHan } from '@/hooks/use-bang-toi-han';

/** Giá trị đặc biệt cho mục "tất cả" trong dropdown (Select không nhận value rỗng). */
const TAT_CA = '__tat_ca__';

interface Props {
  loc: LocToiHan;
  onDoiLoc: (loc: Partial<LocToiHan>) => void;
  danhSachNhanSu: NhanSuDTO[];
  danhSachCongViec: CongViecDTO[];
}

/** Các nút lọc nhanh theo khoảng thời gian. */
const NUT_NHANH = [
  { khoa: 'sap-toi', nhan: '7 ngày tới + quá hạn' },
  { khoa: 'qua-han', nhan: 'Chỉ quá hạn' },
  { khoa: 'tat-ca', nhan: 'Tất cả' },
] as const;

export function BoLoc({ loc, onDoiLoc, danhSachNhanSu, danhSachCongViec }: Props) {
  const dangLoc =
    loc.nhanSuId || loc.congViecId || loc.trangThai || loc.q || loc.tuNgay || loc.denNgay;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Tìm kiếm */}
        <div className="relative min-w-56 flex-1">
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={loc.q ?? ''}
            onChange={(e) => onDoiLoc({ q: e.target.value })}
            placeholder="Tìm hạng mục, mã, công việc, người phụ trách…"
            className="pl-8"
          />
        </div>

        {/* Nhân sự */}
        <Select
          value={loc.nhanSuId ?? TAT_CA}
          onValueChange={(v) => onDoiLoc({ nhanSuId: v === TAT_CA ? undefined : v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Nhân sự" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TAT_CA}>Mọi nhân sự</SelectItem>
            {danhSachNhanSu.map((ns) => (
              <SelectItem key={ns.id} value={ns.id}>
                {ns.hoTen}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Công việc */}
        <Select
          value={loc.congViecId ?? TAT_CA}
          onValueChange={(v) => onDoiLoc({ congViecId: v === TAT_CA ? undefined : v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Công việc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TAT_CA}>Mọi công việc</SelectItem>
            {danhSachCongViec.map((cv) => (
              <SelectItem key={cv.id} value={cv.id}>
                {cv.ten}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Trạng thái */}
        <Select
          value={loc.trangThai ?? TAT_CA}
          onValueChange={(v) =>
            onDoiLoc({ trangThai: v === TAT_CA ? undefined : (v as LocToiHan['trangThai']) })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TAT_CA}>Mọi trạng thái</SelectItem>
            {TRANG_THAI_HANG_MUC.map((t) => (
              <SelectItem key={t} value={t}>
                {NHAN_TRANG_THAI_HANG_MUC[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {dangLoc && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onDoiLoc({
                nhanSuId: undefined,
                congViecId: undefined,
                trangThai: undefined,
                q: undefined,
                tuNgay: undefined,
                denNgay: undefined,
              })
            }
          >
            <X className="size-3.5" aria-hidden />
            Xóa lọc
          </Button>
        )}
      </div>

      {/* Nút lọc nhanh theo thời gian */}
      <div className="flex flex-wrap gap-1.5">
        {NUT_NHANH.map((n) => (
          <NutNhanh key={n.khoa} nhan={n.nhan} khoa={n.khoa} loc={loc} onDoiLoc={onDoiLoc} />
        ))}
      </div>
    </div>
  );
}

/** Một nút lọc nhanh; tự sáng khi khoảng thời gian tương ứng đang được áp. */
function NutNhanh({
  nhan,
  khoa,
  loc,
  onDoiLoc,
}: {
  nhan: string;
  khoa: string;
  loc: LocToiHan;
  onDoiLoc: (loc: Partial<LocToiHan>) => void;
}) {
  const dangChon = nhanDangChon(loc) === khoa;

  const ap = () => {
    const homNay = new Date();
    if (khoa === 'sap-toi') {
      const bayNgay = new Date();
      bayNgay.setDate(homNay.getDate() + 7);
      onDoiLoc({ denNgay: bayNgay.toISOString(), tuNgay: undefined, chuaXong: true });
    } else if (khoa === 'qua-han') {
      onDoiLoc({ denNgay: homNay.toISOString(), tuNgay: undefined, chuaXong: true });
    } else {
      onDoiLoc({ tuNgay: undefined, denNgay: undefined, chuaXong: undefined });
    }
  };

  return (
    <button
      type="button"
      onClick={ap}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        dangChon
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-slate-200 text-muted-foreground hover:bg-accent',
      )}
    >
      {nhan}
    </button>
  );
}

/** Suy ra nút nhanh nào đang được chọn dựa trên bộ lọc hiện tại. */
function nhanDangChon(loc: LocToiHan): string {
  if (!loc.tuNgay && !loc.denNgay) return 'tat-ca';
  if (loc.denNgay && loc.chuaXong) {
    const den = new Date(loc.denNgay);
    const homNay = new Date();
    const chenh = Math.round((den.getTime() - homNay.getTime()) / 86_400_000);
    if (chenh <= 0) return 'qua-han';
    return 'sap-toi';
  }
  return '';
}
