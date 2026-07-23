import { prisma } from '../../lib/prisma.js';
import { KhongTimThayError, TepQuaLonError } from '../../lib/errors.js';
import { GIOI_HAN_BYTE, GIOI_HAN_MB, KhoLuuTruLocal } from './storage/local.storage.js';
import type { KhoLuuTru } from './storage/storage.interface.js';

/**
 * Chọn nơi lưu trữ. Hiện chỉ có đĩa máy này; khi lên VPS muốn dùng S3 thì
 * thêm một lớp mới ở đây, tầng nghiệp vụ bên dưới không đổi một dòng.
 */
const kho: KhoLuuTru = new KhoLuuTruLocal();

export async function danhSachTep(hangMucId: string) {
  return prisma.tepDinhKem.findMany({
    where: { hangMucId },
    orderBy: { taiLenLuc: 'desc' },
  });
}

export async function taiLenTep(
  hangMucId: string,
  tep: { tenGoc: string; loaiMime: string; duLieu: Buffer },
) {
  const hangMuc = await prisma.hangMuc.findUnique({ where: { id: hangMucId } });
  if (!hangMuc) throw new KhongTimThayError('Hạng mục');

  if (tep.duLieu.length > GIOI_HAN_BYTE) throw new TepQuaLonError(GIOI_HAN_MB);

  const daLuu = await kho.luu(tep);

  return prisma.tepDinhKem.create({
    data: {
      hangMucId,
      tenGoc: tep.tenGoc,
      tenLuu: daLuu.tenLuu,
      duongDan: daLuu.duongDan,
      kichThuoc: daLuu.kichThuoc,
      loaiMime: tep.loaiMime,
    },
  });
}

export async function taiVeTep(id: string) {
  const tep = await prisma.tepDinhKem.findUnique({ where: { id } });
  if (!tep) throw new KhongTimThayError('Tệp đính kèm');

  const duLieu = await kho.doc(tep.duongDan);
  return { tep, duLieu };
}

export async function xoaTep(id: string) {
  const tep = await prisma.tepDinhKem.findUnique({ where: { id } });
  if (!tep) throw new KhongTimThayError('Tệp đính kèm');

  await kho.chuyenVaoThungRac(tep.duongDan);
  await prisma.tepDinhKem.delete({ where: { id } });

  return { daXoa: true };
}
