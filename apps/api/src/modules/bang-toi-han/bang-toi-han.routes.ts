import { Router } from 'express';
import { locBangToiHanSchema, type LocBangToiHanInput } from '@ceo/shared';
import { kiemTraQuery, layQuery } from '../../middleware/validate.middleware.js';
import * as service from './bang-toi-han.service.js';

export const bangToiHanRouter = Router();

bangToiHanRouter.get('/', kiemTraQuery(locBangToiHanSchema), async (req, res) => {
  const duLieu = await service.layBangToiHan(layQuery<LocBangToiHanInput>(req));
  res.json({ thanhCong: true, duLieu });
});
