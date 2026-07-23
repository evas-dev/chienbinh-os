/**
 * Điểm xuất chung của gói @ceo/shared.
 *
 * Gói này chứa những thứ CẢ backend lẫn frontend đều dùng:
 *  - Schema Zod (validate một lần, dùng hai đầu → không bao giờ lệch luật)
 *  - Hằng số và nhãn tiếng Việt cho các enum
 *  - Hàm tính ngày tháng theo múi giờ Việt Nam
 *
 * Giai đoạn 0 mới dựng khung; nội dung thật sẽ thêm ở giai đoạn 1.
 */

/** Phiên bản gói dùng chung — tiện cho việc kiểm tra khớp phiên bản khi debug. */
export const PHIEN_BAN_SHARED = '0.1.0';

export {};
