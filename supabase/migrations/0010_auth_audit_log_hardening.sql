-- ==========================================================================
-- 0010: AUTH-10 — theo dõi sự kiện bảo mật tài khoản.
--
-- Phát hiện qua gap-analysis Epic 01:
--  1) system_log hiện có policy "auth_read_syslog" cho phép MỌI người dùng
--     đã đăng nhập (kể cả Chiến Sỹ thường) đọc toàn bộ audit log qua REST
--     trực tiếp (vd. supabase.from('system_log').select('*')) — vi phạm
--     AUTH-10.2 ("người dùng thường cố xem nhật ký bảo mật phải bị từ chối
--     theo quyền"). Không có UI nào hiện đọc bảng này nên siết lại an toàn.
--  2) Không có sự kiện đăng nhập/đăng xuất nào được ghi vào system_log —
--     chỉ có sự kiện nghiệp vụ (mission_submit, penalty...). Thêm RPC
--     log_auth_event() theo đúng pattern security-definer đã dùng cho mọi
--     RPC khác trong hệ thống, để app tầng server (login/logout action) ghi
--     nhận sự kiện cho chính người gọi — không cho ghi thay người khác.
-- ==========================================================================

drop policy if exists "auth_read_syslog" on system_log;
create policy "ceo_read_syslog" on system_log for select
  using (current_role_type() = 'tong_tu_lenh'::role_type);

create or replace function log_auth_event(p_event_type text, p_payload jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles;
begin
  if auth.uid() is null then raise exception 'Phải đăng nhập'; end if;
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Không tìm thấy tài khoản'; end if;
  if coalesce(trim(p_event_type), '') = '' then raise exception 'Thiếu loại sự kiện'; end if;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values (p_event_type, v_me.phone, v_me.name, v_me.id, coalesce(p_payload, '{}'::jsonb));
end;
$$;

revoke execute on function log_auth_event(text, jsonb) from public;
revoke execute on function log_auth_event(text, jsonb) from anon;
grant execute on function log_auth_event(text, jsonb) to authenticated;
