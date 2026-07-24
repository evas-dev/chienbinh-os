import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CapNhatNhanSuInput, NhanSuDTO, TaoNhanSuInput } from '@ceo/shared';
import { api } from '@/lib/api-client';
import { khoa } from '@/lib/query-client';

interface LocNhanSu {
  q?: string;
  dangHoatDong?: boolean;
  [khoa: string]: unknown;
}

export function useDanhSachNhanSu(loc: LocNhanSu = {}) {
  return useQuery({
    queryKey: khoa.nhanSu(loc),
    queryFn: () => api.get<NhanSuDTO[]>('/nhan-su', loc),
  });
}

export function useTaoNhanSu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (duLieu: TaoNhanSuInput) => api.post<NhanSuDTO>('/nhan-su', duLieu),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['nhan-su'] }),
  });
}

export function useCapNhatNhanSu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, duLieu }: { id: string; duLieu: CapNhatNhanSuInput }) =>
      api.patch<NhanSuDTO>(`/nhan-su/${id}`, duLieu),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['nhan-su'] }),
  });
}

/** Xóa mềm: tắt cờ hoạt động, giữ lại lịch sử ai đã hoàn thành việc gì. */
export function useNgungHoatDongNhanSu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<NhanSuDTO>(`/nhan-su/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['nhan-su'] }),
  });
}
