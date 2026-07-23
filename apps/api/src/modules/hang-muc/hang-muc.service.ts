import { chiaDeuTrongSo, type CapNhatHangMucInput, type TaoHangMucInput } from '@ceo/shared';
import { prisma } from '../../lib/prisma.js';
import { KhongTimThayError } from '../../lib/errors.js';
import { sinhMaHangMuc } from '../../lib/ma-tu-sinh.js';
import { capNhatTienDoVaLanLenTren, tinhLaiToanBoCay } from './tien-do.calculator.js';
import { KEM_THEO, rongThanhNull } from './hang-muc.chung.js';

/**
 * Nghiệp vụ cốt lõi của hạng mục: tạo, sửa, xem, xóa.
 *
 * Phần tiến độ và phân công nằm ở hang-muc.tien-do.service.ts
 * Phần sắp xếp và trọng số nằm ở hang-muc.sap-xep.service.ts
 */

export async function chiTietHangMuc(id: string) {
  const hm = await prisma.hangMuc.findUnique({
    where: { id },
    include: {
      ...KEM_THEO,
      congViec: { select: { id: true, ma: true, ten: true } },
      tepDinhKem: { orderBy: { taiLenLuc: 'desc' } },
    },
  });
  if (!hm) throw new KhongTimThayError('Hạng mục');
  return hm;
}

/**
 * Tạo hạng mục mới.
 *
 * Nếu người dùng không chỉ định trọng số thì hệ thống CHIA ĐỀU LẠI cho cả nhóm
 * anh em (3 con → 33/33/34) ngay trong cùng transaction, để tổng luôn về 100.
 */
export async function taoHangMuc(duLieu: TaoHangMucInput) {
  return prisma.$transaction(async (tx) => {
    const congViec = await tx.congViec.findUnique({ where: { id: duLieu.congViecId } });
    if (!congViec) throw new KhongTimThayError('Công việc');

    if (duLieu.hangMucChaId) {
      const cha = await tx.hangMuc.findUnique({ where: { id: duLieu.hangMucChaId } });
      if (!cha) throw new KhongTimThayError('Hạng mục cha');
    }

    const chaId = duLieu.hangMucChaId ?? null;

    const anhEm = await tx.hangMuc.findMany({
      where: { congViecId: duLieu.congViecId, hangMucChaId: chaId },
      select: { id: true },
      orderBy: { thuTu: 'asc' },
    });

    const moi = await tx.hangMuc.create({
      data: {
        ma: await sinhMaHangMuc(tx),
        ten: duLieu.ten,
        congViecId: duLieu.congViecId,
        hangMucChaId: chaId,
        ghiChu: rongThanhNull(duLieu.ghiChu) ?? null,
        hanHoanThanh: duLieu.hanHoanThanh ?? null,
        nguoiPhuTrachId: duLieu.nguoiPhuTrachId ?? null,
        loaiTienDo: duLieu.loaiTienDo,
        thuTu: anhEm.length,
        trongSo: duLieu.trongSo ?? 1,
      },
    });

    // Người dùng không tự đặt trọng số → chia đều lại cả nhóm cho tổng về 100
    if (duLieu.trongSo === undefined) {
      const tatCaId = [...anhEm.map((a) => a.id), moi.id];
      const trongSoMoi = chiaDeuTrongSo(tatCaId.length);
      await Promise.all(
        tatCaId.map((id, i) =>
          tx.hangMuc.update({ where: { id }, data: { trongSo: trongSoMoi[i] ?? 1 } }),
        ),
      );
    }

    await capNhatTienDoVaLanLenTren(tx, moi.id);

    return tx.hangMuc.findUniqueOrThrow({ where: { id: moi.id }, include: KEM_THEO });
  });
}

export async function capNhatHangMuc(id: string, duLieu: CapNhatHangMucInput) {
  return prisma.$transaction(async (tx) => {
    const hienTai = await tx.hangMuc.findUnique({ where: { id } });
    if (!hienTai) throw new KhongTimThayError('Hạng mục');

    await tx.hangMuc.update({
      where: { id },
      data: {
        ...(duLieu.ten !== undefined && { ten: duLieu.ten }),
        ...(duLieu.ghiChu !== undefined && { ghiChu: rongThanhNull(duLieu.ghiChu) }),
        ...(duLieu.hanHoanThanh !== undefined && { hanHoanThanh: duLieu.hanHoanThanh }),
        ...(duLieu.nguoiPhuTrachId !== undefined && { nguoiPhuTrachId: duLieu.nguoiPhuTrachId }),
        ...(duLieu.loaiTienDo !== undefined && { loaiTienDo: duLieu.loaiTienDo }),
        ...(duLieu.trongSo !== undefined && { trongSo: duLieu.trongSo }),
        ...(duLieu.trangThai !== undefined && { trangThai: duLieu.trangThai }),
      },
    });

    // Đổi kiểu tiến độ hoặc trọng số đều làm phần trăm phía trên phải tính lại
    await capNhatTienDoVaLanLenTren(tx, id);

    return tx.hangMuc.findUniqueOrThrow({ where: { id }, include: KEM_THEO });
  });
}

/**
 * Xóa hạng mục. Các hạng mục con bị xóa theo (cascade khai báo ở schema).
 * Sau khi xóa phải tính lại toàn bộ cây để phần trăm cha không đọng số cũ.
 */
export async function xoaHangMuc(id: string) {
  return prisma.$transaction(async (tx) => {
    const hm = await tx.hangMuc.findUnique({ where: { id }, select: { congViecId: true } });
    if (!hm) throw new KhongTimThayError('Hạng mục');

    await tx.hangMuc.delete({ where: { id } });
    await tinhLaiToanBoCay(tx, hm.congViecId);

    return { daXoa: true };
  });
}
