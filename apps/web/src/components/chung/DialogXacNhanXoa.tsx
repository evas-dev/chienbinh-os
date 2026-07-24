import type { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  moKhong: boolean;
  onDoiTrangThai: (mo: boolean) => void;
  tenMuc: string;
  /** Số hạng mục con sẽ mất theo. Không truyền nghĩa là không có. */
  soHangMucCon?: number;
  soTepDinhKem?: number;
  dangXoa?: boolean;
  onXacNhan: () => void;
  moTaThem?: ReactNode;
}

/**
 * Hộp thoại xác nhận xóa, ĐẾM RÕ SỐ LƯỢNG sẽ mất.
 *
 * "Bạn có chắc không?" là câu hỏi vô nghĩa vì người dùng luôn bấm Đồng ý.
 * Nói rõ "sẽ mất 12 hạng mục và 5 tệp" mới khiến người ta dừng lại suy nghĩ.
 */
export function DialogXacNhanXoa({
  moKhong,
  onDoiTrangThai,
  tenMuc,
  soHangMucCon = 0,
  soTepDinhKem = 0,
  dangXoa,
  onXacNhan,
  moTaThem,
}: Props) {
  const cacPhanMat: string[] = [];
  if (soHangMucCon > 0) cacPhanMat.push(`${soHangMucCon} hạng mục con`);
  if (soTepDinhKem > 0) cacPhanMat.push(`${soTepDinhKem} tệp đính kèm`);

  return (
    <AlertDialog open={moKhong} onOpenChange={onDoiTrangThai}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa “{tenMuc}”?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {cacPhanMat.length > 0 ? (
                <p>
                  Thao tác này sẽ xóa vĩnh viễn{' '}
                  <span className="font-semibold text-red-600">{cacPhanMat.join(' và ')}</span> bên
                  trong. Không thể hoàn tác.
                </p>
              ) : (
                <p>Thao tác này không thể hoàn tác.</p>
              )}
              {moTaThem}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={dangXoa}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onXacNhan();
            }}
            disabled={dangXoa}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
          >
            {dangXoa ? 'Đang xóa…' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
