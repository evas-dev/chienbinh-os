/**
 * Tài khoản demo dùng cho test — mật khẩu đã reset thống nhất về "123456"
 * trực tiếp trong Supabase (xem lịch sử phiên làm việc), KHÔNG hard-code ở đây
 * ngoài giá trị demo công khai này.
 */
export const PASSWORD = "123456";

export const ACCOUNTS = {
  ceo: { phone: "0901000001", name: "Anh Tuấn", role: "tong_tu_lenh" as const },
  tuLenhSale: { phone: "0901000002", name: "Minh Đức", role: "tu_lenh" as const, dept: "Sale", front: "tien_tuyen" },
  tuLenhMarketing: { phone: "0901000003", name: "Thu Hà", role: "tu_lenh" as const, dept: "Marketing", front: "tien_tuyen" },
  tuLenhDev: { phone: "0901000004", name: "Quốc Bảo", role: "tu_lenh" as const, dept: "Dev", front: "hau_phuong" },
  chienSyLanChi: { phone: "0901000005", name: "Lan Chi", role: "chien_sy" as const, dept: "Sale", front: "tien_tuyen" },
  chienSyHoangLong: { phone: "0901000006", name: "Hoàng Long", role: "chien_sy" as const, dept: "Sale", front: "tien_tuyen" },
  chienSyMyLinh: { phone: "0901000007", name: "Mỹ Linh", role: "chien_sy" as const, dept: "Marketing", front: "tien_tuyen" },
  chienSyTienDung: { phone: "0901000008", name: "Tiến Dũng", role: "chien_sy" as const, dept: "Marketing", front: "tien_tuyen" },
  tuLenhCSKH: { phone: "0901000009", name: "Ngọc Anh", role: "tu_lenh" as const, dept: "CSKH", front: "hau_phuong" },
  chienSyVanKhoa: { phone: "0901000010", name: "Văn Khoa", role: "chien_sy" as const, dept: "Dev", front: "hau_phuong" },
  chienSyThanhVan: { phone: "0901000011", name: "Thanh Vân", role: "chien_sy" as const, dept: "CSKH", front: "hau_phuong" },
  tuLenhKeToan: { phone: "0901000012", name: "Đình Phúc", role: "tu_lenh" as const, dept: "Kế toán", front: "hau_phuong" },
} as const;
