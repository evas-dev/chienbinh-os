import type { HangMucDTO } from '@ceo/shared';
import { XungDotError } from '../../lib/errors.js';
import type { Prisma } from '../../generated/prisma/client.js';

type Tx = Prisma.TransactionClient;

/** Dữ liệu phẳng lấy từ DB trước khi dựng thành cây. */
export interface HangMucPhang {
  id: string;
  ma: string;
  ten: string;
  congViecId: string;
  hangMucChaId: string | null;
  ghiChu: string | null;
  hanHoanThanh: Date | null;
  thuTu: number;
  trongSo: number;
  loaiTienDo: 'CHECKBOX' | 'PHAN_TRAM';
  phanTramHoanThanh: number;
  daHoanThanh: boolean;
  hoanThanhLuc: Date | null;
  trangThai: 'CHUA_BAT_DAU' | 'DANG_LAM' | 'CHO_XAC_NHAN' | 'HOAN_THANH';
  nguoiPhuTrach: { id: string; hoTen: string; email: string; soDienThoai: string | null } | null;
  hoanThanhBoi: { id: string; hoTen: string } | null;
  _count: { tepDinhKem: number };
}

/**
 * Dựng cây từ danh sách phẳng.
 *
 * Nạp phẳng rồi dựng trong bộ nhớ thay vì truy vấn đệ quy: cây chỉ sâu 2–3 cấp
 * và mỗi công việc chỉ vài chục hạng mục, nên cách này nhanh hơn và đơn giản
 * hơn nhiều so với recursive CTE.
 */
export function dungCay(danhSach: HangMucPhang[]): HangMucDTO[] {
  const chuyenDoi = (h: HangMucPhang): HangMucDTO => ({
    id: h.id,
    ma: h.ma,
    ten: h.ten,
    congViecId: h.congViecId,
    hangMucChaId: h.hangMucChaId,
    ghiChu: h.ghiChu,
    hanHoanThanh: h.hanHoanThanh?.toISOString() ?? null,
    thuTu: h.thuTu,
    trongSo: h.trongSo,
    loaiTienDo: h.loaiTienDo,
    phanTramHoanThanh: h.phanTramHoanThanh,
    daHoanThanh: h.daHoanThanh,
    hoanThanhLuc: h.hoanThanhLuc?.toISOString() ?? null,
    trangThai: h.trangThai,
    nguoiPhuTrach: h.nguoiPhuTrach,
    hoanThanhBoi: h.hoanThanhBoi,
    soTepDinhKem: h._count.tepDinhKem,
    hangMucCon: [],
  });

  const theoId = new Map<string, HangMucDTO>();
  for (const h of danhSach) theoId.set(h.id, chuyenDoi(h));

  const goc: HangMucDTO[] = [];
  for (const h of danhSach) {
    const nut = theoId.get(h.id);
    if (!nut) continue;

    if (h.hangMucChaId) {
      // Cha có thể không nằm trong tập đã nạp (ví dụ khi lọc) → coi như nút gốc
      const cha = theoId.get(h.hangMucChaId);
      if (cha) cha.hangMucCon.push(nut);
      else goc.push(nut);
    } else {
      goc.push(nut);
    }
  }

  const sapXep = (ds: HangMucDTO[]) => {
    ds.sort((a, b) => a.thuTu - b.thuTu || a.ma.localeCompare(b.ma));
    for (const n of ds) sapXep(n.hangMucCon);
  };
  sapXep(goc);

  return goc;
}

/**
 * Chặn tạo vòng tròn trong cây khi kéo thả.
 *
 * Không cho phép đặt một hạng mục làm con của chính nó hoặc của bất kỳ hậu duệ
 * nào của nó — nếu lọt, cây sẽ thành vòng tròn và hàm lan tiến độ sẽ chạy mãi
 * không dừng.
 */
export async function kiemTraKhongTaoVongLap(
  tx: Tx,
  hangMucId: string,
  chaMoiId: string | null,
): Promise<void> {
  if (!chaMoiId) return;

  if (chaMoiId === hangMucId) {
    throw new XungDotError('Không thể đặt một hạng mục làm con của chính nó');
  }

  // Đi ngược từ cha mới lên gốc; nếu gặp lại chính hạng mục đang di chuyển
  // thì tức là ta đang cố đưa nó vào bên trong nhánh con của nó.
  const SO_CAP_TOI_DA = 50;
  let idHienTai: string | null = chaMoiId;
  let soCap = 0;

  while (idHienTai && soCap < SO_CAP_TOI_DA) {
    if (idHienTai === hangMucId) {
      throw new XungDotError(
        'Không thể chuyển hạng mục vào bên trong một hạng mục con của chính nó',
      );
    }
    const nut: { hangMucChaId: string | null } | null = await tx.hangMuc.findUnique({
      where: { id: idHienTai },
      select: { hangMucChaId: true },
    });
    idHienTai = nut?.hangMucChaId ?? null;
    soCap++;
  }
}
