import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CapNhatCongViecInput,
  CongViecDTO,
  HangMucDTO,
  LocCongViecInput,
  TaoCongViecInput,
} from '@ceo/shared';
import { api } from '@/lib/api-client';
import { khoa } from '@/lib/query-client';

export interface ChiTietCongViec extends Omit<CongViecDTO, 'soHangMuc' | 'soHangMucQuaHan'> {
  cayHangMuc: HangMucDTO[];
}

export function useDanhSachCongViec(loc: Partial<LocCongViecInput> = {}) {
  return useQuery({
    queryKey: khoa.congViec(loc),
    queryFn: () => api.get<CongViecDTO[]>('/cong-viec', loc),
  });
}

export function useChiTietCongViec(id: string | undefined) {
  return useQuery({
    queryKey: khoa.chiTietCongViec(id ?? ''),
    queryFn: () => api.get<ChiTietCongViec>(`/cong-viec/${id}`),
    enabled: Boolean(id),
  });
}

export function useTaoCongViec() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (duLieu: TaoCongViecInput) => api.post<CongViecDTO>('/cong-viec', duLieu),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cong-viec'] }),
  });
}

export function useCapNhatCongViec() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, duLieu }: { id: string; duLieu: CapNhatCongViecInput }) =>
      api.patch<CongViecDTO>(`/cong-viec/${id}`, duLieu),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cong-viec'] }),
  });
}

export function useXoaCongViec() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cong-viec/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cong-viec'] }),
  });
}

/** Đếm số hạng mục và tệp sẽ mất — để hộp thoại xác nhận nói rõ con số. */
export function useAnhHuongKhiXoaCongViec(id: string | undefined, batDau: boolean) {
  return useQuery({
    queryKey: ['cong-viec', id, 'anh-huong'],
    queryFn: () =>
      api.get<{ ten: string; soHangMuc: number; soTepDinhKem: number }>(
        `/cong-viec/${id}/anh-huong-khi-xoa`,
      ),
    enabled: Boolean(id) && batDau,
  });
}
