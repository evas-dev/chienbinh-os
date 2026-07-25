import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { dinhDangNgayVN, type CongViecDTO, type HangMucDTO } from '@ceo/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { KhungDuLieu, Rong } from '@/components/chung/TrangThai';
import { HuyHieuTrangThaiCongViec, HuyHieuUuTien } from '@/components/chung/HuyHieu';
import { ThanhTienDo } from '@/components/chung/ThanhTienDo';
import { DialogXacNhanXoa } from '@/components/chung/DialogXacNhanXoa';
import { CayHangMuc } from '@/components/hang-muc/CayHangMuc';
import { FormHangMuc } from '@/components/hang-muc/FormHangMuc';
import { NganKeoChiTiet } from '@/components/hang-muc/NganKeoChiTiet';
import { FormCongViec } from '@/components/cong-viec/FormCongViec';
import {
  useAnhHuongKhiXoaCongViec,
  useChiTietCongViec,
  useXoaCongViec,
} from '@/hooks/use-cong-viec';
import { useAnhHuongKhiXoaHangMuc, useXoaHangMuc } from '@/hooks/use-hang-muc';
import { useCauHinh } from '@/hooks/use-cau-hinh';

export function ChiTietCongViec() {
  const { id } = useParams<{ id: string }>();
  const dieuHuong = useNavigate();

  const { data: congViec, isLoading, error, refetch } = useChiTietCongViec(id);
  const { data: cauHinh } = useCauHinh();
  const nguongVang = cauHinh?.NGUONG_CANH_BAO_VANG ?? 3;

  const [hangMucDangXem, setHangMucDangXem] = useState<string | null>(null);
  const [chaChoHangMucMoi, setChaChoHangMucMoi] = useState<string | null | undefined>(undefined);
  const [moSuaCongViec, setMoSuaCongViec] = useState(false);
  const [xoaCongViecMo, setXoaCongViecMo] = useState(false);
  const [hangMucSapXoa, setHangMucSapXoa] = useState<HangMucDTO | null>(null);

  const xoaCongViec = useXoaCongViec();
  const xoaHangMuc = useXoaHangMuc(id);
  const anhHuongCongViec = useAnhHuongKhiXoaCongViec(id, xoaCongViecMo);
  const anhHuongHangMuc = useAnhHuongKhiXoaHangMuc(hangMucSapXoa?.id, Boolean(hangMucSapXoa));

  const thucHienXoaCongViec = async () => {
    if (!id) return;
    try {
      await xoaCongViec.mutateAsync(id);
      toast.success('Đã xóa công việc');
      dieuHuong('/');
    } catch {
      toast.error('Không xóa được công việc');
    }
  };

  const thucHienXoaHangMuc = async () => {
    if (!hangMucSapXoa) return;
    try {
      await xoaHangMuc.mutateAsync(hangMucSapXoa.id);
      toast.success('Đã xóa hạng mục');
      setHangMucSapXoa(null);
    } catch {
      toast.error('Không xóa được hạng mục');
    }
  };

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => dieuHuong('/')} className="-ml-2">
        <ArrowLeft className="size-4" aria-hidden />
        Về Tổng quan
      </Button>

      <KhungDuLieu
        dangTai={isLoading}
        loi={error}
        rong={false}
        onThuLai={() => void refetch()}
        khiRong={{ tieuDe: 'Không tìm thấy công việc' }}
      >
        {congViec && (
          <>
            <Card>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{congViec.ten}</h2>
                      <HuyHieuUuTien muc={congViec.mucDoUuTien} />
                      <HuyHieuTrangThaiCongViec trangThai={congViec.trangThai} />
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{congViec.ma}</p>
                    {congViec.moTa && (
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        {congViec.moTa}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setMoSuaCongViec(true)}>
                      <Pencil className="size-3.5" aria-hidden />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setXoaCongViecMo(true)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Xóa
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap items-center gap-6">
                  <div className="min-w-48 flex-1">
                    <div className="mb-1.5 text-xs text-muted-foreground">Tiến độ tổng</div>
                    <ThanhTienDo phanTram={congViec.phanTramHoanThanh} laTuTinh />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Thời gian</div>
                    <div className="mt-1 text-sm tabular-nums">
                      {dinhDangNgayVN(new Date(congViec.ngayBatDau))} –{' '}
                      {dinhDangNgayVN(new Date(congViec.ngayKetThucDuKien))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Các hạng mục</h3>
                <Button size="sm" onClick={() => setChaChoHangMucMoi(null)}>
                  <Plus className="size-4" aria-hidden />
                  Thêm hạng mục
                </Button>
              </div>

              {congViec.cayHangMuc.length === 0 ? (
                <Rong
                  tieuDe="Chưa có hạng mục nào"
                  moTa="Chia nhỏ công việc thành các hạng mục để theo dõi tiến độ chi tiết."
                  hanhDong={
                    <Button onClick={() => setChaChoHangMucMoi(null)}>
                      <Plus className="size-4" aria-hidden />
                      Thêm hạng mục
                    </Button>
                  }
                />
              ) : (
                <CayHangMuc
                  danhSach={congViec.cayHangMuc}
                  congViecId={congViec.id}
                  nguongVang={nguongVang}
                  onMoChiTiet={setHangMucDangXem}
                  onThemCon={(chaId) => setChaChoHangMucMoi(chaId)}
                  onXoa={setHangMucSapXoa}
                />
              )}
            </section>

            <FormCongViec
              moKhong={moSuaCongViec}
              onDong={() => setMoSuaCongViec(false)}
              congViec={congViec as unknown as CongViecDTO}
            />

            <FormHangMuc
              moKhong={chaChoHangMucMoi !== undefined}
              onDong={() => setChaChoHangMucMoi(undefined)}
              congViecId={congViec.id}
              hangMucChaId={chaChoHangMucMoi ?? null}
            />

            <NganKeoChiTiet
              hangMucId={hangMucDangXem}
              congViecId={congViec.id}
              onDong={() => setHangMucDangXem(null)}
            />

            <DialogXacNhanXoa
              moKhong={xoaCongViecMo}
              onDoiTrangThai={setXoaCongViecMo}
              tenMuc={congViec.ten}
              soHangMucCon={anhHuongCongViec.data?.soHangMuc}
              soTepDinhKem={anhHuongCongViec.data?.soTepDinhKem}
              dangXoa={xoaCongViec.isPending}
              onXacNhan={() => void thucHienXoaCongViec()}
            />

            <DialogXacNhanXoa
              moKhong={Boolean(hangMucSapXoa)}
              onDoiTrangThai={(m) => !m && setHangMucSapXoa(null)}
              tenMuc={hangMucSapXoa?.ten ?? ''}
              soHangMucCon={anhHuongHangMuc.data?.soHangMucCon}
              soTepDinhKem={anhHuongHangMuc.data?.soTepDinhKem}
              dangXoa={xoaHangMuc.isPending}
              onXacNhan={() => void thucHienXoaHangMuc()}
            />
          </>
        )}
      </KhungDuLieu>
    </div>
  );
}
