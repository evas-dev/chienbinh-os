import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { LoaiTienDo } from '@ceo/shared';
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
import { ChonNhanSu } from '@/components/nhan-su/ChonNhanSu';
import { LoiApi } from '@/lib/api-client';
import { useTaoHangMuc } from '@/hooks/use-hang-muc';

interface Props {
  moKhong: boolean;
  onDong: () => void;
  congViecId: string;
  /** Có giá trị = tạo hạng mục con của nút này; rỗng = tạo hạng mục gốc. */
  hangMucChaId: string | null;
  tenCha?: string;
}

export function FormHangMuc({ moKhong, onDong, congViecId, hangMucChaId, tenCha }: Props) {
  const taoHangMuc = useTaoHangMuc();

  const [ten, setTen] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [han, setHan] = useState('');
  const [loaiTienDo, setLoaiTienDo] = useState<LoaiTienDo>('CHECKBOX');
  const [nguoiPhuTrachId, setNguoiPhuTrachId] = useState<string | null>(null);

  useEffect(() => {
    if (!moKhong) return;
    setTen('');
    setGhiChu('');
    setHan('');
    setLoaiTienDo('CHECKBOX');
    setNguoiPhuTrachId(null);
  }, [moKhong]);

  const guiDi = async () => {
    try {
      await taoHangMuc.mutateAsync({
        congViecId,
        hangMucChaId,
        ten,
        ghiChu,
        hanHoanThanh: han ? new Date(han) : null,
        nguoiPhuTrachId,
        loaiTienDo,
      });
      toast.success('Đã thêm hạng mục');
      onDong();
    } catch (loi) {
      toast.error(loi instanceof LoiApi ? loi.message : 'Không thêm được hạng mục');
    }
  };

  return (
    <Dialog open={moKhong} onOpenChange={(m) => !m && onDong()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{hangMucChaId ? 'Thêm hạng mục con' : 'Thêm hạng mục'}</DialogTitle>
          <DialogDescription>
            {tenCha
              ? `Nằm bên trong “${tenCha}”. Trọng số sẽ được chia đều lại cho cả nhóm.`
              : 'Trọng số sẽ được chia đều lại cho các hạng mục cùng cấp.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hm-ten">Tên hạng mục</Label>
            <Input
              id="hm-ten"
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              placeholder="Ví dụ: Đổ bê tông móng"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hm-han">Hạn hoàn thành</Label>
              <Input
                id="hm-han"
                type="date"
                value={han}
                onChange={(e) => setHan(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Theo dõi bằng</Label>
              <Select value={loaiTienDo} onValueChange={(v) => setLoaiTienDo(v as LoaiTienDo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHECKBOX">Đánh dấu xong</SelectItem>
                  <SelectItem value="PHAN_TRAM">Nhập phần trăm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Người phụ trách</Label>
            <ChonNhanSu giaTri={nguoiPhuTrachId} onChon={setNguoiPhuTrachId} chieuRongDay />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hm-ghichu">Ghi chú</Label>
            <Textarea
              id="hm-ghichu"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDong} disabled={taoHangMuc.isPending}>
            Hủy
          </Button>
          <Button
            onClick={() => void guiDi()}
            disabled={taoHangMuc.isPending || ten.trim().length < 2}
          >
            {taoHangMuc.isPending ? 'Đang thêm…' : 'Thêm hạng mục'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
