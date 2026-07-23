import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const thuMuc = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(thuMuc, '../../../.env'), quiet: true });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/**
 * Dữ liệu mẫu để mở ứng dụng lần đầu là thấy giao diện có nội dung thật.
 *
 * TOÀN BỘ dùng upsert nên chạy bao nhiêu lần cũng không nhân bản dữ liệu.
 */

/** Ngày cách hôm nay N ngày (âm = quá khứ). Đặt giờ trưa để tránh lệch ranh giới ngày. */
function ngayCach(soNgay: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + soNgay);
  d.setHours(12, 0, 0, 0);
  return d;
}

const NHAN_SU = [
  { ma: 'ns1', hoTen: 'Nguyễn Văn An', email: 'an.nguyen@example.com', soDienThoai: '0912345671', chucVu: 'Trưởng phòng Kỹ thuật' },
  { ma: 'ns2', hoTen: 'Trần Thị Bình', email: 'binh.tran@example.com', soDienThoai: '0912345672', chucVu: 'Kế toán trưởng' },
  { ma: 'ns3', hoTen: 'Lê Hoàng Cường', email: 'cuong.le@example.com', soDienThoai: '0912345673', chucVu: 'Giám sát công trình' },
  { ma: 'ns4', hoTen: 'Phạm Thu Dung', email: 'dung.pham@example.com', soDienThoai: '0912345674', chucVu: 'Chuyên viên Hành chính' },
];

const CAU_HINH = [
  { khoa: 'NGUONG_CANH_BAO_VANG', giaTri: '3' },
  { khoa: 'TU_DONG_GUI_MAIL', giaTri: 'true' },
  { khoa: 'BAT_CRON_QUET_MAIL', giaTri: 'false' },
  { khoa: 'CHU_KY_QUET_PHUT', giaTri: '15' },
];

async function main() {
  console.log('Đang tạo dữ liệu mẫu...');

  // --- Nhân sự ---
  const nhanSu: Record<string, string> = {};
  for (const ns of NHAN_SU) {
    const ban = await prisma.nhanSu.upsert({
      where: { email: ns.email },
      update: { hoTen: ns.hoTen, soDienThoai: ns.soDienThoai, chucVu: ns.chucVu },
      create: { hoTen: ns.hoTen, email: ns.email, soDienThoai: ns.soDienThoai, chucVu: ns.chucVu },
    });
    nhanSu[ns.ma] = ban.id;
  }

  // --- Cấu hình ---
  for (const ch of CAU_HINH) {
    await prisma.cauHinh.upsert({
      where: { khoa: ch.khoa },
      update: {},
      create: ch,
    });
  }

  // -------------------------------------------------------------------------
  // Công việc 1 — đang chạy đúng tiến độ, có cây 3 cấp
  // -------------------------------------------------------------------------
  const cv1 = await prisma.congViec.upsert({
    where: { ma: 'CV-0001' },
    update: {},
    create: {
      ma: 'CV-0001',
      ten: 'Xây dựng nhà xưởng số 2',
      moTa: 'Thi công nhà xưởng 1200m² tại khu công nghiệp Bắc Thăng Long.',
      ngayBatDau: ngayCach(-30),
      ngayKetThucDuKien: ngayCach(60),
      mucDoUuTien: 'CAO',
      trangThai: 'DANG_LAM',
    },
  });

  await taoCay(cv1.id, [
    {
      ma: 'HM-0001', ten: 'Phần móng', trongSo: 30, phanTram: 100, daHoanThanh: true,
      nguoiPhuTrach: nhanSu.ns3, han: ngayCach(-10), hoanThanhBoi: nhanSu.ns3,
      con: [
        { ma: 'HM-0002', ten: 'Khảo sát địa chất', trongSo: 30, phanTram: 100, daHoanThanh: true, nguoiPhuTrach: nhanSu.ns3, han: ngayCach(-25), hoanThanhBoi: nhanSu.ns3 },
        { ma: 'HM-0003', ten: 'Đổ bê tông móng', trongSo: 70, phanTram: 100, daHoanThanh: true, nguoiPhuTrach: nhanSu.ns1, han: ngayCach(-12), hoanThanhBoi: nhanSu.ns1 },
      ],
    },
    {
      ma: 'HM-0004', ten: 'Phần thân', trongSo: 50, phanTram: 0, daHoanThanh: false,
      nguoiPhuTrach: nhanSu.ns1, han: ngayCach(25),
      con: [
        { ma: 'HM-0005', ten: 'Dựng khung thép', trongSo: 60, phanTram: 70, daHoanThanh: false, loaiTienDo: 'PHAN_TRAM' as const, nguoiPhuTrach: nhanSu.ns1, han: ngayCach(2) },
        { ma: 'HM-0006', ten: 'Lợp mái tôn', trongSo: 40, phanTram: 0, daHoanThanh: false, nguoiPhuTrach: nhanSu.ns3, han: ngayCach(20) },
      ],
    },
    {
      ma: 'HM-0007', ten: 'Hoàn thiện & nghiệm thu', trongSo: 20, phanTram: 0, daHoanThanh: false,
      nguoiPhuTrach: nhanSu.ns2, han: ngayCach(55),
    },
  ]);

  // -------------------------------------------------------------------------
  // Công việc 2 — CÓ HẠNG MỤC QUÁ HẠN, để thấy ngay badge đỏ trên giao diện
  // -------------------------------------------------------------------------
  const cv2 = await prisma.congViec.upsert({
    where: { ma: 'CV-0002' },
    update: {},
    create: {
      ma: 'CV-0002',
      ten: 'Hồ sơ dự thầu gói xây lắp Q3',
      moTa: 'Chuẩn bị và nộp hồ sơ dự thầu trước hạn đóng thầu.',
      ngayBatDau: ngayCach(-20),
      ngayKetThucDuKien: ngayCach(10),
      mucDoUuTien: 'CAO',
      trangThai: 'DANG_LAM',
    },
  });

  await taoCay(cv2.id, [
    { ma: 'HM-0008', ten: 'Thu thập hồ sơ pháp lý', trongSo: 25, phanTram: 100, daHoanThanh: true, nguoiPhuTrach: nhanSu.ns4, han: ngayCach(-8), hoanThanhBoi: nhanSu.ns4 },
    // QUÁ HẠN 3 ngày — badge đỏ
    { ma: 'HM-0009', ten: 'Lập bảng dự toán chi tiết', trongSo: 40, phanTram: 60, daHoanThanh: false, loaiTienDo: 'PHAN_TRAM' as const, nguoiPhuTrach: nhanSu.ns2, han: ngayCach(-3) },
    // ĐẾN HẠN HÔM NAY — badge vàng đậm
    { ma: 'HM-0010', ten: 'Hoàn thiện thuyết minh kỹ thuật', trongSo: 25, phanTram: 30, daHoanThanh: false, loaiTienDo: 'PHAN_TRAM' as const, nguoiPhuTrach: nhanSu.ns1, han: ngayCach(0) },
    // SẮP TỚI HẠN (2 ngày) — badge vàng
    { ma: 'HM-0011', ten: 'Nộp hồ sơ tại bên mời thầu', trongSo: 10, phanTram: 0, daHoanThanh: false, nguoiPhuTrach: nhanSu.ns4, han: ngayCach(2) },
  ]);

  // -------------------------------------------------------------------------
  // Công việc 3 — sắp hoàn thành
  // -------------------------------------------------------------------------
  const cv3 = await prisma.congViec.upsert({
    where: { ma: 'CV-0003' },
    update: {},
    create: {
      ma: 'CV-0003',
      ten: 'Quyết toán thuế quý II',
      moTa: 'Rà soát chứng từ và nộp báo cáo quyết toán thuế quý II.',
      ngayBatDau: ngayCach(-45),
      ngayKetThucDuKien: ngayCach(5),
      mucDoUuTien: 'TRUNG_BINH',
      trangThai: 'DANG_LAM',
    },
  });

  await taoCay(cv3.id, [
    { ma: 'HM-0012', ten: 'Rà soát hóa đơn đầu vào', trongSo: 40, phanTram: 100, daHoanThanh: true, nguoiPhuTrach: nhanSu.ns2, han: ngayCach(-15), hoanThanhBoi: nhanSu.ns2 },
    { ma: 'HM-0013', ten: 'Đối chiếu sổ sách', trongSo: 40, phanTram: 100, daHoanThanh: true, nguoiPhuTrach: nhanSu.ns2, han: ngayCach(-5), hoanThanhBoi: nhanSu.ns2 },
    { ma: 'HM-0014', ten: 'Nộp tờ khai quyết toán', trongSo: 20, phanTram: 0, daHoanThanh: false, nguoiPhuTrach: nhanSu.ns2, han: ngayCach(4) },
  ]);

  await tinhLaiTatCa();

  const [sNS, sCV, sHM] = await Promise.all([
    prisma.nhanSu.count(),
    prisma.congViec.count(),
    prisma.hangMuc.count(),
  ]);

  console.log(`Xong: ${sNS} nhân sự · ${sCV} công việc · ${sHM} hạng mục`);
}

