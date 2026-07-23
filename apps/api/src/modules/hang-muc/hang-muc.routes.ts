import { Router } from 'express';
import {
  capNhatHangMucSchema,
  capNhatTienDoSchema,
  capNhatTrongSoSchema,
  ganPhuTrachSchema,
  sapXepLaiSchema,
  taoHangMucSchema,
} from '@ceo/shared';
import { kiemTraBody } from '../../middleware/validate.middleware.js';
import { layThamSo } from '../../lib/tham-so.js';
import * as coBan from './hang-muc.service.js';
import * as tienDo from './hang-muc.tien-do.service.js';
import * as sapXep from './hang-muc.sap-xep.service.js';

export const hangMucRouter = Router();

// Các route KHÔNG có tham số động phải đặt TRƯỚC route "/:id",
// nếu không Express sẽ hiểu "trong-so" là một giá trị id.
hangMucRouter.patch('/trong-so', kiemTraBody(capNhatTrongSoSchema), async (req, res) => {
  const duLieu = await sapXep.capNhatTrongSoHangLoat(req.body);
  res.json({ thanhCong: true, duLieu });
});

hangMucRouter.post('/sap-xep-lai', kiemTraBody(sapXepLaiSchema), async (req, res) => {
  const duLieu = await sapXep.sapXepLai(req.body);
  res.json({ thanhCong: true, duLieu });
});

hangMucRouter.post('/', kiemTraBody(taoHangMucSchema), async (req, res) => {
  const duLieu = await coBan.taoHangMuc(req.body);
  res.status(201).json({ thanhCong: true, duLieu });
});

hangMucRouter.get('/:id', async (req, res) => {
  const duLieu = await coBan.chiTietHangMuc(layThamSo(req, 'id'));
  res.json({ thanhCong: true, duLieu });
});

hangMucRouter.get('/:id/anh-huong-khi-xoa', async (req, res) => {
  const duLieu = await sapXep.demAnhHuongKhiXoa(layThamSo(req, 'id'));
  res.json({ thanhCong: true, duLieu });
});

hangMucRouter.patch('/:id', kiemTraBody(capNhatHangMucSchema), async (req, res) => {
  const duLieu = await coBan.capNhatHangMuc(layThamSo(req, 'id'), req.body);
  res.json({ thanhCong: true, duLieu });
});

hangMucRouter.patch('/:id/tien-do', kiemTraBody(capNhatTienDoSchema), async (req, res) => {
  const duLieu = await tienDo.capNhatTienDo(layThamSo(req, 'id'), req.body);
  res.json({ thanhCong: true, duLieu });
});

hangMucRouter.patch('/:id/phu-trach', kiemTraBody(ganPhuTrachSchema), async (req, res) => {
  const duLieu = await tienDo.ganNguoiPhuTrach(layThamSo(req, 'id'), req.body.nguoiPhuTrachId);
  res.json({ thanhCong: true, duLieu });
});

hangMucRouter.delete('/:id', async (req, res) => {
  const duLieu = await coBan.xoaHangMuc(layThamSo(req, 'id'));
  res.json({ thanhCong: true, duLieu });
});
