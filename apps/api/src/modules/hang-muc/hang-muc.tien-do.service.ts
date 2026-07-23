import { tinhPhanTramLa, type CapNhatTienDoInput } from '@ceo/shared';
import { prisma } from '../../lib/prisma.js';
import { KhongTimThayError } from '../../lib/errors.js';
import { capNhatTienDoVaLanLenTren } from './tien-do.calculator.js';
import { KEM_THEO } from './hang-muc.chung.js';

/**
 * Cập nhật tiến độ và phân công người phụ trách.
 */

/**
 * Cập nhật tiến độ của một hạng mục rồi lan ngược lên toàn bộ tổ tiên.
 *
 * CHỈ NÚT LÁ mới nhận giá trị nhập tay. Nút cha có phần trăm tính từ các con
 * nên nếu gửi lên cũng bị bỏ qua — giao diện đã để nút cha ở dạng chỉ đọc.
 */
export async function capNhatTienDo(id: string, duLieu: CapNhatTienDoInput) {
  return prisma.$transaction(async (tx) => {
    const hienTai = await tx.hangMuc.findUnique({
      where: { id },
      select: {
        loaiTienDo: true,
        daHoanThanh: true,
        _count: { select: { hangMucCon: true } },
      },
    });
    if (!hienTai) throw new KhongTimThayError('Hạng mục');

    const laNutLa = hienTai._count.hangMucCon === 0;

    if (laNutLa) {
      const daHoanThanh =
        duLieu.daHoanThanh ??
        (duLieu.phanTram !== undefined ? duLieu.phanTram >= 100 : hienTai.daHoanThanh);

      const phanTram = tinhPhanTramLa(
        hienTai.loaiTienDo,
        daHoanThanh,
        duLieu.phanTram ?? (daHoanThanh ? 100 : 0),
      );

      await tx.hangMuc.update({
        where: { id },
        data: {
          daHoanThanh,
          phanTramHoanThanh: phanTram,
          hoanThanhLuc: daHoanThanh ? new Date() : null,
          hoanThanhBoiId: daHoanThanh ? (duLieu.hoanThanhBoiId ?? null) : null,
          trangThai: daHoanThanh ? 'HOAN_THANH' : phanTram > 0 ? 'DANG_LAM' : 'CHUA_BAT_DAU',
        },
      });
    }

    await capNhatTienDoVaLanLenTren(tx, id);

    return tx.hangMuc.findUniqueOrThrow({ where: { id }, include: KEM_THEO });
  });
}

/**
 * Gán người phụ trách cho hạng mục.
 *
 * Giai đoạn 4 sẽ chèn bước gửi email giao việc tự động vào đây, kèm hai chốt
 * chặn: không gửi trùng cho cùng cặp (hạng mục, nhân sự), và công tắc tổng
 * TU_DONG_GUI_MAIL để tắt khi nhập liệu hàng loạt.
 */
export async function ganNguoiPhuTrach(id: string, nguoiPhuTrachId: string | null) {
  const hm = await prisma.hangMuc.findUnique({ where: { id } });
  if (!hm) throw new KhongTimThayError('Hạng mục');

  if (nguoiPhuTrachId) {
    const ns = await prisma.nhanSu.findUnique({ where: { id: nguoiPhuTrachId } });
    if (!ns) throw new KhongTimThayError('Nhân sự');
  }

  return prisma.hangMuc.update({
    where: { id },
    data: { nguoiPhuTrachId },
    include: KEM_THEO,
  });
}
