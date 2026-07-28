-- ==========================================================================
-- 0005: REVOKE FROM PUBLIC không đủ — Supabase cấp EXECUTE cho `anon` qua
-- ALTER DEFAULT PRIVILEGES trực tiếp (không qua PUBLIC), nên phải REVOKE
-- tường minh khỏi role `anon` (đã xác nhận bằng has_function_privilege()).
-- ==========================================================================

revoke execute on function accept_mission(uuid) from anon;
revoke execute on function submit_mission_result(uuid, jsonb) from anon;
revoke execute on function approve_submission(uuid) from anon;
revoke execute on function reject_submission(uuid, text) from anon;
revoke execute on function revert_submission_to_rejected(uuid, text) from anon;
revoke execute on function apply_penalty(uuid, text, text) from anon;
revoke execute on function propose_commendation(uuid, text, text) from anon;
revoke execute on function approve_commendation(uuid) from anon;
revoke execute on function reject_commendation(uuid) from anon;
revoke execute on function create_squad(text, text, uuid, uuid, front_type, text) from anon;
revoke execute on function assign_squad_member(text, uuid, text) from anon;
revoke execute on function create_mission(text, mission_type, uuid, uuid, numeric, text, int, text, text, boolean, text) from anon;
revoke execute on function create_support_request(support_type, uuid, text) from anon;
revoke execute on function respond_support_request(uuid, boolean) from anon;
revoke execute on function cancel_support_request(uuid) from anon;
revoke execute on function admin_create_warrior(uuid, text, text, text, front_type, role_type, text) from anon;
revoke execute on function admin_set_active(uuid, boolean) from anon;
revoke execute on function current_profile() from anon;
revoke execute on function current_role_type() from anon;

-- hàm trigger nội bộ: không role client nào (anon/authenticated) cần gọi trực tiếp
revoke execute on function apply_exp_log_to_profile() from anon;
revoke execute on function check_squad_member_limits() from anon;