interface NutMau {
  ma: string;
  ten: string;
  trongSo: number;
  phanTram: number;
  daHoanThanh: boolean;
  loaiTienDo?: 'CHECKBOX' | 'PHAN_TRAM';
  nguoiPhuTrach?: string;
  hoanThanhBoi?: string;
  han?: Date;
  con?: NutMau[];
}

async function taoCay(congViecId: string, nut: NutMau[], chaId: string | null = null) {
  for (const [i, n] of nut.entries()) {
    const ban = await prisma.hangMuc.upsert({
      where: { ma: n.ma },
      update: {},
      create: {
        ma: n.ma,
        ten: n.ten,
        congViecId,
        hangMucChaId: chaId,
        thuTu: i,
        trongSo: n.trongSo,
        loaiTienDo: n.loaiTienDo ?? 'CHECKBOX',
        phanTramHoanThanh: n.phanTram,
        daHoanThanh: n.daHoanThanh,
        hoanThanhLuc: n.daHoanThanh ? ngayCach(-1) : null,
        hoanThanhBoiId: n.hoanThanhBoi ?? null,
        nguoiPhuTrachId: n.nguoiPhuTrach ?? null,
        hanHoanThanh: n.han ?? null,
        trangThai: n.daHoanThanh ? 'HOAN_THANH' : n.phanTram > 0 ? 'DANG_LAM' : 'CHUA_BAT_DAU',
      },
    });

    if (n.con) await taoCay(congViecId, n.con, ban.id);
  }
}

/** Tính lại phần trăm cho toàn bộ dữ liệu mẫu, dùng đúng công thức trọng số của ứng dụng. */
async function tinhLaiTatCa() {
  const { tinhLaiToanBoCay } = await import('../src/modules/hang-muc/tien-do.calculator.js');
  const dsCongViec = await prisma.congViec.findMany({ select: { id: true } });
  for (const cv of dsCongViec) {
    await prisma.$transaction((tx) => tinhLaiToanBoCay(tx, cv.id));
  }
}

main()
  .catch((e) => {
    console.error('Tạo dữ liệu mẫu thất bại:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
