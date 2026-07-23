/**
 * Những mảnh dùng chung giữa ba file service của module hạng mục.
 * Tách ra để mỗi file service giữ được một trách nhiệm rõ ràng và dưới 200 dòng.
 */

/** Trường cần lấy kèm cho mọi truy vấn hạng mục trả về giao diện. */
export const KEM_THEO = {
  nguoiPhuTrach: { select: { id: true, hoTen: true, email: true, soDienThoai: true } },
  hoanThanhBoi: { select: { id: true, hoTen: true } },
  _count: { select: { tepDinhKem: true } },
} as const;

/** Chuỗi rỗng từ form → null trong DB, để không lẫn "chưa nhập" với "nhập rỗng". */
export function rongThanhNull(v: string | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  return v.trim() === '' ? null : v.trim();
}
