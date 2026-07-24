import type { LoiTruong } from '@ceo/shared';

/**
 * Lỗi trả về từ máy chủ, đã chuẩn hóa.
 *
 * Backend luôn trả { thanhCong, loi, chiTiet } nên giao diện chỉ cần bắt
 * MỘT loại lỗi duy nhất thay vì xử lý rải rác ở từng chỗ gọi.
 */
export class LoiApi extends Error {
  // Khai báo trường tường minh thay vì dùng "public" trong tham số constructor:
  // cấu hình erasableSyntaxOnly của Vite cấm cú pháp đó (esbuild không xóa được).
  readonly chiTiet: LoiTruong[] | null;
  readonly maHttp?: number;

  constructor(message: string, chiTiet: LoiTruong[] | null = null, maHttp?: number) {
    super(message);
    this.name = 'LoiApi';
    this.chiTiet = chiTiet;
    this.maHttp = maHttp;
  }

  /** Lấy thông báo lỗi của một trường cụ thể — để hiện ngay dưới ô nhập. */
  loiCuaTruong(ten: string): string | undefined {
    return this.chiTiet?.find((c) => c.truong === ten)?.thongBao;
  }
}

interface PhanHoiApi<T> {
  thanhCong: boolean;
  duLieu?: T;
  loi?: string;
  chiTiet?: LoiTruong[] | null;
}

async function goi<T>(duongDan: string, tuyChon: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`/api${duongDan}`, {
      ...tuyChon,
      headers: {
        ...(tuyChon.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...tuyChon.headers,
      },
    });
  } catch {
    // Mất mạng hoặc máy chủ chưa chạy — phân biệt rõ với lỗi nghiệp vụ
    throw new LoiApi(
      'Không kết nối được máy chủ. Kiểm tra xem đã chạy "npm run dev" chưa.',
    );
  }

  if (res.status === 204) return undefined as T;

  const noiDung = (await res.json().catch(() => null)) as PhanHoiApi<T> | null;

  if (!res.ok || !noiDung?.thanhCong) {
    throw new LoiApi(
      noiDung?.loi ?? `Lỗi máy chủ (${res.status})`,
      noiDung?.chiTiet ?? null,
      res.status,
    );
  }

  return noiDung.duLieu as T;
}

/** Ghép tham số truy vấn, tự bỏ giá trị rỗng để URL không lởm chởm. */
function themThamSo(duongDan: string, thamSo?: Record<string, unknown>): string {
  if (!thamSo) return duongDan;

  const usp = new URLSearchParams();
  for (const [khoa, giaTri] of Object.entries(thamSo)) {
    if (giaTri === undefined || giaTri === null || giaTri === '') continue;
    usp.set(khoa, String(giaTri));
  }

  const chuoi = usp.toString();
  return chuoi ? `${duongDan}?${chuoi}` : duongDan;
}

export const api = {
  get: <T>(duongDan: string, thamSo?: Record<string, unknown>) =>
    goi<T>(themThamSo(duongDan, thamSo)),

  post: <T>(duongDan: string, duLieu?: unknown) =>
    goi<T>(duongDan, { method: 'POST', body: JSON.stringify(duLieu ?? {}) }),

  patch: <T>(duongDan: string, duLieu?: unknown) =>
    goi<T>(duongDan, { method: 'PATCH', body: JSON.stringify(duLieu ?? {}) }),

  delete: <T>(duongDan: string) => goi<T>(duongDan, { method: 'DELETE' }),

  taiLen: <T>(duongDan: string, form: FormData) =>
    goi<T>(duongDan, { method: 'POST', body: form }),
};
