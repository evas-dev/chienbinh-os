import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CapNhatHangMucInput,
  CapNhatTienDoInput,
  HangMucDTO,
  TaoHangMucInput,
} from '@ceo/shared';
import { api } from '@/lib/api-client';
import { khoa } from '@/lib/query-client';

/**
 * Mọi thao tác lên hạng mục đều làm phần trăm của cha thay đổi theo, nên sau
 * khi thành công phải nạp lại CẢ cây công việc chứ không chỉ nút vừa sửa.
 */
function dungLamMoiCay(qc: ReturnType<typeof useQueryClient>, congViecId?: string) {
  void qc.invalidateQueries({ queryKey: ['cong-viec'] });
  if (congViecId) void qc.invalidateQueries({ queryKey: khoa.chiTietCongViec(congViecId) });
}

export function useChiTietHangMuc(id: string | undefined) {
  return useQuery({
    queryKey: khoa.chiTietHangMuc(id ?? ''),
    queryFn: () => api.get<HangMucDTO & { tepDinhKem: unknown[] }>(`/hang-muc/${id}`),
    enabled: Boolean(id),
  });
}

export function useTaoHangMuc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (duLieu: TaoHangMucInput) => api.post<HangMucDTO>('/hang-muc', duLieu),
    onSuccess: (_kq, bien) => dungLamMoiCay(qc, bien.congViecId),
  });
}

export function useCapNhatHangMuc(congViecId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, duLieu }: { id: string; duLieu: CapNhatHangMucInput }) =>
      api.patch<HangMucDTO>(`/hang-muc/${id}`, duLieu),
    onSuccess: (_kq, bien) => {
      dungLamMoiCay(qc, congViecId);
      void qc.invalidateQueries({ queryKey: khoa.chiTietHangMuc(bien.id) });
    },
  });
}

/**
 * Cập nhật tiến độ.
 *
 * KHÔNG dùng cập nhật lạc quan cho phần trăm của nút CHA: con số đó do máy chủ
 * tính theo trọng số, đoán trước ở giao diện sẽ dễ lệch rồi nhảy số khó chịu.
 * Nút lá thì phản hồi tức thì nhờ TanStack Query tự đánh dấu đang chạy.
 */
export function useCapNhatTienDo(congViecId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, duLieu }: { id: string; duLieu: CapNhatTienDoInput }) =>
      api.patch<HangMucDTO>(`/hang-muc/${id}/tien-do`, duLieu),
    onSuccess: () => dungLamMoiCay(qc, congViecId),
  });
}

export function useGanPhuTrach(congViecId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nguoiPhuTrachId }: { id: string; nguoiPhuTrachId: string | null }) =>
      api.patch<HangMucDTO>(`/hang-muc/${id}/phu-trach`, { nguoiPhuTrachId }),
    onSuccess: (_kq, bien) => {
      dungLamMoiCay(qc, congViecId);
      void qc.invalidateQueries({ queryKey: khoa.chiTietHangMuc(bien.id) });
    },
  });
}

/** Chỉnh trọng số cho cả nhóm anh em (nút "Chia đều"). */
export function useCapNhatTrongSo(congViecId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (duLieu: { id: string; trongSo: number }[]) =>
      api.patch('/hang-muc/trong-so', duLieu),
    onSuccess: () => dungLamMoiCay(qc, congViecId),
  });
}

export function useXoaHangMuc(congViecId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/hang-muc/${id}`),
    onSuccess: () => dungLamMoiCay(qc, congViecId),
  });
}

export function useAnhHuongKhiXoaHangMuc(id: string | undefined, batDau: boolean) {
  return useQuery({
    queryKey: ['hang-muc', id, 'anh-huong'],
    queryFn: () =>
      api.get<{ soHangMucCon: number; soTepDinhKem: number }>(
        `/hang-muc/${id}/anh-huong-khi-xoa`,
      ),
    enabled: Boolean(id) && batDau,
  });
}
