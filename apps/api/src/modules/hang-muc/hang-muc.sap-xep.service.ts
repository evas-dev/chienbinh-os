import type { CapNhatTrongSoInput, SapXepLaiInput } from '@ceo/shared';
import { prisma } from '../../lib/prisma.js';
import { KhongTimThayError } from '../../lib/errors.js';
import { tinhLaiToanBoCay } from './tien-do.calculator.js';
import { kiemTraKhongTaoVongLap } from './cay-hang-muc.js';

/**
 * Sắp xếp cây và chỉnh trọng số hàng loạt.
 */

/** Chỉnh trọng số cho cả một nhóm anh em (nút "Chia đều" trên giao diện). */
export async function capNhatTrongSoHangLoat(duLieu: CapNhatTrongSoInput) {
  return prisma.$transaction(async (tx) => {
    const dau = await tx.hangMuc.findUnique({
      where: { id: duLieu[0]!.id },
      select: { congViecId: true },
    });
    if (!dau) throw new KhongTimThayError('Hạng mục');

    await Promise.all(
      duLieu.map((m) => tx.hangMuc.update({ where: { id: m.id }, data: { trongSo: m.trongSo } })),
    );

    await tinhLaiToanBoCay(tx, dau.congViecId);

    return { soLuongCapNhat: duLieu.length };
  });
}

/** Kéo thả: đổi thứ tự và/hoặc chuyển sang hạng mục cha khác. */
export async function sapXepLai(duLieu: SapXepLaiInput) {
  return prisma.$transaction(async (tx) => {
    const dau = await tx.hangMuc.findUnique({
      where: { id: duLieu[0]!.id },
      select: { congViecId: true },
    });
    if (!dau) throw new KhongTimThayError('Hạng mục');

    // Chặn tạo vòng tròn TRƯỚC khi ghi bất cứ thứ gì xuống cơ sở dữ liệu
    for (const m of duLieu) {
      await kiemTraKhongTaoVongLap(tx, m.id, m.hangMucChaId ?? null);
    }

    for (const m of duLieu) {
      await tx.hangMuc.update({
        where: { id: m.id },
        data: { thuTu: m.thuTu, hangMucChaId: m.hangMucChaId ?? null },
      });
    }

    await tinhLaiToanBoCay(tx, dau.congViecId);

    return { soLuongCapNhat: duLieu.length };
  });
}

/**
 * Đếm số hạng mục con và tệp đính kèm sẽ mất khi xóa —
 * để hộp thoại xác nhận nói rõ con số thay vì hỏi chung chung.
 */
export async function demAnhHuongKhiXoa(id: string) {
  const goc = await prisma.hangMuc.findUnique({ where: { id }, select: { congViecId: true } });
  if (!goc) throw new KhongTimThayError('Hạng mục');

  const tatCa = await prisma.hangMuc.findMany({
    where: { congViecId: goc.congViecId },
    select: { id: true, hangMucChaId: true, _count: { select: { tepDinhKem: true } } },
  });

  const conTheoCha = new Map<string, string[]>();
  for (const h of tatCa) {
    if (!h.hangMucChaId) continue;
    const ds = conTheoCha.get(h.hangMucChaId) ?? [];
    ds.push(h.id);
    conTheoCha.set(h.hangMucChaId, ds);
  }

  const soTep = new Map(tatCa.map((h) => [h.id, h._count.tepDinhKem]));

  let soHangMucCon = 0;
  let tongTep = soTep.get(id) ?? 0;
  const hangDoi = [...(conTheoCha.get(id) ?? [])];

  // Duyệt xuống toàn bộ nhánh con, cộng dồn số hạng mục và số tệp
  while (hangDoi.length > 0) {
    const hienTai = hangDoi.pop()!;
    soHangMucCon++;
    tongTep += soTep.get(hienTai) ?? 0;
    hangDoi.push(...(conTheoCha.get(hienTai) ?? []));
  }

  return { soHangMucCon, soTepDinhKem: tongTep };
}
