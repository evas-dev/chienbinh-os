import { Router } from 'express';
import {
  capNhatCongViecSchema,
  locCongViecSchema,
  taoCongViecSchema,
  type LocCongViecInput,
} from '@ceo/shared';
import { kiemTraBody, kiemTraQuery, layQuery } from '../../middleware/validate.middleware.js';
import { layThamSo } from '../../lib/tham-so.js';
import * as service from './cong-viec.service.js';

export const congViecRouter = Router();

congViecRouter.get('/', kiemTraQuery(locCongViecSchema), async (req, res) => {
  const duLieu = await service.danhSachCongViec(layQuery<LocCongViecInput>(req));
  res.json({ thanhCong: true, duLieu });
});

congViecRouter.post('/', kiemTraBody(taoCongViecSchema), async (req, res) => {
  const duLieu = await service.taoCongViec(req.body);
  res.status(201).json({ thanhCong: true, duLieu });
});

// Trả về công việc kèm TOÀN BỘ cây hạng mục
congViecRouter.get('/:id', async (req, res) => {
  const duLieu = await service.chiTietCongViec(layThamSo(req, 'id'));
  res.json({ thanhCong: true, duLieu });
});

congViecRouter.get('/:id/anh-huong-khi-xoa', async (req, res) => {
  const duLieu = await service.demAnhHuongKhiXoa(layThamSo(req, 'id'));
  res.json({ thanhCong: true, duLieu });
});

congViecRouter.patch('/:id', kiemTraBody(capNhatCongViecSchema), async (req, res) => {
  const duLieu = await service.capNhatCongViec(layThamSo(req, 'id'), req.body);
  res.json({ thanhCong: true, duLieu });
});

congViecRouter.delete('/:id', async (req, res) => {
  const duLieu = await service.xoaCongViec(layThamSo(req, 'id'));
  res.json({ thanhCong: true, duLieu });
});
