/**
 * Nhật ký chiến công: suy ra "hành động" và sắc thái từ icon đã lưu trong DB.
 *
 * Mỗi RPC ghi feed luôn dùng một icon cố định cho một loại sự kiện, nên icon
 * chính là mã hành động — không cần thêm cột `action` vào bảng.
 */

export type SacThai = "tot" | "xau" | "trung_tinh";

type HanhDong = { nhan: string; sacThai: SacThai };

const HANH_DONG: Record<string, HanhDong> = {
  "🧾": { nhan: "nộp kết quả", sacThai: "trung_tinh" },
  "✅": { nhan: "được duyệt", sacThai: "tot" },
  "🎖": { nhan: "thăng quân hàm", sacThai: "tot" },
  "🏆": { nhan: "nhận huy hiệu", sacThai: "tot" },
  "🔥": { nhan: "chuỗi bất bại", sacThai: "tot" },
  "💡": { nhan: "được duyệt sáng kiến", sacThai: "tot" },
  "👑": { nhan: "dẫn đầu bảng xếp hạng", sacThai: "tot" },
  "🛡": { nhan: "thành tích tiểu đội", sacThai: "tot" },
  "🎯": { nhan: "được giao KPI", sacThai: "trung_tinh" },
  "❌": { nhan: "bị từ chối", sacThai: "xau" },
  "🔄": { nhan: "bị thu hồi kết quả", sacThai: "xau" },
  "↩️": { nhan: "bị thu hồi huy hiệu", sacThai: "xau" },
  "⚖️": { nhan: "bị xử phạt", sacThai: "xau" },
};

export function hanhDongTuIcon(icon: string | null): HanhDong {
  if (!icon) return { nhan: "hoạt động", sacThai: "trung_tinh" };
  return HANH_DONG[icon.trim()] ?? { nhan: "hoạt động", sacThai: "trung_tinh" };
}

/**
 * Bỏ tên chủ thể ở đầu chuỗi text để không hiện tên hai lần (tên đã được render
 * riêng, in đậm). Chỉ cắt khi text thực sự bắt đầu bằng tên đó — các dòng như
 * "Kết quả «X» bị từ chối: ..." không có tên ở đầu nên giữ nguyên.
 */
export function boTenODau(text: string, tenChuThe: string | null | undefined) {
  if (!tenChuThe) return text;
  if (!text.startsWith(tenChuThe + " ")) return text;
  const conLai = text.slice(tenChuThe.length + 1).trim();
  return conLai.length > 0 ? conLai : text;
}

const MUI_GIO = "Asia/Ho_Chi_Minh";

/**
 * Khoá nhóm theo ngày — BẮT BUỘC chốt múi giờ Việt Nam: server Render chạy UTC,
 * nếu để mặc định thì sự kiện lúc 18:00 UTC (= 01:00 sáng hôm sau ở VN) sẽ bị
 * gom sai ngày.
 */
export function khoaNgay(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MUI_GIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function nhanNgay(khoa: string) {
  const homNay = khoaNgay(new Date().toISOString());
  if (khoa === homNay) return "Hôm nay";

  const homQua = khoaNgay(new Date(Date.now() - 86_400_000).toISOString());
  if (khoa === homQua) return "Hôm qua";

  // khoa dạng YYYY-MM-DD, hiển thị lại theo lối Việt Nam.
  const [y, m, d] = khoa.split("-");
  return `${d}/${m}/${y}`;
}

export function thoiGianTuongDoi(iso: string) {
  const phut = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (phut < 1) return "Vừa xong";
  if (phut < 60) return `${phut} phút trước`;
  const gio = Math.floor(phut / 60);
  if (gio < 24) return `${gio} giờ trước`;
  return `${Math.floor(gio / 24)} ngày trước`;
}

/** Giờ:phút theo múi giờ VN — dùng trong nhóm ngày cũ, nơi "N ngày trước" vô nghĩa. */
export function gioPhut(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: MUI_GIO,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Câu giải thích phạm vi nhật ký mà vai trò hiện tại được xem. */
export function moTaPhamVi(
  role: "tong_tu_lenh" | "tu_lenh" | "chien_sy",
  // dept có thể trống với tài khoản chưa cập nhật phòng ban — khi đó nói chung
  // "cùng phòng ban" thay vì in ra "phòng null".
  dept: string | null | undefined,
) {
  if (role === "tong_tu_lenh") return "Bạn đang xem hoạt động của toàn bộ nhân sự.";
  if (role === "tu_lenh") {
    return dept
      ? `Bạn đang xem hoạt động của mình và nhân sự phòng ${dept}.`
      : "Bạn đang xem hoạt động của mình và nhân sự cùng phòng ban.";
  }
  return "Bạn đang xem hoạt động liên quan tới chính bạn.";
}
