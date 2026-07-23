import type { CapNhatNhanSuInput, LocNhanSuInput, TaoNhanSuInput } from '@ceo/shared';
import { prisma } from '../../lib/prisma.js';
import { DuLieuKhongHopLeError, KhongTimThayError } from '../../lib/errors.js';

/** Chuỗi rỗng từ form → null trong cơ sở dữ liệu, để không lẫn "chưa nhập" với "nhập rỗng". */
function rongThanhNull(v: string | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  return v.trim() === '' ? null : v.trim();
}

export async function danhSachNhanSu(loc: LocNhanSuInput) {
  const dieuKien = {
    ...(loc.dangHoatDong !== undefined && { dangHoatDong: loc.dangHoatDong }),
    ...(loc.q && {
      OR: [
        { hoTen: { contains: loc.q, mode: 'insensitive' as const } },
        { email: { contains: loc.q, mode: 'insensitive' as const } },
        { soDienThoai: { contains: loc.q } },
        { chucVu: { contains: loc.q, mode: 'insensitive' as const } },
      ],
    }),
  };

  const ds = await prisma.nhanSu.findMany({
    where: dieuKien,
    orderBy: [{ dangHoatDong: 'desc' }, { hoTen: 'asc' }],
    include: {
      // Đếm số hạng mục người này đang gánh (chưa hoàn thành)
      _count: { select: { hangMucPhuTrach: { where: { daHoanThanh: false } } } },
    },
  });

  return ds.map(({ _count, ...ns }) => ({ ...ns, soHangMucDangLam: _count.hangMucPhuTrach }));
}

export async function chiTietNhanSu(id: string) {
  const ns = await prisma.nhanSu.findUnique({ where: { id } });
  if (!ns) throw new KhongTimThayError('Nhân sự');
  return ns;
}

export async function taoNhanSu(duLieu: TaoNhanSuInput) {
  const daTonTai = await prisma.nhanSu.findUnique({ where: { email: duLieu.email } });

  if (daTonTai) {
    // Người đã nghỉ nay quay lại: KÍCH HOẠT LẠI bản ghi cũ thay vì báo lỗi.
    // Nếu chặn cứng thì email của người từng nghỉ sẽ bị khóa vĩnh viễn, và
    // toàn bộ lịch sử "ai đã hoàn thành việc gì" của họ cũng mất liên kết.
    if (!daTonTai.dangHoatDong) {
      return prisma.nhanSu.update({
        where: { id: daTonTai.id },
        data: {
          dangHoatDong: true,
          hoTen: duLieu.hoTen,
          soDienThoai: rongThanhNull(duLieu.soDienThoai) ?? daTonTai.soDienThoai,
          chucVu: rongThanhNull(duLieu.chucVu) ?? daTonTai.chucVu,
          ghiChu: rongThanhNull(duLieu.ghiChu) ?? daTonTai.ghiChu,
        },
      });
    }

    throw new DuLieuKhongHopLeError('Email này đã có trong danh bạ', [
      { truong: 'email', thongBao: `Đã tồn tại nhân sự "${daTonTai.hoTen}" dùng email này` },
    ]);
  }

  return prisma.nhanSu.create({
    data: {
      hoTen: duLieu.hoTen,
      email: duLieu.email,
      soDienThoai: rongThanhNull(duLieu.soDienThoai) ?? null,
      chucVu: rongThanhNull(duLieu.chucVu) ?? null,
      ghiChu: rongThanhNull(duLieu.ghiChu) ?? null,
    },
  });
}

export async function capNhatNhanSu(id: string, duLieu: CapNhatNhanSuInput) {
  await chiTietNhanSu(id);

  if (duLieu.email) {
    const trung = await prisma.nhanSu.findUnique({ where: { email: duLieu.email } });
    if (trung && trung.id !== id) {
      throw new DuLieuKhongHopLeError('Email này đã có trong danh bạ', [
        { truong: 'email', thongBao: `Đã tồn tại nhân sự "${trung.hoTen}" dùng email này` },
      ]);
    }
  }

  return prisma.nhanSu.update({
    where: { id },
    data: {
      ...(duLieu.hoTen !== undefined && { hoTen: duLieu.hoTen }),
      ...(duLieu.email !== undefined && { email: duLieu.email }),
      ...(duLieu.soDienThoai !== undefined && { soDienThoai: rongThanhNull(duLieu.soDienThoai) }),
      ...(duLieu.chucVu !== undefined && { chucVu: rongThanhNull(duLieu.chucVu) }),
      ...(duLieu.ghiChu !== undefined && { ghiChu: rongThanhNull(duLieu.ghiChu) }),
      ...(duLieu.dangHoatDong !== undefined && { dangHoatDong: duLieu.dangHoatDong }),
    },
  });
}

/**
 * "Xóa" nhân sự = tắt cờ hoạt động, KHÔNG xóa khỏi cơ sở dữ liệu.
 *
 * Lý do: người này có thể đã hoàn thành nhiều hạng mục trong quá khứ. Xóa cứng
 * sẽ làm mất lịch sử "ai đã làm việc gì" — thứ CEO cần khi rà soát về sau.
 */
export async function ngungHoatDongNhanSu(id: string) {
  await chiTietNhanSu(id);
  return prisma.nhanSu.update({ where: { id }, data: { dangHoatDong: false } });
}
