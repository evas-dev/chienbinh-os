-- ==========================================================================
-- 0024: SUP-04 / SUP-05 / SUP-09 / BON-01 — siết RLS SELECT đang quá rộng
--
-- Phát hiện: policy "read support_requests" hiện dùng
-- `auth.role() = 'authenticated'` — nghĩa là BẤT KỲ tài khoản đăng nhập nào
-- cũng SELECT được TOÀN BỘ bảng support_requests (nội dung xin nghỉ, đề xuất,
-- xin hỗ trợ của người khác), vi phạm trực tiếp:
--   - SUP-04: "chỉ xem được yêu cầu do mình gửi hoặc gửi trực tiếp tới mình"
--   - SUP-05: "Tư Lệnh chỉ xem yêu cầu trong phạm vi quản lý hoặc gửi trực
--     tiếp tới mình" — người dùng thường không được truy cập trực tiếp
--   - SUP-09 (P0): "người không liên quan truy cập, hệ thống không trả về
--     dữ liệu" — đây là rò rỉ dữ liệu riêng tư thật, không phải giả thuyết.
--
-- Tương tự, policy "read only" trên app_config cho phép mọi người đọc
-- bonus_pool — vi phạm BON-01: "Quỹ thưởng là dữ liệu quản trị giới hạn cho
-- Tổng Tư Lệnh" + AC2 "từ chối tại server/database". Trang /bonus đã chặn
-- ở page.tsx (requireRole) nhưng dữ liệu vẫn lộ nếu gọi thẳng client query —
-- siết ở RLS để đúng yêu cầu "server/database", không chỉ ẩn UI.
-- ==========================================================================

drop policy if exists "read support_requests" on support_requests;
create policy "read own or targeted or ceo support_requests" on support_requests
  for select using (
    requester_id = auth.uid()
    or target_id = auth.uid()
    or current_role_type() = 'tong_tu_lenh'
  );

drop policy if exists "read only" on app_config;
create policy "ceo read app_config" on app_config
  for select using (current_role_type() = 'tong_tu_lenh');
