import { QueryClient } from '@tanstack/react-query';
import { LoiApi } from './api-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Tắt tự tải lại khi quay lại cửa sổ: CEO hay chuyển qua lại giữa các
      // ứng dụng, bật tính năng này sẽ làm màn hình nháy liên tục.
      refetchOnWindowFocus: false,
      retry: (soLan, loi) => {
        // Lỗi nghiệp vụ (404, 400...) thì thử lại vô nghĩa, chỉ thử lại lỗi mạng
        if (loi instanceof LoiApi && loi.maHttp) return false;
        return soLan < 2;
      },
    },
    mutations: { retry: false },
  },
});

/** Khóa truy vấn gom một chỗ để tránh gõ sai chuỗi rải rác khắp nơi. */
export const khoa = {
  nhanSu: (loc?: unknown) => ['nhan-su', loc] as const,
  congViec: (loc?: unknown) => ['cong-viec', loc] as const,
  chiTietCongViec: (id: string) => ['cong-viec', id] as const,
  chiTietHangMuc: (id: string) => ['hang-muc', id] as const,
  tepDinhKem: (hangMucId: string) => ['tep', hangMucId] as const,
};
