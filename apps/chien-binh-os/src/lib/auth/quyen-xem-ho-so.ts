import type { Enums } from "@/types/database";

/** Vừa đủ để xét quyền — nhận cả `Profile` đầy đủ lẫn hàng rút gọn từ danh sách. */
type NguoiDung = {
  id: string;
  role: Enums<"role_type">;
  front: Enums<"front_type"> | null;
};

/**
 * Ai được xem hồ sơ ai:
 *
 * - Tổng Tư Lệnh: xem tất cả
 * - Tư Lệnh: xem Chiến Sỹ trong mặt trận của mình
 * - Ai cũng xem được hồ sơ của chính mình
 *
 * Dùng chung cho cả trang `/nhan-su/[id]` lẫn nơi vẽ link tới nó, để không có
 * cảnh danh sách hiện link mà bấm vào lại báo không có quyền.
 *
 * RLS đã tự chặn phần nhạy cảm nhất (`penalty_log` scoped theo đúng ba luật
 * trên), nhưng `profiles`/`missions`/`exp_log` thì mở cho mọi tài khoản đã đăng
 * nhập — nên trang phải tự kiểm, không dựa được vào RLS.
 */
export function xemDuocHoSo(nguoiXem: NguoiDung, nguoiDuocXem: NguoiDung): boolean {
  if (nguoiXem.id === nguoiDuocXem.id) return true;
  if (nguoiXem.role === "tong_tu_lenh") return true;
  return (
    nguoiXem.role === "tu_lenh" &&
    nguoiDuocXem.role === "chien_sy" &&
    nguoiDuocXem.front === nguoiXem.front
  );
}

/** Đường dẫn hồ sơ, hoặc `null` khi người xem không có quyền — dùng để quyết định có bọc link hay không. */
export function duongDanHoSo(nguoiXem: NguoiDung, nguoiDuocXem: NguoiDung): string | null {
  return xemDuocHoSo(nguoiXem, nguoiDuocXem) ? `/nhan-su/${nguoiDuocXem.id}` : null;
}
