-- CreateEnum
CREATE TYPE "MucDoUuTien" AS ENUM ('CAO', 'TRUNG_BINH', 'THAP');

-- CreateEnum
CREATE TYPE "TrangThaiCongViec" AS ENUM ('CHUA_BAT_DAU', 'DANG_LAM', 'TAM_DUNG', 'HOAN_THANH', 'HUY');

-- CreateEnum
CREATE TYPE "TrangThaiHangMuc" AS ENUM ('CHUA_BAT_DAU', 'DANG_LAM', 'CHO_XAC_NHAN', 'HOAN_THANH');

-- CreateEnum
CREATE TYPE "LoaiTienDo" AS ENUM ('CHECKBOX', 'PHAN_TRAM');

-- CreateEnum
CREATE TYPE "HuongEmail" AS ENUM ('GUI_DI', 'NHAN_VE');

-- CreateEnum
CREATE TYPE "TrangThaiEmail" AS ENUM ('CHO_GUI', 'DA_GUI', 'LOI');

-- CreateEnum
CREATE TYPE "NguonDeXuat" AS ENUM ('EMAIL_REPLY', 'MAGIC_LINK');

-- CreateEnum
CREATE TYPE "TrangThaiDeXuat" AS ENUM ('CHO_DUYET', 'DA_DUYET', 'TU_CHOI');

