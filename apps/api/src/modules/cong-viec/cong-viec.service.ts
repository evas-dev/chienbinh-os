import { tinhSoNgayConLai, type CapNhatCongViecInput, type LocCongViecInput, type TaoCongViecInput } from '@ceo/shared';
import { prisma } from '../../lib/prisma.js';
import { KhongTimThayError } from '../../lib/errors.js';
import { sinhMaCongViec } from '../../lib/ma-tu-sinh.js';
import { dungCay, type HangMucPhang } from '../hang-muc/cay-hang-muc.js';

function rongThanhNull(v: string | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  return v.trim() === '' ? null : v.trim();
}

const SAP_XEP: Record<LocCongViecInput['sapXep'], string> = {
  ngayTao: 'createdAt',
  hanChot: 'ngayKetThucDuKien',
  uuTien: 'mucDoUuTien',
  tienDo: 'phanTramHoanThanh',
};

export async function danhSachCongViec(loc: LocCongViecInput) {
  const ds = await prisma.congViec.findMany({
    where: {
      ...(loc.trangThai && { trangThai: loc.trangThai }),
      ...(loc.mucDoUuTien && { mucDoUuTien: loc.mucDoUuTien }),
      ...(loc.q && {
        OR: [
          { ten: { contains: loc.q, mode: 'insensitive' as const } },
          { ma: { contains: loc.q, mode: 'insensitive' as const } },
          { moTa: { contains: loc.q, mode: 'insensitive' as const } },
        ],
      }),
    },
    orderBy: { [SAP_XEP[loc.sapXep]]: loc.chieu },
    include: {
      hangMucs: {
        select: { id: true, hanHoanThanh: true, daHoanThanh: true },
      },
    },
  });

  const bayGio = new Date();

  return ds.map(({ hangMucs, ...cv }) => ({
    ...cv,
    soHangMuc: hangMucs.length,
    // QUA_HAN không lưu trong DB — luôn tính lúc đọc, theo ranh giới ngày giờ VN
    soHangMucQuaHan: hangMucs.filter(
      (h) => h.hanHoanThanh && !h.daHoanThanh && tinhSoNgayConLai(h.hanHoanThanh, bayGio) < 0,
    ).length,
  }));
}

/** Chi tiết công việc kèm TOÀN BỘ cây hạng mục. */
export async function chiTietCongViec(id: string) {
  const cv = await prisma.congViec.findUnique({ where: { id } });
  if (!cv) throw new KhongTimThayError('Công việc');

  const hangMucPhang = await prisma.hangMuc.findMany({
    where: { congViecId: id },
    orderBy: [{ thuTu: 'asc' }, { ma: 'asc' }],
    include: {
      nguoiPhuTrach: { select: { id: true, hoTen: true, email: true, soDienThoai: true } },
      hoanThanhBoi: { select: { id: true, hoTen: true } },
      _count: { select: { tepDinhKem: true } },
    },
  });

  return { ...cv, cayHangMuc: dungCay(hangMucPhang as HangMucPhang[]) };
}

export async function taoCongViec(duLieu: TaoCongViecInput) {
  return prisma.$transaction(async (tx) => {
    return tx.congViec.create({
      data: {
        ma: await sinhMaCongViec(tx),
        ten: duLieu.ten,
        moTa: rongThanhNull(duLieu.moTa) ?? null,
        ngayBatDau: duLieu.ngayBatDau,
        ngayKetThucDuKien: duLieu.ngayKetThucDuKien,
        mucDoUuTien: duLieu.mucDoUuTien,
        trangThai: duLieu.trangThai,
      },
    });
  });
}

export async function capNhatCongViec(id: string, duLieu: CapNhatCongViecInput) {
  const hienTai = await prisma.congViec.findUnique({ where: { id } });
  if (!hienTai) throw new KhongTimThayError('Công việc');

  return prisma.congViec.update({
    where: { id },
    data: {
      ...(duLieu.ten !== undefined && { ten: duLieu.ten }),
      ...(duLieu.moTa !== undefined && { moTa: rongThanhNull(duLieu.moTa) }),
      ...(duLieu.ngayBatDau !== undefined && { ngayBatDau: duLieu.ngayBatDau }),
      ...(duLieu.ngayKetThucDuKien !== undefined && {
        ngayKetThucDuKien: duLieu.ngayKetThucDuKien,
      }),
      ...(duLieu.mucDoUuTien !== undefined && { mucDoUuTien: duLieu.mucDoUuTien }),
      ...(duLieu.trangThai !== undefined && { trangThai: duLieu.trangThai }),
    },
  });
}

export async function xoaCongViec(id: string) {
  const cv = await prisma.congViec.findUnique({ where: { id } });
  if (!cv) throw new KhongTimThayError('Công việc');

  // Hạng mục và tệp đính kèm bị xóa theo nhờ cascade khai báo ở schema
  await prisma.congViec.delete({ where: { id } });
  return { daXoa: true };
}

/** Đếm số hạng mục và tệp sẽ mất — để hộp thoại xác nhận nói rõ con số. */
export async function demAnhHuongKhiXoa(id: string) {
  const cv = await prisma.congViec.findUnique({
    where: { id },
    select: {
      ten: true,
      _count: { select: { hangMucs: true } },
    },
  });
  if (!cv) throw new KhongTimThayError('Công việc');

  const soTep = await prisma.tepDinhKem.count({ where: { hangMuc: { congViecId: id } } });

  return { ten: cv.ten, soHangMuc: cv._count.hangMucs, soTepDinhKem: soTep };
}
