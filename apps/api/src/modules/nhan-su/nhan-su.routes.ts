import { Router } from 'express';
import { capNhatNhanSuSchema, locNhanSuSchema, taoNhanSuSchema, type LocNhanSuInput } from '@ceo/shared';
import { kiemTraBody, kiemTraQuery, layQuery } from '../../middleware/validate.middleware.js';
import { layThamSo } from '../../lib/tham-so.js';
import * as service from './nhan-su.service.js';

export const nhanSuRouter = Router();

// Express 5 tự bắt lỗi ném ra từ handler async → không cần bọc try/catch từng route.

nhanSuRouter.get('/', kiemTraQuery(locNhanSuSchema), async (req, res) => {
  const duLieu = await service.danhSachNhanSu(layQuery<LocNhanSuInput>(req));
  res.json({ thanhCong: true, duLieu });
});

nhanSuRouter.get('/:id', async (req, res) => {
  const duLieu = await service.chiTietNhanSu(layThamSo(req, 'id'));
  res.json({ thanhCong: true, duLieu });
});

nhanSuRouter.post('/', kiemTraBody(taoNhanSuSchema), async (req, res) => {
  const duLieu = await service.taoNhanSu(req.body);
  res.status(201).json({ thanhCong: true, duLieu });
});

nhanSuRouter.patch('/:id', kiemTraBody(capNhatNhanSuSchema), async (req, res) => {
  const duLieu = await service.capNhatNhanSu(layThamSo(req, 'id'), req.body);
  res.json({ thanhCong: true, duLieu });
});

// Xóa mềm: tắt cờ hoạt động để giữ lịch sử ai đã hoàn thành việc gì
nhanSuRouter.delete('/:id', async (req, res) => {
  const duLieu = await service.ngungHoatDongNhanSu(layThamSo(req, 'id'));
  res.json({ thanhCong: true, duLieu });
});
