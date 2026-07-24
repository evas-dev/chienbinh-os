import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { DangTai } from '@/components/chung/TrangThai';

// Tải trang theo nhu cầu để gói khởi tạo nhẹ hơn — mỗi trang thành một mảnh riêng.
const TongQuan = lazy(() =>
  import('@/pages/TongQuan').then((m) => ({ default: m.TongQuan })),
);
const ChiTietCongViec = lazy(() =>
  import('@/pages/ChiTietCongViec').then((m) => ({ default: m.ChiTietCongViec })),
);
const NhanSu = lazy(() => import('@/pages/NhanSu').then((m) => ({ default: m.NhanSu })));
const CaiDat = lazy(() => import('@/pages/CaiDat').then((m) => ({ default: m.CaiDat })));

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<DangTai soDong={4} />}>
        <Routes>
          <Route path="/" element={<TongQuan />} />
          <Route path="/cong-viec/:id" element={<ChiTietCongViec />} />
          <Route path="/nhan-su" element={<NhanSu />} />
          <Route path="/cai-dat" element={<CaiDat />} />
          {/* Đường dẫn lạ → quay về trang chủ */}
          <Route path="*" element={<TongQuan />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
