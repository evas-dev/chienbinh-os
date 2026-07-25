import {
  tinhSoNgayConLai,
  xepMucCanhBao,
  type DongToiHanDTO,
  type KetQuaBangToiHan,
  type LocBangToiHanInput,
  type ThongKeToiHan,
} from '@ceo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { layNguongCanhBao } from '../cau-hinh/cau-hinh.service.js';

/**
 * Bảng checklist tới hạn — một read-model RIÊNG, không dùng lại API cây hạng mục.
 *
 * Lý do tách: bảng này cần dữ liệu PHẲNG đã ghép sẵn tên công việc + người phụ
 * trách, sắp theo hạn xuyên suốt mọi công việc. Query thẳng từ bảng HangMuc với
 * index hanHoanThanh, không dựng cây trong bộ nhớ.
 */
export async function layBangToiHan(loc: LocBangToiHanInput): Promise<KetQuaBangToiHan> {
  const nguongVang = await layNguongCanhBao();
  const dieuKien = dungDieuKien(loc);

  // Đếm tổng và lấy trang song song cho nhanh
  const [tong, cacHang] = await Promise.all([
    prisma.hangMuc.count({ where: dieuKien }),
    prisma.hangMuc.findMany({
      where: dieuKien,
      // Việc CHƯA XONG luôn lên trước, trong đó hạn gần nhất lên đầu.
      // Việc đã xong đẩy xuống cuối dù hạn có gần đến đâu.
      orderBy: [{ daHoanThanh: 'asc' }, { hanHoanThanh: 'asc' }],
      skip: (loc.trang - 1) * loc.soDong,
      take: loc.soDong,
      include: {
        congViec: { select: { id: true, ma: true, ten: true } },
        nguoiPhuTrach: {
          select: { id: true, hoTen: true, email: true, soDienThoai: true },
        },
        hoanThanhBoi: { select: { hoTen: true } },
      },
    }),
  ]);

  const duLieu: DongToiHanDTO[] = cacHang.map((hm) => {
    // hanHoanThanh chắc chắn khác null vì điều kiện lọc đã yêu cầu, nhưng kiểu
    // Prisma vẫn cho là nullable → khẳng định lại để tính ngày.
    const han = hm.hanHoanThanh as Date;
    const soNgayConLai = tinhSoNgayConLai(han);

    return {
      hangMucId: hm.id,
      maHangMuc: hm.ma,
      tenHangMuc: hm.ten,
      congViecId: hm.congViec.id,
      maCongViec: hm.congViec.ma,
      tenCongViec: hm.congViec.ten,
      hanHoanThanh: han.toISOString(),
      soNgayConLai,
      mucCanhBao: xepMucCanhBao(soNgayConLai, nguongVang, hm.daHoanThanh),
      nguoiPhuTrach: hm.nguoiPhuTrach,
      phanTramHoanThanh: hm.phanTramHoanThanh,
      trangThai: hm.trangThai,
      daHoanThanh: hm.daHoanThanh,
      hoanThanhBoi: hm.hoanThanhBoi,
      ghiChu: hm.ghiChu,
    };
  });

  const thongKe = await tinhThongKe(loc, nguongVang);

  return { duLieu, tong, trang: loc.trang, soDong: loc.soDong, thongKe };
}

/** Dựng điều kiện WHERE dùng chung cho cả đếm, lấy trang và thống kê. */
function dungDieuKien(loc: LocBangToiHanInput): Prisma.HangMucWhereInput {
  return {
    // Chỉ hạng mục CÓ HẠN mới thuộc bảng "tới hạn"
    hanHoanThanh: {
      not: null,
      ...(loc.tuNgay && { gte: loc.tuNgay }),
      ...(loc.denNgay && { lte: loc.denNgay }),
    },
    ...(loc.nhanSuId && { nguoiPhuTrachId: loc.nhanSuId }),
    ...(loc.congViecId && { congViecId: loc.congViecId }),
    ...(loc.trangThai && { trangThai: loc.trangThai }),
    ...(loc.chuaXong !== undefined && { daHoanThanh: !loc.chuaXong }),
    ...(loc.q && {
      OR: [
        { ten: { contains: loc.q, mode: 'insensitive' } },
        { ma: { contains: loc.q, mode: 'insensitive' } },
        { congViec: { ten: { contains: loc.q, mode: 'insensitive' } } },
        { nguoiPhuTrach: { hoTen: { contains: loc.q, mode: 'insensitive' } } },
      ],
    }),
  };
}

/**
 * Thống kê trên TOÀN BỘ tập đã lọc (bỏ qua phân trang).
 *
 * QUA_HAN và các mức cảnh báo không lưu trong DB nên không đếm bằng SQL được;
 * phải nạp trường ngày của cả tập rồi tính. Chỉ lấy hai cột nhẹ để không tốn.
 */
async function tinhThongKe(
  loc: LocBangToiHanInput,
  nguongVang: number,
): Promise<ThongKeToiHan> {
  const dieuKien = dungDieuKien(loc);
  const cacHang = await prisma.hangMuc.findMany({
    where: dieuKien,
    select: { hanHoanThanh: true, daHoanThanh: true },
  });

  let quaHan = 0;
  let denHanHomNay = 0;
  let sapToiHan = 0;

  for (const hm of cacHang) {
    const soNgay = tinhSoNgayConLai(hm.hanHoanThanh as Date);
    const muc = xepMucCanhBao(soNgay, nguongVang, hm.daHoanThanh);
    if (muc === 'QUA_HAN') quaHan++;
    else if (muc === 'HOM_NAY') denHanHomNay++;
    else if (muc === 'SAP_TOI') sapToiHan++;
  }

  return { quaHan, denHanHomNay, sapToiHan, tongCong: cacHang.length };
}
