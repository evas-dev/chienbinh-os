import { Router } from 'express';
import { capNhatCauHinhSchema } from '@ceo/shared';
import { kiemTraBody } from '../../middleware/validate.middleware.js';
import * as service from './cau-hinh.service.js';

export const cauHinhRouter = Router();

cauHinhRouter.get('/', async (_req, res) => {
  const duLieu = await service.layCauHinh();
  res.json({ thanhCong: true, duLieu });
});

cauHinhRouter.patch('/', kiemTraBody(capNhatCauHinhSchema), async (req, res) => {
  const duLieu = await service.capNhatCauHinh(req.body);
  res.json({ thanhCong: true, duLieu });
});
