import type { Prisma } from '../generated/prisma/client.js';

type Tx = Prisma.TransactionClient;

/**
 * Sinh mã người đọc được: CV-0001 cho công việc, HM-0042 cho hạng mục.
 *
 * Vì sao cần mã riêng thay vì dùng thẳng id?
 *  - CEO gọi tên được trong cuộc họp: "hạng mục HM-0042 đến đâu rồi?"
 *  - Mã hạng mục được NHÚNG VÀO TIÊU ĐỀ EMAIL, nhờ đó khi nhân viên bấm Trả lời
 *    thì Gmail giữ nguyên mã và hệ thống đối chiếu lại được.
 *
 * Cách sinh: lấy mã lớn nhất hiện có rồi cộng 1. Chạy trong transaction nên an
 * toàn với ứng dụng một người dùng như thế này.
 */

const DO_DAI_SO = 4;

function ghepMa(tienTo: string, so: number): string {
  return `${tienTo}-${String(so).padStart(DO_DAI_SO, '0')}`;
}

function tachSo(ma: string): number {
  const phan = ma.split('-')[1];
  const so = phan ? Number.parseInt(phan, 10) : 0;
  return Number.isNaN(so) ? 0 : so;
}

export async function sinhMaCongViec(tx: Tx): Promise<string> {
  const moiNhat = await tx.congViec.findFirst({
    orderBy: { ma: 'desc' },
    select: { ma: true },
  });
  return ghepMa('CV', moiNhat ? tachSo(moiNhat.ma) + 1 : 1);
}

export async function sinhMaHangMuc(tx: Tx): Promise<string> {
  const moiNhat = await tx.hangMuc.findFirst({
    orderBy: { ma: 'desc' },
    select: { ma: true },
  });
  return ghepMa('HM', moiNhat ? tachSo(moiNhat.ma) + 1 : 1);
}
