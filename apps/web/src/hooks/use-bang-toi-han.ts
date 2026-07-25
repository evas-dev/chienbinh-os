import { useQuery } from '@tanstack/react-query';
import type { KetQuaBangToiHan, LocBangToiHanInput } from '@ceo/shared';
import { api } from '@/lib/api-client';

export type LocToiHan = Partial<
  Pick<
    LocBangToiHanInput,
    'nhanSuId' | 'congViecId' | 'trangThai' | 'q' | 'trang' | 'soDong'
  >
> & {
  tuNgay?: string;
  denNgay?: string;
  chuaXong?: boolean;
};

export function useBangToiHan(loc: LocToiHan) {
  return useQuery({
    queryKey: ['bang-toi-han', loc],
    queryFn: () => api.get<KetQuaBangToiHan>('/bang-toi-han', loc),
    // Giữ dữ liệu cũ khi đổi bộ lọc để bảng không nháy trắng giữa các lần lọc
    placeholderData: (truoc) => truoc,
  });
}
