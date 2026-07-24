import { useState } from 'react';
import { toast } from 'sonner';
import type { NhanSuDTO } from '@ceo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoiApi } from '@/lib/api-client';
import { useTaoNhanSu } from '@/hooks/use-nhan-su';

interface Props {
  hoTenBanDau: string;
  onXong: (ns: NhanSuDTO) => void;
  onHuy: () => void;
}

/**
 * Biểu mẫu rút gọn nằm ngay trong popover chọn nhân sự.
 *
 * Chỉ hỏi ba trường tối thiểu để không cắt ngang mạch làm việc. Các thông tin
 * khác (chức vụ, ghi chú) bổ sung sau ở màn hình Nhân sự.
 */
export function FormTaoNhanh({ hoTenBanDau, onXong, onHuy }: Props) {
  const [hoTen, setHoTen] = useState(hoTenBanDau);
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const taoNhanSu = useTaoNhanSu();

  const guiDi = async () => {
    try {
      const ns = await taoNhanSu.mutateAsync({ hoTen, email, soDienThoai });
      toast.success(`Đã thêm ${ns.hoTen} vào danh bạ`);
      onXong(ns);
    } catch (loi) {
      toast.error(loi instanceof LoiApi ? loi.message : 'Không tạo được nhân sự');
    }
  };

  const hopLe = hoTen.trim().length >= 2 && email.trim().length > 0;

  return (
    <div className="space-y-3 p-3">
      <div className="text-sm font-medium">Thêm nhân sự mới</div>

      <div className="space-y-1.5">
        <Label htmlFor="ct-hoten" className="text-xs">
          Họ tên
        </Label>
        <Input
          id="ct-hoten"
          value={hoTen}
          onChange={(e) => setHoTen(e.target.value)}
          placeholder="Nguyễn Văn A"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ct-email" className="text-xs">
          Email
        </Label>
        <Input
          id="ct-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nguyenvana@congty.com"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hopLe) void guiDi();
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ct-sdt" className="text-xs">
          Số điện thoại <span className="text-muted-foreground">(không bắt buộc)</span>
        </Label>
        <Input
          id="ct-sdt"
          value={soDienThoai}
          onChange={(e) => setSoDienThoai(e.target.value)}
          placeholder="0912345678"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={() => void guiDi()}
          disabled={taoNhanSu.isPending || !hopLe}
          className="flex-1"
        >
          {taoNhanSu.isPending ? 'Đang lưu…' : 'Tạo và giao việc'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onHuy} disabled={taoNhanSu.isPending}>
          Hủy
        </Button>
      </div>
    </div>
  );
}
