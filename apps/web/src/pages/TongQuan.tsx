import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, CheckCircle2, FolderKanban, Plus, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TheSoLieu } from '@/components/chung/TheSoLieu';
import { KhungDuLieu } from '@/components/chung/TrangThai';
import { TheCongViec } from '@/components/cong-viec/TheCongViec';
import { FormCongViec } from '@/components/cong-viec/FormCongViec';
import { useDanhSachCongViec } from '@/hooks/use-cong-viec';

/**
 * Trang chủ.
 *
 * Bố cục theo đúng yêu cầu nghiệp vụ: PHẦN TRÊN là quản lý công việc.
 * PHẦN DƯỚI (bảng checklist tới hạn) sẽ được lấp ở giai đoạn 3.
 */
export function TongQuan() {
  const dieuHuong = useNavigate();
  const [moForm, setMoForm] = useState(false);
  const { data: danhSach, isLoading, error, refetch } = useDanhSachCongViec();

  const soLieu = useMemo(() => {
    const ds = danhSach ?? [];
    return {
      tong: ds.length,
      dangLam: ds.filter((c) => c.trangThai === 'DANG_LAM').length,
      quaHan: ds.reduce((t, c) => t + c.soHangMucQuaHan, 0),
      hoanThanh: ds.filter((c) => c.trangThai === 'HOAN_THANH').length,
    };
  }, [danhSach]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TheSoLieu nhan="Tổng công việc" giaTri={soLieu.tong} icon={FolderKanban} />
        <TheSoLieu nhan="Đang thực hiện" giaTri={soLieu.dangLam} icon={Timer} />
        <TheSoLieu
          nhan="Hạng mục quá hạn"
          giaTri={soLieu.quaHan}
          icon={AlertTriangle}
          kieu={soLieu.quaHan > 0 ? 'canh-bao' : 'binh-thuong'}
        />
        <TheSoLieu
          nhan="Đã hoàn thành"
          giaTri={soLieu.hoanThanh}
          icon={CheckCircle2}
          kieu={soLieu.hoanThanh > 0 ? 'tot' : 'binh-thuong'}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Danh sách công việc</h2>
          <Button size="sm" onClick={() => setMoForm(true)}>
            <Plus className="size-4" aria-hidden />
            Tạo công việc
          </Button>
        </div>

        <KhungDuLieu
          dangTai={isLoading}
          loi={error}
          rong={(danhSach ?? []).length === 0}
          onThuLai={() => void refetch()}
          khiRong={{
            tieuDe: 'Chưa có công việc nào',
            moTa: 'Tạo công việc đầu tiên để bắt đầu theo dõi tiến độ.',
            hanhDong: (
              <Button onClick={() => setMoForm(true)}>
                <Plus className="size-4" aria-hidden />
                Tạo công việc
              </Button>
            ),
          }}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(danhSach ?? []).map((cv) => (
              <TheCongViec
                key={cv.id}
                congViec={cv}
                onMo={(id) => dieuHuong(`/cong-viec/${id}`)}
              />
            ))}
          </div>
        </KhungDuLieu>
      </section>

      {/* Giai đoạn 3 sẽ đặt bảng checklist tới hạn vào đây */}

      <FormCongViec moKhong={moForm} onDong={() => setMoForm(false)} />
    </div>
  );
}