-- CreateTable
CREATE TABLE "nhan_su" (
    "id" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "soDienThoai" TEXT,
    "chucVu" TEXT,
    "ghiChu" TEXT,
    "dangHoatDong" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nhan_su_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cong_viec" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,
    "ngayBatDau" TIMESTAMP(3) NOT NULL,
    "ngayKetThucDuKien" TIMESTAMP(3) NOT NULL,
    "mucDoUuTien" "MucDoUuTien" NOT NULL DEFAULT 'TRUNG_BINH',
    "trangThai" "TrangThaiCongViec" NOT NULL DEFAULT 'CHUA_BAT_DAU',
    "phanTramHoanThanh" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cong_viec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hang_muc" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "congViecId" TEXT NOT NULL,
    "hangMucChaId" TEXT,
    "ghiChu" TEXT,
    "hanHoanThanh" TIMESTAMP(3),
    "thuTu" INTEGER NOT NULL DEFAULT 0,
    "trongSo" INTEGER NOT NULL DEFAULT 1,
    "loaiTienDo" "LoaiTienDo" NOT NULL DEFAULT 'CHECKBOX',
    "phanTramHoanThanh" INTEGER NOT NULL DEFAULT 0,
    "daHoanThanh" BOOLEAN NOT NULL DEFAULT false,
    "hoanThanhLuc" TIMESTAMP(3),
    "trangThai" "TrangThaiHangMuc" NOT NULL DEFAULT 'CHUA_BAT_DAU',
    "nguoiPhuTrachId" TEXT,
    "hoanThanhBoiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hang_muc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tep_dinh_kem" (
    "id" TEXT NOT NULL,
    "hangMucId" TEXT NOT NULL,
    "tenGoc" TEXT NOT NULL,
    "tenLuu" TEXT NOT NULL,
    "duongDan" TEXT NOT NULL,
    "kichThuoc" INTEGER NOT NULL,
    "loaiMime" TEXT NOT NULL,
    "taiLenLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tep_dinh_kem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nhat_ky_email" (
    "id" TEXT NOT NULL,
    "hangMucId" TEXT,
    "huong" "HuongEmail" NOT NULL,
    "diaChiEmail" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "noiDung" TEXT NOT NULL,
    "messageId" TEXT,
    "threadId" TEXT,
    "trangThai" "TrangThaiEmail" NOT NULL DEFAULT 'CHO_GUI',
    "loiChiTiet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nhat_ky_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "de_xuat_hoan_thanh" (
    "id" TEXT NOT NULL,
    "hangMucId" TEXT NOT NULL,
    "nguonGoc" "NguonDeXuat" NOT NULL,
    "nhatKyEmailId" TEXT,
    "nguoiDeXuatEmail" TEXT NOT NULL,
    "trichDan" TEXT,
    "doTinCay" INTEGER NOT NULL DEFAULT 0,
    "trangThai" "TrangThaiDeXuat" NOT NULL DEFAULT 'CHO_DUYET',
    "duyetLuc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "de_xuat_hoan_thanh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cau_hinh" (
    "khoa" TEXT NOT NULL,
    "giaTri" TEXT NOT NULL,
    "capNhatLuc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cau_hinh_pkey" PRIMARY KEY ("khoa")
);

-- CreateIndex
CREATE UNIQUE INDEX "nhan_su_email_key" ON "nhan_su"("email");

-- CreateIndex
CREATE INDEX "nhan_su_dangHoatDong_idx" ON "nhan_su"("dangHoatDong");

-- CreateIndex
CREATE UNIQUE INDEX "cong_viec_ma_key" ON "cong_viec"("ma");

-- CreateIndex
CREATE INDEX "cong_viec_trangThai_idx" ON "cong_viec"("trangThai");

-- CreateIndex
CREATE INDEX "cong_viec_mucDoUuTien_idx" ON "cong_viec"("mucDoUuTien");

-- CreateIndex
CREATE UNIQUE INDEX "hang_muc_ma_key" ON "hang_muc"("ma");

-- CreateIndex
CREATE INDEX "hang_muc_congViecId_idx" ON "hang_muc"("congViecId");

-- CreateIndex
CREATE INDEX "hang_muc_hangMucChaId_idx" ON "hang_muc"("hangMucChaId");

-- CreateIndex
CREATE INDEX "hang_muc_nguoiPhuTrachId_idx" ON "hang_muc"("nguoiPhuTrachId");

-- CreateIndex
CREATE INDEX "hang_muc_hanHoanThanh_idx" ON "hang_muc"("hanHoanThanh");

-- CreateIndex
CREATE INDEX "hang_muc_congViecId_hangMucChaId_thuTu_idx" ON "hang_muc"("congViecId", "hangMucChaId", "thuTu");

-- CreateIndex
CREATE INDEX "tep_dinh_kem_hangMucId_idx" ON "tep_dinh_kem"("hangMucId");

-- CreateIndex
CREATE UNIQUE INDEX "nhat_ky_email_messageId_key" ON "nhat_ky_email"("messageId");

-- CreateIndex
CREATE INDEX "nhat_ky_email_hangMucId_idx" ON "nhat_ky_email"("hangMucId");

-- CreateIndex
CREATE INDEX "nhat_ky_email_diaChiEmail_idx" ON "nhat_ky_email"("diaChiEmail");

-- CreateIndex
CREATE INDEX "de_xuat_hoan_thanh_hangMucId_idx" ON "de_xuat_hoan_thanh"("hangMucId");

-- CreateIndex
CREATE INDEX "de_xuat_hoan_thanh_trangThai_idx" ON "de_xuat_hoan_thanh"("trangThai");

-- AddForeignKey
ALTER TABLE "hang_muc" ADD CONSTRAINT "hang_muc_congViecId_fkey" FOREIGN KEY ("congViecId") REFERENCES "cong_viec"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hang_muc" ADD CONSTRAINT "hang_muc_hangMucChaId_fkey" FOREIGN KEY ("hangMucChaId") REFERENCES "hang_muc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hang_muc" ADD CONSTRAINT "hang_muc_nguoiPhuTrachId_fkey" FOREIGN KEY ("nguoiPhuTrachId") REFERENCES "nhan_su"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hang_muc" ADD CONSTRAINT "hang_muc_hoanThanhBoiId_fkey" FOREIGN KEY ("hoanThanhBoiId") REFERENCES "nhan_su"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tep_dinh_kem" ADD CONSTRAINT "tep_dinh_kem_hangMucId_fkey" FOREIGN KEY ("hangMucId") REFERENCES "hang_muc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_email" ADD CONSTRAINT "nhat_ky_email_hangMucId_fkey" FOREIGN KEY ("hangMucId") REFERENCES "hang_muc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "de_xuat_hoan_thanh" ADD CONSTRAINT "de_xuat_hoan_thanh_hangMucId_fkey" FOREIGN KEY ("hangMucId") REFERENCES "hang_muc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "de_xuat_hoan_thanh" ADD CONSTRAINT "de_xuat_hoan_thanh_nhatKyEmailId_fkey" FOREIGN KEY ("nhatKyEmailId") REFERENCES "nhat_ky_email"("id") ON DELETE SET NULL ON UPDATE CASCADE;
