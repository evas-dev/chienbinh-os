-- ==========================================================================
-- 0006: current_role_type() được định nghĩa từ supabase/schema.sql gốc
-- (không phải do migration 0001-0005 tạo), chưa từng bị REVOKE khỏi PUBLIC —
-- aclexplode() xác nhận PUBLIC vẫn còn EXECUTE dù đã revoke riêng khỏi anon.
-- ==========================================================================
revoke execute on function current_role_type() from public;
grant execute on function current_role_type() to authenticated;
