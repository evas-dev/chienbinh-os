import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  NHAN_TRANG_THAI_CONG_VIEC,
  NHAN_UU_TIEN,
  TRANG_THAI_CONG_VIEC,
  MUC_DO_UU_TIEN,
  type CongViecDTO,
  type MucDoUuTien,
  type TrangThaiCongViec,
} from '@ceo/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { LoiApi } from '@/lib/api-client';
import { useCapNhatCongViec, useTaoCongViec } from '@/hooks/use-cong-viec';

interface Props {
  moKhong: boolean;
  onDong: () => void;
  /** Có giá trị = đang sửa; bỏ trống = đang tạo mới. */
  congViec?: CongViecDTO | null;
}

function homNay(): string {
  return new Date().toISOString().slice(0, 10);
}

function sauNgay(soNgay: number): string {
  const d = new Date();
  d.setDate(d.getDate() + soNgay);
  return d.toISOString().slice(0, 10);
}

/** Dùng chung cho cả tạo mới lẫn chỉnh sửa để hai luồng không bị lệch nhau. */
export function FormCongViec({ moKhong, onDong, congViec }: Props) {
  const dangSua = Boolean(congViec);
  const taoCongViec = useTaoCongViec();
  const capNhatCongViec = useCapNhatCongViec();

  const [ten, setTen] = useState('');
  const [moTa, setMoTa] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState(homNay());
  const [ngayKetThuc, setNgayKetThuc] = useState(sauNgay(30));
  const [uuTien, setUuTien] = useState<MucDoUuTien>('TRUNG_BINH');
  const [trangThai, setTrangThai] = useState<TrangThaiCongViec>('CHUA_BAT_DAU');
  const [loiTruong, setLoiTruong] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!moKhong) return;
    setLoiTruong({});
    if (congViec) {
      setTen(congViec.ten);
      setMoTa(congViec.moTa ?? '');
      setNgayBatDau(congViec.ngayBatDau.slice(0, 10));
      setNgayKetThuc(congViec.ngayKetThucDuKien.slice(0, 10));
      setUuTien(congViec.mucDoUuTien);
      setTrangThai(congViec.trangThai);
    } else {
      setTen('');
      setMoTa('');
      setNgayBatDau(homNay());
      setNgayKetThuc(sauNgay(30));
      setUuTien('TRUNG_BINH');
      setTrangThai('CHUA_BAT_DAU');
    }
  }, [moKhong, congViec]);

  const guiDi = async () => {
    setLoiTruong({});
    const duLieu = {
      ten,
      moTa,
      ngayBatDau: new Date(ngayBatDau),
      ngayKetThucDuKien: new Date(ngayKetThuc),
      mucDoUuTien: uuTien,
      trangThai,
    };

    try {
      if (congViec) {
        await capNhatCongViec.mutateAsync({ id: congViec.id, duLieu });
        toast.success('Đã cập nhật công việc');
      } else {
        await taoCongViec.mutateAsync(duLieu);
        toast.success('Đã tạo công việc mới');
      }
      onDong();
    } catch (loi) {
      if (loi instanceof LoiApi) {
        // Gắn lỗi vào đúng ô nhập để người dùng thấy ngay chỗ sai
        const map: Record<string, string> = {};
        for (const c of loi.chiTiet ?? []) map[c.truong] = c.thongBao;
        setLoiTruong(map);
        toast.error(loi.message);
      } else {
        toast.error('Không lưu được công việc');
      }
    }
  };

  const dangGui = taoCongViec.isPending || capNhatCongViec.isPending;

  return (
    <Dialog open={moKhong} onOpenChange={(m) => !m && onDong()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dangSua ? 'Sửa công việc' : 'Tạo công việc mới'}</DialogTitle>
          <DialogDescription>
            {dangSua
              ? 'Cập nhật thông tin chung của công việc.'
              : 'Sau khi tạo, bạn thêm các hạng mục bên trong công việc này.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cv-ten">Tên công việc</Label>
            <Input
              id="cv-ten"
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              placeholder="Ví dụ: Xây dựng nhà xưởng số 2"
              aria-invalid={Boolean(loiTruong.ten)}
            />
            {loiTruong.ten && <p className="text-xs text-red-600">{loiTruong.ten}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cv-batdau">Ngày bắt đầu</Label>
              <Input
                id="cv-batdau"
                type="date"
                value={ngayBatDau}
                onChange={(e) => setNgayBatDau(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cv-ketthuc">Kết thúc dự kiến</Label>
              <Input
                id="cv-ketthuc"
                type="date"
                value={ngayKetThuc}
                onChange={(e) => setNgayKetThuc(e.target.value)}
                aria-invalid={Boolean(loiTruong.ngayKetThucDuKien)}
              />
              {loiTruong.ngayKetThucDuKien && (
                <p className="text-xs text-red-600">{loiTruong.ngayKetThucDuKien}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mức độ ưu tiên</Label>
              <Select value={uuTien} onValueChange={(v) => setUuTien(v as MucDoUuTien)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUC_DO_UU_TIEN.map((m) => (
                    <SelectItem key={m} value={m}>
                      {NHAN_UU_TIEN[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select
                value={trangThai}
                onValueChange={(v) => setTrangThai(v as TrangThaiCongViec)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANG_THAI_CONG_VIEC.map((t) => (
                    <SelectItem key={t} value={t}>
                      {NHAN_TRANG_THAI_CONG_VIEC[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cv-mota">Mô tả</Label>
            <Textarea
              id="cv-mota"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              rows={3}
              placeholder="Mô tả ngắn gọn phạm vi công việc…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDong} disabled={dangGui}>
            Hủy
          </Button>
          <Button onClick={() => void guiDi()} disabled={dangGui || ten.trim().length < 3}>
            {dangGui ? 'Đang lưu…' : dangSua ? 'Lưu thay đổi' : 'Tạo công việc'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
