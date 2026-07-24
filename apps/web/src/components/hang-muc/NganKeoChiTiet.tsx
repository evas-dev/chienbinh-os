import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { LoaiTienDo } from '@ceo/shared';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChonNhanSu } from '@/components/nhan-su/ChonNhanSu';
import { ThanhTienDo } from '@/components/chung/ThanhTienDo';
import { DangTai, Loi } from '@/components/chung/TrangThai';
import { KhungTepDinhKem } from './KhungTepDinhKem';
import { useCapNhatHangMuc, useChiTietHangMuc, useGanPhuTrach } from '@/hooks/use-hang-muc';

interface Props {
  hangMucId: string | null;
  congViecId: string;
  onDong: () => void;
}

/** Chuyển Date sang chuỗi yyyy-mm-dd cho ô nhập ngày của trình duyệt. */
function choONhapNgay(iso: string | null): string {
  return iso ? new Date(iso).toISOString().slice(0, 10) : '';
}

/**
 * Ngăn kéo chi tiết hạng mục, trượt ra từ bên phải.
 *
 * Gồm: thông tin sửa được tại chỗ, người phụ trách, và danh sách tệp đính kèm.
 * Chỗ trống cho nhật ký email sẽ được lấp ở giai đoạn 4.
 */
export function NganKeoChiTiet({ hangMucId, congViecId, onDong }: Props) {
  const { data: hangMuc, isLoading, error, refetch } = useChiTietHangMuc(hangMucId ?? undefined);
  const capNhat = useCapNhatHangMuc(congViecId);
  const ganPhuTrach = useGanPhuTrach(congViecId);

  const [ten, setTen] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [han, setHan] = useState('');
  const [loaiTienDo, setLoaiTienDo] = useState<LoaiTienDo>('CHECKBOX');

  // Nạp lại giá trị mỗi khi mở hạng mục khác
  useEffect(() => {
    if (!hangMuc) return;
    setTen(hangMuc.ten);
    setGhiChu(hangMuc.ghiChu ?? '');
    setHan(choONhapNgay(hangMuc.hanHoanThanh));
    setLoaiTienDo(hangMuc.loaiTienDo);
  }, [hangMuc]);

  const luu = async () => {
    if (!hangMucId) return;
    try {
      await capNhat.mutateAsync({
        id: hangMucId,
        duLieu: {
          ten,
          ghiChu,
          hanHoanThanh: han ? new Date(han) : null,
          loaiTienDo,
        },
      });
      toast.success('Đã lưu thay đổi');
    } catch {
      toast.error('Không lưu được thay đổi');
    }
  };

  return (
    <Sheet open={Boolean(hangMucId)} onOpenChange={(m) => !m && onDong()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {isLoading ? (
          <div className="p-6">
            <DangTai soDong={4} />
          </div>
        ) : error ? (
          <div className="p-6">
            <Loi loi={error} onThuLai={() => void refetch()} />
          </div>
        ) : hangMuc ? (
          <>
            <SheetHeader>
              <SheetTitle className="pr-6">{hangMuc.ten}</SheetTitle>
              <SheetDescription className="font-mono">{hangMuc.ma}</SheetDescription>
            </SheetHeader>

            <div className="space-y-5 px-4 pb-8">
              <div>
                <Label className="mb-2 block text-xs">Tiến độ</Label>
                <ThanhTienDo
                  phanTram={hangMuc.phanTramHoanThanh}
                  laTuTinh={hangMuc.hangMucCon.length > 0}
                />
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label htmlFor="ck-ten">Tên hạng mục</Label>
                <Input id="ck-ten" value={ten} onChange={(e) => setTen(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ck-han">Hạn hoàn thành</Label>
                <Input
                  id="ck-han"
                  type="date"
                  value={han}
                  onChange={(e) => setHan(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Cách theo dõi tiến độ</Label>
                <Select
                  value={loaiTienDo}
                  onValueChange={(v) => setLoaiTienDo(v as LoaiTienDo)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHECKBOX">Đánh dấu hoàn thành</SelectItem>
                    <SelectItem value="PHAN_TRAM">Nhập phần trăm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Người phụ trách</Label>
                <ChonNhanSu
                  giaTri={hangMuc.nguoiPhuTrach?.id ?? null}
                  onChon={(id) => {
                    if (!hangMucId) return;
                    ganPhuTrach.mutate(
                      { id: hangMucId, nguoiPhuTrachId: id },
                      {
                        onSuccess: () => toast.success('Đã cập nhật người phụ trách'),
                        onError: () => toast.error('Không gán được người phụ trách'),
                      },
                    );
                  }}
                  chieuRongDay
                />
                {hangMuc.nguoiPhuTrach && (
                  <p className="text-xs text-muted-foreground">
                    {hangMuc.nguoiPhuTrach.email}
                    {hangMuc.nguoiPhuTrach.soDienThoai && ` · ${hangMuc.nguoiPhuTrach.soDienThoai}`}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ck-ghichu">Ghi chú</Label>
                <Textarea
                  id="ck-ghichu"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú thêm về hạng mục này…"
                />
              </div>

              <Button onClick={() => void luu()} disabled={capNhat.isPending} className="w-full">
                {capNhat.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
              </Button>

              <Separator />

              <div>
                <Label className="mb-2.5 block">Tệp đính kèm</Label>
                {hangMucId && <KhungTepDinhKem hangMucId={hangMucId} />}
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
