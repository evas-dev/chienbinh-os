import type { Request } from 'express';
import { DuLieuKhongHopLeError } from './errors.js';

/**
 * Lấy tham số đường dẫn (ví dụ :id) một cách an toàn về kiểu.
 *
 * Express 5 khai báo req.params là `string | string[] | undefined` chứ không
 * còn là `string` như Express 4. Thay vì ép kiểu bừa ở hàng chục chỗ, gom vào
 * một hàm để nếu tham số thiếu thật thì trả lỗi tiếng Việt rõ ràng thay vì
 * để undefined trôi xuống tầng dưới rồi hỏng ở chỗ khó đoán.
 */
export function layThamSo(req: Request, ten: string): string {
  const giaTri = req.params[ten];

  if (typeof giaTri !== 'string' || giaTri.trim() === '') {
    throw new DuLieuKhongHopLeError(`Thiếu tham số "${ten}" trong đường dẫn`);
  }

  return giaTri;
}
