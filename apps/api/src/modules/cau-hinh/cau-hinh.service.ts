import {
  KHOA_CAU_HINH,
  NGUONG_CANH_BAO_MAC_DINH,
  type CapNhatCauHinhInput,
  type CauHinhDTO,
} from '@ceo/shared';
import { prisma } from '../../lib/prisma.js';

/**
 * Giá trị mặc định khi bảng CauHinh chưa có bản ghi tương ứng.
 * Nhờ vậy ứng dụng chạy được ngay cả trên cơ sở dữ liệu chưa seed cấu hình.
 */
const MAC_DINH: CauHinhDTO = {
  NGUONG_CANH_BAO_VANG: NGUONG_CANH_BAO_MAC_DINH,
  TU_DONG_GUI_MAIL: true,
  BAT_CRON_QUET_MAIL: false,
  CHU_KY_QUET_PHUT: 5,
};

/** Đọc toàn bộ cấu hình, điền giá trị mặc định cho khóa còn thiếu. */
export async function layCauHinh(): Promise<CauHinhDTO> {
  const cacBanGhi = await prisma.cauHinh.findMany();
  const bang = new Map(cacBanGhi.map((r) => [r.khoa, r.giaTri]));

  return {
    NGUONG_CANH_BAO_VANG: docSo(bang, KHOA_CAU_HINH.NGUONG_CANH_BAO_VANG, MAC_DINH.NGUONG_CANH_BAO_VANG),
    TU_DONG_GUI_MAIL: docBool(bang, KHOA_CAU_HINH.TU_DONG_GUI_MAIL, MAC_DINH.TU_DONG_GUI_MAIL),
    BAT_CRON_QUET_MAIL: docBool(bang, KHOA_CAU_HINH.BAT_CRON_QUET_MAIL, MAC_DINH.BAT_CRON_QUET_MAIL),
    CHU_KY_QUET_PHUT: docSo(bang, KHOA_CAU_HINH.CHU_KY_QUET_PHUT, MAC_DINH.CHU_KY_QUET_PHUT),
  };
}

/** Chỉ đọc ngưỡng cảnh báo — dùng riêng cho bảng tới hạn để đỡ đọc thừa. */
export async function layNguongCanhBao(): Promise<number> {
  const banGhi = await prisma.cauHinh.findUnique({
    where: { khoa: KHOA_CAU_HINH.NGUONG_CANH_BAO_VANG },
  });
  const so = banGhi ? Number.parseInt(banGhi.giaTri, 10) : NaN;
  return Number.isNaN(so) ? NGUONG_CANH_BAO_MAC_DINH : so;
}

/** Ghi cấu hình. Chỉ cập nhật những khóa được gửi lên (upsert từng khóa). */
export async function capNhatCauHinh(duLieu: CapNhatCauHinhInput): Promise<CauHinhDTO> {
  const cacKhoa = Object.entries(duLieu).filter(([, v]) => v !== undefined);

  await prisma.$transaction(
    cacKhoa.map(([khoa, giaTri]) =>
      prisma.cauHinh.upsert({
        where: { khoa },
        create: { khoa, giaTri: String(giaTri) },
        update: { giaTri: String(giaTri) },
      }),
    ),
  );

  return layCauHinh();
}

function docSo(bang: Map<string, string>, khoa: string, macDinh: number): number {
  const v = bang.get(khoa);
  const so = v ? Number.parseInt(v, 10) : NaN;
  return Number.isNaN(so) ? macDinh : so;
}

function docBool(bang: Map<string, string>, khoa: string, macDinh: boolean): boolean {
  const v = bang.get(khoa);
  return v === undefined ? macDinh : v === 'true' || v === '1';
}
