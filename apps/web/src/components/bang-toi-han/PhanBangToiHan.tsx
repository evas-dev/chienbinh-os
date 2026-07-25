import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { ThongKeToiHan } from '@ceo/shared';
import { Button } from '@/components/ui/button';
import { KhungDuLieu } from '@/components/chung/TrangThai';
import { useBangToiHan, type LocToiHan } from '@/hooks/use-bang-toi-han';
import { useDanhSachNhanSu } from '@/hooks/use-nhan-su';
import { useDanhSachCongViec } from '@/hooks/use-cong-viec';
import { BoLoc } from './BoLoc';
import { BangToiHan } from './BangToiHan';

interface Props {
  onThongKe?: (tk: ThongKeToiHan) => void;
}

/** Đọc bộ lọc từ URL để F5 hoặc chia sẻ link vẫn giữ nguyên bộ lọc. */
function docLocTuUrl(sp: URLSearchParams): LocToiHan {
  const chuaXong = sp.get('chuaXong');
  return {
    nhanSuId: sp.get('nhanSuId') ?? undefined,
    congViecId: sp.get('congViecId') ?? undefined,
    trangThai: (sp.get('trangThai') as LocToiHan['trangThai']) ?? undefined,
    q: sp.get('q') ?? undefined,
    tuNgay: sp.get('tuNgay') ?? undefined,
    denNgay: sp.get('denNgay') ?? undefined,
    chuaXong: chuaXong === null ? undefined : chuaXong === 'true',
    trang: sp.get('trang') ? Number(sp.get('trang')) : 1,
  };
}

/**
 * Bảng checklist tới hạn — phần DƯỚI của trang Tổng quan theo yêu cầu nghiệp vụ.
 *
 * Bộ lọc được cất vào URL nên CEO bookmark được "việc quá hạn của anh Tuấn",
 * F5 không mất. Mặc định vào trang: 7 ngày tới + quá hạn, đúng thứ cần thấy đầu
 * tiên chứ không phải toàn bộ danh sách.
 */
export function PhanBangToiHan({ onThongKe }: Props) {
  const [sp, setSp] = useSearchParams();
  const [tuKhoa, setTuKhoa] = useState(sp.get('q') ?? '');

  const loc = useMemo(() => docLocTuUrl(sp), [sp]);

  const { data: nhanSu = [] } = useDanhSachNhanSu();
  const { data: congViec = [] } = useDanhSachCongViec();
  const { data, isLoading, error, refetch, isPlaceholderData } = useBangToiHan(loc);

  // Đẩy thống kê lên cho 4 thẻ số liệu ở đầu trang
  useEffect(() => {
    if (data?.thongKe) onThongKe?.(data.thongKe);
  }, [data?.thongKe, onThongKe]);

  /** Ghi bộ lọc vào URL. Bỏ giá trị rỗng để URL không lởm chởm. */
  const doiLoc = (moi: Partial<LocToiHan>) => {
    const gop = { ...loc, ...moi, trang: 1 };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(gop)) {
      if (v === undefined || v === '' || (k === 'trang' && v === 1)) continue;
      params.set(k, String(v));
    }
    setSp(params, { replace: true });
  };

  // Debounce ô tìm kiếm 300ms để không gọi API theo từng ký tự
  useEffect(() => {
    const id = setTimeout(() => {
      if ((sp.get('q') ?? '') !== tuKhoa) doiLoc({ q: tuKhoa || undefined });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tuKhoa]);

  const tongTrang = data ? Math.ceil(data.tong / data.soDong) : 1;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Việc theo hạn</h2>
        {data && (
          <span className="text-sm text-muted-foreground">
            {data.tong} hạng mục{isPlaceholderData ? ' · đang lọc…' : ''}
          </span>
        )}
      </div>

      <BoLoc
        loc={{ ...loc, q: tuKhoa }}
        onDoiLoc={(m) => {
          if ('q' in m) setTuKhoa(m.q ?? '');
          else doiLoc(m);
        }}
        danhSachNhanSu={nhanSu}
        danhSachCongViec={congViec}
      />

      <KhungDuLieu
        dangTai={isLoading}
        loi={error}
        rong={(data?.duLieu ?? []).length === 0}
        onThuLai={() => void refetch()}
        khiRong={{
          tieuDe: 'Không có hạng mục nào khớp bộ lọc',
          moTa: 'Thử nới lỏng điều kiện lọc hoặc bấm "Tất cả".',
        }}
      >
        <BangToiHan duLieu={data?.duLieu ?? []} />

        {tongTrang > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loc.trang! <= 1}
              onClick={() => setSp(ganTrang(sp, loc.trang! - 1), { replace: true })}
            >
              Trang trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {loc.trang} / {tongTrang}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={loc.trang! >= tongTrang}
              onClick={() => setSp(ganTrang(sp, loc.trang! + 1), { replace: true })}
            >
              Trang sau
            </Button>
          </div>
        )}
      </KhungDuLieu>
    </section>
  );
}

function ganTrang(sp: URLSearchParams, trang: number): URLSearchParams {
  const moi = new URLSearchParams(sp);
  if (trang <= 1) moi.delete('trang');
  else moi.set('trang', String(trang));
  return moi;
}
