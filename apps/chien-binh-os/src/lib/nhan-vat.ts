/**
 * Gán nhân vật đại diện cho từng nhân sự.
 *
 * Tranh nằm ở `public/avatars/<slug>.png`, tải từ bộ UI kit trên Figma
 * Community (nhân vật Brawl Stars của Supercell). Đây là hình ảnh có bản
 * quyền — nếu sau này cần thay bằng bộ khác, chỉ phải đổi danh sách dưới đây,
 * mọi chỗ hiển thị đều đi qua `nhanVatCua()`.
 */

const NHAN_VAT = [
  "8-bit",
  "barley",
  "bea",
  "bibi",
  "bo",
  "brock",
  "carl",
  "clot",
  "colette",
  "dynamike",
  "edgar",
  "el-primo",
  "emz",
  "frank",
  "jacky",
  "jessie",
  "moe",
  "mr-p",
  "nani",
  "nita",
  "pam",
  "penny",
  "piper",
  "rico",
  "rosa",
  "shelly",
  "spike",
  "stu",
  "tick",
] as const;

/** Nền sau nhân vật — mỗi người một màu rực, lấy từ bảng màu sẵn có của app. */
const MAU_NEN = [
  "var(--cb-crimson)",
  "var(--cb-blue)",
  "var(--cb-green)",
  "var(--cb-purple)",
  "var(--cb-q-violet)",
  "var(--cb-q-cyan)",
  "var(--cb-q-pink)",
  "var(--cb-gold)",
] as const;

/**
 * Băm chuỗi thành số nguyên (FNV-1a 32-bit).
 *
 * Phải là hàm băm THẬT, không phải cộng mã ký tự: id nhân sự là UUID, hai
 * người khác nhau thường chỉ lệch vài ký tự nên phép cộng đơn giản sẽ dồn cục
 * và nhiều người bị trùng nhân vật.
 */
function bam(chuoi: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < chuoi.length; i++) {
    h ^= chuoi.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Nhân vật + màu nền của một người. Luôn cho ra cùng kết quả với cùng `id`,
 * nên không cần lưu vào cơ sở dữ liệu và không bao giờ đổi giữa các lần tải.
 *
 * Màu nền băm bằng một khoá khác để nó không dính chặt vào nhân vật — nếu
 * dùng chung số băm thì mọi người cùng nhân vật sẽ luôn cùng màu.
 */
export function nhanVatCua(id: string) {
  return {
    anh: NHAN_VAT[bam(id) % NHAN_VAT.length],
    nen: MAU_NEN[bam(`nen:${id}`) % MAU_NEN.length],
  };
}

export const TAT_CA_NHAN_VAT = NHAN_VAT;
