import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { env } from '../../../config/env.js';
import type { KetQuaLuu, KhoLuuTru, TepDauVao } from './storage.interface.js';

/** Phần mở rộng không cho phép tải lên — tránh vô tình lưu tệp thực thi. */
const PHAN_MO_RONG_CHAN = new Set([
  '.sh', '.command', '.app', '.exe', '.bat', '.cmd', '.scr', '.msi', '.dll', '.so',
]);

export const GIOI_HAN_MB = 25;
export const GIOI_HAN_BYTE = GIOI_HAN_MB * 1024 * 1024;

const THU_MUC_GOC = path.resolve(process.cwd(), env.UPLOAD_DIR);
const THU_MUC_THUNG_RAC = path.join(THU_MUC_GOC, '.thung-rac');

/**
 * Lưu tệp vào đĩa máy này.
 *
 * ĐIỂM QUAN TRỌNG VỀ AN TOÀN: tên hiển thị và tên trên đĩa được tách đôi.
 *  - tenGoc: người dùng nhìn thấy, có dấu tiếng Việt, có thể trùng nhau
 *  - tenLuu: uuid + phần mở rộng, là tên thật trên đĩa
 * Nhờ vậy chặn được cả trùng tên lẫn tấn công path traversal kiểu "../../etc/passwd".
 */
export class KhoLuuTruLocal implements KhoLuuTru {
  async luu(tep: TepDauVao): Promise<KetQuaLuu> {
    if (tep.duLieu.length > GIOI_HAN_BYTE) {
      throw new Error(`Tệp vượt quá giới hạn ${GIOI_HAN_MB}MB`);
    }

    // Chỉ lấy phần mở rộng, bỏ mọi thành phần đường dẫn có thể lẫn trong tên
    const phanMoRong = path.extname(path.basename(tep.tenGoc)).toLowerCase();
    if (PHAN_MO_RONG_CHAN.has(phanMoRong)) {
      throw new Error(`Không cho phép tải lên tệp có đuôi ${phanMoRong}`);
    }

    // Chia theo năm-tháng để một thư mục không phình quá lớn theo thời gian
    const nay = new Date();
    const thuMucCon = `${nay.getFullYear()}-${String(nay.getMonth() + 1).padStart(2, '0')}`;
    const tenLuu = `${randomUUID()}${phanMoRong}`;
    const duongDanTuongDoi = path.join(thuMucCon, tenLuu);
    const duongDanDayDu = path.join(THU_MUC_GOC, duongDanTuongDoi);

    await fs.mkdir(path.dirname(duongDanDayDu), { recursive: true });
    await fs.writeFile(duongDanDayDu, tep.duLieu);

    return { tenLuu, duongDan: duongDanTuongDoi, kichThuoc: tep.duLieu.length };
  }

  async doc(duongDan: string): Promise<Buffer> {
    return fs.readFile(this.duongDanAnToan(duongDan));
  }

  /**
   * Chuyển vào thùng rác thay vì xóa hẳn.
   * Người dùng bấm nhầm nút xóa vẫn còn cơ hội lấy lại tệp từ thư mục này.
   */
  async chuyenVaoThungRac(duongDan: string): Promise<void> {
    const nguon = this.duongDanAnToan(duongDan);
    const dich = path.join(THU_MUC_THUNG_RAC, `${Date.now()}-${path.basename(duongDan)}`);

    await fs.mkdir(THU_MUC_THUNG_RAC, { recursive: true });
    await fs.rename(nguon, dich).catch(() => {
      // Tệp đã biến mất khỏi đĩa: không phải lỗi cần chặn người dùng,
      // bản ghi trong cơ sở dữ liệu vẫn xóa được bình thường.
    });
  }

  /**
   * Ghép đường dẫn rồi KIỂM TRA kết quả vẫn nằm trong thư mục gốc.
   * Chốt chặn cuối cùng chống path traversal nếu dữ liệu trong DB bị sửa bậy.
   */
  private duongDanAnToan(duongDanTuongDoi: string): string {
    const dayDu = path.resolve(THU_MUC_GOC, duongDanTuongDoi);
    if (!dayDu.startsWith(THU_MUC_GOC + path.sep)) {
      throw new Error('Đường dẫn tệp không hợp lệ');
    }
    return dayDu;
  }
}
