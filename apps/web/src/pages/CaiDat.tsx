import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Trang Cài đặt.
 *
 * Giai đoạn 3 sẽ thêm ô chỉnh ngưỡng cảnh báo vàng (số ngày).
 * Giai đoạn 4 sẽ thêm phần kết nối email và công tắc gửi mail tự động.
 */
export function CaiDat() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cảnh báo hạn chót</CardTitle>
          <CardDescription>
            Số ngày trước hạn để bắt đầu tô màu vàng cảnh báo. Sẽ cấu hình được ở giai đoạn tiếp
            theo.
          </CardDescription>
        </CardHeader>
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
