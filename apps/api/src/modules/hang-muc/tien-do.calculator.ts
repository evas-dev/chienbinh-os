import { tinhPhanTramCha, tinhPhanTramLa } from '@ceo/shared';
import type { Prisma } from '../../generated/prisma/client.js';

/**
 * Tính lại tiến độ và LAN NGƯỢC LÊN toàn bộ tổ tiên.
 *
 * Toàn bộ chạy trong một transaction để không bao giờ tồn tại trạng thái nửa
 * vời (con đã đổi mà cha chưa kịp cập nhật).
 *
 * Công thức trọng số nằm ở @ceo/shared để backend và frontend dùng chung —
 * xem utils/tien-do.ts.
 */

type Tx = Prisma.TransactionClient;

/**
 * Tính lại % cho MỘT nút dựa trên các con trực tiếp của nó.
 * Nút không có con là nút lá → giữ nguyên % của chính nó.
 *
 * @returns phần trăm sau khi tính lại
 */
async function tinhLaiMotNut(tx: Tx, hangMucId: string): Promise<number> {
  const nut = await tx.hangMuc.findUnique({
    where: { id: hangMucId },
    select: {
      loaiTienDo: true,
      daHoanThanh: true,
      phanTramHoanThanh: true,
      hangMucCon: { select: { trongSo: true, phanTramHoanThanh: true } },
    },
  });

  if (!nut) return 0;

  // Nút lá: phần trăm do người dùng nhập (hoặc suy từ ô tick)
  if (nut.hangMucCon.length === 0) {
    return tinhPhanTramLa(nut.loaiTienDo, nut.daHoanThanh, nut.phanTramHoanThanh);
  }

  // Nút cha: tính theo trọng số các con trực tiếp
  return tinhPhanTramCha(
    nut.hangMucCon.map((c) => ({ trongSo: c.trongSo, phanTram: c.phanTramHoanThanh })),
  );
}

/**
 * Cập nhật % của một hạng mục rồi lan ngược lên cha, ông, cụ... tới tận công việc.
 *
 * Có giới hạn số vòng lặp để phòng dữ liệu hỏng tạo thành vòng tròn trong cây —
 * dù tầng service đã chặn từ đầu, nhưng một vòng lặp vô hạn trong transaction
 * sẽ treo cả database nên vẫn cần lưới an toàn ở đây.
 */
export async function capNhatTienDoVaLanLenTren(tx: Tx, hangMucId: string): Promise<void> {
  const SO_CAP_TOI_DA = 50;

  let idHienTai: string | null = hangMucId;
  let soCap = 0;
  let congViecId: string | null = null;

  while (idHienTai && soCap < SO_CAP_TOI_DA) {
    const phanTramMoi = await tinhLaiMotNut(tx, idHienTai);

    // Chú thích kiểu tường minh: thiếu nó thì TypeScript báo lỗi suy kiểu vòng,
    // vì idHienTai vừa là đầu vào vừa được gán lại từ chính kết quả này.
    const daCapNhat: { hangMucChaId: string | null; congViecId: string } =
      await tx.hangMuc.update({
        where: { id: idHienTai },
        data: { phanTramHoanThanh: phanTramMoi },
        select: { hangMucChaId: true, congViecId: true },
      });

    congViecId = daCapNhat.congViecId;
    idHienTai = daCapNhat.hangMucChaId;
    soCap++;
  }

  if (congViecId) {
    await capNhatTienDoCongViec(tx, congViecId);
  }
}

/**
 * Tính lại % của công việc từ các hạng mục GỐC (không có cha).
 * Công việc không có hạng mục nào thì để 0.
 */
export async function capNhatTienDoCongViec(tx: Tx, congViecId: string): Promise<void> {
  const hangMucGoc = await tx.hangMuc.findMany({
    where: { congViecId, hangMucChaId: null },
    select: { trongSo: true, phanTramHoanThanh: true },
  });

  const phanTram =
    hangMucGoc.length === 0
      ? 0
      : tinhPhanTramCha(
          hangMucGoc.map((h) => ({ trongSo: h.trongSo, phanTram: h.phanTramHoanThanh })),
        );

  await tx.congViec.update({
    where: { id: congViecId },
    data: { phanTramHoanThanh: phanTram },
  });
}

/**
 * Tính lại toàn bộ cây của một công việc, từ lá lên gốc.
 * Dùng sau các thao tác đụng nhiều nút cùng lúc (xóa, kéo thả, chỉnh trọng số hàng loạt).
 */
export async function tinhLaiToanBoCay(tx: Tx, congViecId: string): Promise<void> {
  const tatCa = await tx.hangMuc.findMany({
    where: { congViecId },
    select: { id: true, hangMucChaId: true },
  });

  // Xếp theo độ sâu giảm dần: xử lý lá trước, gốc sau, để khi tính tới cha
  // thì mọi con của nó đã có số đúng.
  const doSau = new Map<string, number>();
  const cha = new Map(tatCa.map((h) => [h.id, h.hangMucChaId]));

  const tinhDoSau = (id: string): number => {
    const daCo = doSau.get(id);
    if (daCo !== undefined) return daCo;
    const idCha = cha.get(id);
    const d = idCha ? tinhDoSau(idCha) + 1 : 0;
    doSau.set(id, d);
    return d;
  };

  const theoThuTu = tatCa
    .map((h) => ({ id: h.id, d: tinhDoSau(h.id) }))
    .sort((a, b) => b.d - a.d);

  for (const { id } of theoThuTu) {
    const phanTram = await tinhLaiMotNut(tx, id);
    await tx.hangMuc.update({ where: { id }, data: { phanTramHoanThanh: phanTram } });
  }

  await capNhatTienDoCongViec(tx, congViecId);
}
