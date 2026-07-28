-- ==========================================================================
-- 0028: SEC-11 — health check cần chạy được KHÔNG cần đăng nhập, nhưng toàn
-- bộ bảng trong app này đã khoá RLS chỉ cho authenticated (đúng chủ đích bảo
-- mật đã thiết lập trong dự án) nên anon không SELECT được gì cả để xác nhận
-- DB còn sống. Thêm 1 RPC hẹp, security definer, KHÔNG trả về dữ liệu nghiệp
-- vụ — chỉ xác nhận round-trip tới Postgres còn hoạt động — và cấp EXPLICIT
-- execute cho anon (ngoại lệ duy nhất trong toàn bộ schema, ghi rõ lý do).
-- ==========================================================================

create or replace function health_check()
returns timestamptz language sql security definer set search_path = public as $$
  select now();
$$;

revoke execute on function health_check() from public;
grant execute on function health_check() to anon, authenticated;
