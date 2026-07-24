import { useState } from 'react';
import { Mail, Phone, Plus, Search, UserX } from 'lucide-react';
import { toast } from 'sonner';
import type { NhanSuDTO } from '@ceo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KhungDuLieu } from '@/components/chung/TrangThai';
import { DialogXacNhanXoa } from '@/components/chung/DialogXacNhanXoa';
import { FormNhanSu } from '@/components/nhan-su/FormNhanSu';
import { useDanhSachNhanSu, useNgungHoatDongNhanSu } from '@/hooks/use-nhan-su';

export function NhanSu() {
  const [tuKhoa, setTuKhoa] = useState('');
  const [moForm, setMoForm] = useState(false);
  const [dangSua, setDangSua] = useState<NhanSuDTO | null>(null);
  const [sapNgung, setSapNgung] = useState<NhanSuDTO | null>(null);

  const { data: danhSach, isLoading, error, refetch } = useDanhSachNhanSu({ q: tuKhoa });
  const ngungHoatDong = useNgungHoatDongNhanSu();

  const thucHienNgung = async () => {
    if (!sapNgung) return;
    try {
      await ngungHoatDong.mutateAsync(sapNgung.id);
      toast.success(`Đã chuyển ${sapNgung.hoTen} sang ngừng hoạt động`);
      setSapNgung(null);
    } catch {
      toast.error('Không thực hiện được');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại…"
            className="pl-8"
          />
        </div>

        <Button
          size="sm"
          onClick={() => {
            setDangSua(null);
            setMoForm(true);
          }}
        >
          <Plus className="size-4" aria-hidden />
          Thêm nhân sự
        </Button>
      </div>

      <KhungDuLieu
        dangTai={isLoading}
        loi={error}
        rong={(danhSach ?? []).length === 0}
        onThuLai={() => void refetch()}
        khiRong={{
          tieuDe: tuKhoa ? 'Không tìm thấy ai phù hợp' : 'Danh bạ còn trống',
          moTa: tuKhoa
            ? 'Thử từ khóa khác hoặc xóa bớt điều kiện tìm kiếm.'
            : 'Thêm nhân sự để có thể giao việc cho họ.',
        }}
      >
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead className="hidden md:table-cell">Chức vụ</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead className="text-center">Đang gánh</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(danhSach ?? []).map((ns) => (
                <TableRow key={ns.id} className={!ns.dangHoatDong ? 'opacity-50' : undefined}>
                  <TableCell>
                    <div className="font-medium">{ns.hoTen}</div>
                    {!ns.dangHoatDong && (
                      <Badge variant="secondary" className="mt-1">
                        Ngừng hoạt động
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {ns.chucVu ?? '—'}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3 shrink-0" aria-hidden />
                        <span className="truncate">{ns.email}</span>
                      </div>
                      {ns.soDienThoai && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="size-3 shrink-0" aria-hidden />
                          {ns.soDienThoai}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center tabular-nums">
                    {ns.soHangMucDangLam ?? 0}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDangSua(ns);
                          setMoForm(true);
                        }}
                      >
                        Sửa
                      </Button>
                      {ns.dangHoatDong && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-red-600"
                          onClick={() => setSapNgung(ns)}
                          aria-label={`Ngừng hoạt động ${ns.hoTen}`}
                        >
                          <UserX className="size-4" aria-hidden />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </KhungDuLieu>

      <FormNhanSu moKhong={moForm} onDong={() => setMoForm(false)} nhanSu={dangSua} />

      <DialogXacNhanXoa
        moKhong={Boolean(sapNgung)}
        onDoiTrangThai={(m) => !m && setSapNgung(null)}
        tenMuc={sapNgung?.hoTen ?? ''}
        dangXoa={ngungHoatDong.isPending}
        onXacNhan={() => void thucHienNgung()}
        moTaThem={
          <p className="text-sm">
            Người này sẽ chuyển sang trạng thái <strong>ngừng hoạt động</strong> và không xuất
            hiện khi giao việc mới. Lịch sử công việc đã làm vẫn được giữ nguyên.
          </p>
        }
      />
    </div>
  );
}
