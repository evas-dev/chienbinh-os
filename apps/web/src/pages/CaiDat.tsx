import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCapNhatCauHinh, useCauHinh } from '@/hooks/use-cau-hinh';

/**
 * Trang Cài đặt.
 * Giai đoạn 4 sẽ thêm phần kết nối email và công tắc gửi mail tự động.
 */
export function CaiDat() {
  const { data: cauHinh, isLoading } = useCauHinh();
  const capNhat = useCapNhatCauHinh();
  const [nguong, setNguong] = useState('3');

  useEffect(() => {
    if (cauHinh) setNguong(String(cauHinh.NGUONG_CANH_BAO_VANG));
  }, [cauHinh]);

  const luu = async () => {
    const so = Number.parseInt(nguong, 10);
    if (Number.isNaN(so) || so < 1 || so > 60) {
      toast.error('Ngưỡng cảnh báo phải là số từ 1 đến 60 ngày');
      return;
    }
    try {
      await capNhat.mutateAsync({ NGUONG_CANH_BAO_VANG: so });
      toast.success('Đã lưu cài đặt');
    } catch {
      toast.error('Không lưu được cài đặt');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cảnh báo hạn chót</CardTitle>
          <CardDescription>
            Số ngày trước hạn để bắt đầu tô màu vàng cảnh báo trong bảng việc theo hạn. Việc quá
            hạn luôn tô đỏ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nguong">Ngưỡng cảnh báo vàng (ngày)</Label>
              <Input
                id="nguong"
                type="number"
                min={1}
                max={60}
                value={nguong}
                onChange={(e) => setNguong(e.target.value)}
                className="w-32"
                disabled={isLoading}
              />
            </div>
            <Button onClick={() => void luu()} disabled={capNhat.isPending || isLoading}>
              {capNhat.isPending ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Ví dụ: đặt 3 nghĩa là việc còn 3 ngày hoặc ít hơn sẽ được tô vàng.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kết nối email</CardTitle>
          <CardDescription>
            Cấu hình gửi và nhận thư giao việc qua Gmail. Sẽ có ở giai đoạn tích hợp email.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
