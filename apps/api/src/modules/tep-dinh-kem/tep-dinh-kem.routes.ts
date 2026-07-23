import { Router } from 'express';
import multer from 'multer';
import { GIOI_HAN_BYTE, GIOI_HAN_MB } from './storage/local.storage.js';
import { DuLieuKhongHopLeError } from '../../lib/errors.js';
import { layThamSo } from '../../lib/tham-so.js';
import * as service from './tep-dinh-kem.service.js';

/**
 * Nhận tệp vào bộ nhớ tạm rồi mới ghi xuống đĩa qua tầng KhoLuuTru.
 * Với giới hạn 25MB và ứng dụng một người dùng thì cách này đơn giản và đủ nhanh.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: GIOI_HAN_BYTE },
});

export const tepDinhKemRouter = Router();

// Danh sách tệp của một hạng mục — chính là "checklist tài liệu" trong yêu cầu
tepDinhKemRouter.get('/hang-muc/:hangMucId', async (req, res) => {
  const duLieu = await service.danhSachTep(layThamSo(req, 'hangMucId'));
  res.json({ thanhCong: true, duLieu });
});

tepDinhKemRouter.post('/hang-muc/:hangMucId', upload.single('tep'), async (req, res) => {
  if (!req.file) throw new DuLieuKhongHopLeError('Chưa chọn tệp để tải lên');

  const duLieu = await service.taiLenTep(layThamSo(req, 'hangMucId'), {
    // Multer đọc tên tệp theo latin1; phải chuyển về UTF-8 nếu không tên
    // tiếng Việt có dấu sẽ hiển thị thành ký tự rác.
    tenGoc: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
    loaiMime: req.file.mimetype,
    duLieu: req.file.buffer,
  });

  res.status(201).json({ thanhCong: true, duLieu });
});

tepDinhKemRouter.get('/:id/tai-ve', async (req, res) => {
  const { tep, duLieu } = await service.taiVeTep(layThamSo(req, 'id'));

  res.setHeader('Content-Type', tep.loaiMime);
  res.setHeader('Content-Length', String(tep.kichThuoc));
  // filename* với mã hóa UTF-8 để trình duyệt hiện đúng tên tiếng Việt có dấu
  res.setHeader(
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(tep.tenGoc)}`,
  );
  res.send(duLieu);
});

tepDinhKemRouter.delete('/:id', async (req, res) => {
  const duLieu = await service.xoaTep(layThamSo(req, 'id'));
  res.json({ thanhCong: true, duLieu });
});

export { GIOI_HAN_MB };
