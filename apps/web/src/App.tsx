import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Giai đoạn 0: chỉ dựng khung và xác nhận toàn bộ hạ tầng chạy thông.
 * Các trang thật (Tổng quan, Công việc, Nhân sự, Cài đặt) sẽ làm ở giai đoạn 2.
 */
export default function App() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Nền móng đã sẵn sàng</CardTitle>
                <CardDescription className="mt-1.5">
                  Giai đoạn 0 hoàn tất. Cơ sở dữ liệu, máy chủ và giao diện đã chạy thông.
                </CardDescription>
              </div>
              <Badge variant="secondary">Giai đoạn 0</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm">
              {[
                'Kho mã dạng monorepo, dùng chung mã nguồn giữa máy chủ và giao diện',
                'PostgreSQL 17 đã kết nối qua Prisma',
                'Máy chủ chỉ lắng nghe trên máy này, không lộ ra mạng nội bộ',
                'Giao diện tiếng Việt với Tailwind và bộ giao diện shadcn',
              ].map((muc) => (
                <li key={muc} className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500"
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{muc}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bước tiếp theo</CardTitle>
            <CardDescription>
              Giai đoạn 1 sẽ dựng cơ sở dữ liệu và các chức năng quản lý công việc, hạng
              mục, nhân sự.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppShell>
  );
}
