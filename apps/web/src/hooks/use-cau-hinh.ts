import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CapNhatCauHinhInput, CauHinhDTO } from '@ceo/shared';
import { api } from '@/lib/api-client';

export function useCauHinh() {
  return useQuery({
    queryKey: ['cau-hinh'],
    queryFn: () => api.get<CauHinhDTO>('/cau-hinh'),
    // Cấu hình ít đổi → giữ lâu hơn để đỡ gọi lại
    staleTime: 5 * 60_000,
  });
}

export function useCapNhatCauHinh() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (duLieu: CapNhatCauHinhInput) => api.patch<CauHinhDTO>('/cau-hinh', duLieu),
    onSuccess: (moi) => {
      qc.setQueryData(['cau-hinh'], moi);
      // Ngưỡng cảnh báo đổi → bảng tới hạn phải tô màu lại
      void qc.invalidateQueries({ queryKey: ['bang-toi-han'] });
    },
  });
}
