import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { NhanSuDTO } from '@ceo/shared';
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
import { LoiApi } from '@/lib/api-client';
import { useCapNhatNhanSu, useTaoNhanSu } from '@/hooks/use-nhan-su';

interface Props {
  moKhong: boolean;
  onDong: () => void;
  /** Có giá trị = đang sửa; bỏ trống = đang thêm mới. */
  nhanSu?: NhanSuDTO | null;
}

export function FormNhanSu({ moKhong, onDong, nhanSu }: Props) {
  const dangSua = Boolean(nhanSu);
  const taoNhanSu = useTaoNhanSu();
  const capNhatNhanSu = useCapNhatNhanSu();

  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [chucVu, setChucVu] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [loiTruong, setLoiTruong] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!moKhong) return;
    setLoiTruong({});
    setHoTen(nhanSu?.hoTen ?? '');
    setEmail(nhanSu?.email ?? '');
    setSoDienThoai(nhanSu?.soDienThoai ?? '');
    setChucVu(nhanSu?.chucVu ?? '');
    setGhiChu(nhanSu?.ghiChu ?? '');
  }, [moKhong, nhanSu]);

  const guiDi = async () => {
    setLoiTruong({});
    const duLieu = { hoTen, email, soDienThoai, chucVu, ghiChu };

    try {
      if (nhanSu) {
        await capNhatNhanSu.mutateAsync({ id: nhanSu.id, duLieu });
        toast.success('Đã cập nhật thông tin');
      } else {
        await taoNhanSu.mutateAsync(duLieu);
        toast.success('Đã thêm nhân sự');
      }
      onDong();
    } catch (loi) {
      if (loi instanceof LoiApi) {
        const map: Record<string, string> = {};
        for (const c of loi.chiTiet ?? []) map[c.truong] = c.thongBao;
        setLoiTruong(map);
        toast.error(loi.message);
      } else {
        toast.error('Không lưu được');
      }
    }
  };

  const dangGui = taoNhanSu.isPending || capNhatNhanSu.isPending;

  return (
    <Dialog open={moKhong} onOpenChange={(m) => !m && onDong()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dangSua ? 'Sửa thông tin nhân sự' : 'Thêm nhân sự'}</DialogTitle>
          <DialogDescription>
            Email dùng để gửi thư giao việc và đối chiếu khi nhân sự phản hồi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ns-hoten">Họ tên</Label>
            <Input
              id="ns-hoten"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Nguyễn Văn A"
              aria-invalid={Boolean(loiTruong.hoTen)}
            />
            {loiTruong.hoTen && <p className="text-xs text-red-600">{loiTruong.hoTen}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ns-email">Email</Label>
            <Input
              id="ns-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nguyenvana@congty.com"
              aria-invalid={Boolean(loiTruong.email)}
            />
            {loiTruong.email && <p className="text-xs text-red-600">{loiTruong.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ns-sdt">Số điện thoại</Label>
              <Input
                id="ns-sdt"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                placeholder="0912345678"
                aria-invalid={Boolean(loiTruong.soDienThoai)}
              />
              {loiTruong.soDienThoai && (
                <p className="text-xs text-red-600">{loiTruong.soDienThoai}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ns-chucvu">Chức vụ</Label>
              <Input
                id="ns-chucvu"
                value={chucVu}
                onChange={(e) => setChucVu(e.target.value)}
                placeholder="Trưởng phòng"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ns-ghichu">Ghi chú</Label>
            <Textarea
              id="ns-ghichu"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDong} disabled={dangGui}>
            Hủy
          </Button>
          <Button
            onClick={() => void guiDi()}
            disabled={dangGui || hoTen.trim().length < 2 || !email.trim()}
          >
            {dangGui ? 'Đang lưu…' : dangSua ? 'Lưu thay đổi' : 'Thêm nhân sự'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
