-- ==========================================================================
-- 0003: RPC security definer — mọi thao tác đổi EXP/badge/trạng thái đi qua
-- đây thay vì client UPDATE trực tiếp (đã bị RLS/column-revoke chặn ở 0001-0002)
-- ==========================================================================

create or replace function current_profile()
returns profiles language sql stable security definer set search_path = public as $$
  select * from profiles where id = auth.uid();
$$;

-- ---- nhiệm vụ: nhận / nộp kết quả ----
create or replace function accept_mission(p_mission_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_mission missions;
begin
  select * into v_mission from missions where id = p_mission_id;
  if v_mission is null then raise exception 'Không tìm thấy nhiệm vụ'; end if;
  if v_mission.assignee_id != auth.uid() then raise exception 'Chỉ người được giao nhiệm vụ mới được nhận'; end if;
  if v_mission.status != 'todo' then raise exception 'Nhiệm vụ không ở trạng thái chưa nhận'; end if;
  update missions set status = 'doing' where id = p_mission_id;
end;
$$;

create or replace function submit_mission_result(p_mission_id uuid, p_content jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me profiles;
  v_mission missions;
  v_round int;
  v_sub_id uuid;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null or not v_me.active then raise exception 'Không tìm thấy tài khoản hoặc tài khoản đã bị ngưng'; end if;

  select * into v_mission from missions where id = p_mission_id;
  if v_mission is null then raise exception 'Không tìm thấy nhiệm vụ'; end if;
  if v_mission.assignee_id != v_me.id then raise exception 'Chỉ người được giao nhiệm vụ mới được nộp kết quả'; end if;
  if v_mission.status != 'doing' then raise exception 'Nhiệm vụ không ở trạng thái đang làm, không thể nộp'; end if;

  select count(*) + 1 into v_round from submissions where mission_ref = p_mission_id and submitter_id = v_me.id;

  insert into submissions (mission_ref, mission_title, submitter_id, submitter_phone, assigner_id, assigner_phone, round, content, status)
  values (p_mission_id, v_mission.title, v_me.id, v_me.phone, v_mission.assigner_id,
          (select phone from profiles where id = v_mission.assigner_id), v_round, p_content, 'cho_duyet')
  returning id into v_sub_id;

  update missions set status = 'review' where id = p_mission_id;

  insert into feed (icon, text, actor_id)
  values ('🧾', v_me.name || ' nộp kết quả «' || v_mission.title || '» (Lần ' || v_round || ') — chờ duyệt', v_me.id);
  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('mission_submit', v_me.phone, v_me.name, v_me.id, jsonb_build_object('mission_ref', p_mission_id, 'round', v_round, 'content', p_content));

  return v_sub_id;
end;
$$;

-- ---- nhiệm vụ: duyệt / từ chối / thu hồi duyệt ----
create or replace function approve_submission(p_submission_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sub submissions;
  v_mission missions;
  v_me profiles;
  v_submitter profiles;
  v_exp_delta int;
  v_before_rank int;
  v_after_rank int;
  v_badge_msg text := '';
  v_badge_inserted boolean := false;
begin
  select * into v_me from profiles where id = auth.uid();
  select * into v_sub from submissions where id = p_submission_id;
  if v_sub is null then raise exception 'Không tìm thấy kết quả nộp'; end if;
  if v_sub.status != 'cho_duyet' then raise exception 'Kết quả này đã được xử lý'; end if;
  if v_sub.assigner_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người giao nhiệm vụ hoặc CEO mới được duyệt';
  end if;
  if v_sub.submitter_id = v_me.id then raise exception 'Không thể tự duyệt kết quả của chính mình'; end if;

  select * into v_mission from missions where id = v_sub.mission_ref;
  select * into v_submitter from profiles where id = v_sub.submitter_id;

  v_exp_delta := case when v_mission.type = 'ngay' then 40 else coalesce(v_mission.exp, 40) end;
  v_before_rank := v_submitter.highest_rank_ord;

  update submissions set status = 'da_duyet', reviewer_id = v_me.id, reviewed_at = now(), exp_granted = v_exp_delta
  where id = p_submission_id;

  if v_mission is not null then
    update missions set status = 'done', current = target where id = v_sub.mission_ref;
    if v_mission.badge_reward is not null then
      insert into warrior_badges (warrior_id, badge_code) values (v_submitter.id, v_mission.badge_reward) on conflict do nothing;
      v_badge_inserted := found;
      if v_badge_inserted then
        v_badge_msg := ' + huy hiệu ' || v_mission.badge_reward;
      end if;
    end if;
  end if;

  insert into exp_log (phone, warrior_name, delta, season_delta, reason, ref_table, ref_id, warrior_id, created_by)
  values (v_submitter.phone, v_submitter.name, v_exp_delta, round(v_exp_delta * 0.6),
          'Duyệt: ' || v_sub.mission_title, 'submissions', p_submission_id, v_submitter.id, v_me.id);

  -- KPI mục tiêu tháng: dùng metric_key tường minh, thay so khớp chuỗi con cũ
  update objective_items oi set current = least(oi.target, oi.current +
    case oi.metric_key
      when 'lead' then coalesce((v_sub.content->>'lead')::numeric, 0)
      when 'view' then coalesce((v_sub.content->>'view')::numeric, 0)
      when 'video' then coalesce((v_sub.content->>'video')::numeric, 0)
      when 'bai_viet' then coalesce((v_sub.content->>'bai_viet')::numeric, 0)
      else 0
    end)
  from objectives o
  where oi.objective_id = o.id and o.owner_id = v_submitter.id
    and oi.metric_key is not null and (v_sub.content ? oi.metric_key);

  select highest_rank_ord into v_after_rank from profiles where id = v_submitter.id;

  insert into feed (icon, text, actor_id)
  values ('✅', v_submitter.name || ' được duyệt «' || v_sub.mission_title || '» (+' || v_exp_delta || ' EXP' || v_badge_msg || ')', v_me.id);
  if v_after_rank > v_before_rank then
    insert into feed (icon, text, actor_id) values ('🎖', v_submitter.name || ' thăng quân hàm mới!', v_me.id);
  end if;
  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('submission_approve', v_me.phone, v_me.name, v_me.id, jsonb_build_object('sub_id', p_submission_id, 'submitter', v_submitter.phone, 'exp', v_exp_delta));

  return jsonb_build_object('exp_delta', v_exp_delta, 'rank_up', v_after_rank > v_before_rank);
end;
$$;

create or replace function reject_submission(p_submission_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_sub submissions; v_me profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  select * into v_sub from submissions where id = p_submission_id;
  if v_sub is null then raise exception 'Không tìm thấy kết quả nộp'; end if;
  if v_sub.status != 'cho_duyet' then raise exception 'Kết quả này đã được xử lý'; end if;
  if v_sub.assigner_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người giao nhiệm vụ hoặc CEO mới được từ chối';
  end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Phải nhập lý do từ chối'; end if;

  update submissions set status = 'tu_choi', reject_reason = p_reason, reviewed_at = now(), reviewer_id = v_me.id
  where id = p_submission_id;
  update missions set status = 'doing' where id = v_sub.mission_ref;

  insert into feed (icon, text, actor_id) values ('❌', 'Kết quả «' || v_sub.mission_title || '» bị từ chối: ' || p_reason, v_me.id);
  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('submission_reject', v_me.phone, v_me.name, v_me.id, jsonb_build_object('sub_id', p_submission_id, 'reason', p_reason, 'submitter', v_sub.submitter_phone));
end;
$$;

create or replace function revert_submission_to_rejected(p_submission_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_sub submissions; v_me profiles; v_submitter profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  select * into v_sub from submissions where id = p_submission_id;
  if v_sub is null then raise exception 'Không tìm thấy kết quả nộp'; end if;
  if v_sub.status != 'da_duyet' then raise exception 'Chỉ thu hồi được kết quả đã duyệt'; end if;
  if v_sub.assigner_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người giao nhiệm vụ hoặc CEO mới được thu hồi';
  end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Phải nhập lý do thu hồi'; end if;

  select * into v_submitter from profiles where id = v_sub.submitter_id;

  update submissions set status = 'tu_choi', reject_reason = p_reason, reviewed_at = now(), reviewer_id = v_me.id, reverted_at = now()
  where id = p_submission_id;
  update missions set status = 'doing' where id = v_sub.mission_ref and status = 'done';

  insert into exp_log (phone, warrior_name, delta, season_delta, reason, ref_table, ref_id, warrior_id, created_by)
  values (v_submitter.phone, v_submitter.name, -coalesce(v_sub.exp_granted, 0), -round(coalesce(v_sub.exp_granted, 0) * 0.6),
          'Thu hồi duyệt: ' || v_sub.mission_title || ' — ' || p_reason, 'submissions', p_submission_id, v_submitter.id, v_me.id);

  insert into feed (icon, text, actor_id) values ('🔄', 'Kết quả «' || v_sub.mission_title || '» bị thu hồi: ' || p_reason, v_me.id);
  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('submission_revert_reject', v_me.phone, v_me.name, v_me.id, jsonb_build_object('sub_id', p_submission_id, 'reason', p_reason, 'submitter', v_sub.submitter_phone));
end;
$$;

-- ---- xử phạt ----
create or replace function apply_penalty(p_warrior_id uuid, p_code text, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_target profiles; v_penalty penalties;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền xử phạt'; end if;

  select * into v_target from profiles where id = p_warrior_id;
  if v_target is null then raise exception 'Không tìm thấy chiến binh'; end if;
  if v_target.role = 'tong_tu_lenh' then raise exception 'Không thể xử phạt Tổng Tư Lệnh'; end if;

  select * into v_penalty from penalties where code = p_code;
  if v_penalty is null then raise exception 'Không tìm thấy mã hình phạt'; end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Phải nhập lý do xử phạt'; end if;

  insert into penalty_log (warrior_id, penalty_code, reason, applied_by) values (p_warrior_id, p_code, p_reason, v_me.id);

  insert into exp_log (phone, warrior_name, delta, season_delta, reason, ref_table, ref_id, warrior_id, created_by)
  values (v_target.phone, v_target.name, v_penalty.exp_delta, 0, v_penalty.name || ': ' || p_reason, 'penalty_log', p_warrior_id, v_target.id, v_me.id);

  insert into feed (icon, text, actor_id) values ('⚖️', v_target.name || ' bị xử phạt: ' || v_penalty.name, v_me.id);
end;
$$;

-- ---- đề xuất khen thưởng ----
create or replace function propose_commendation(p_staff_id uuid, p_badge_code text, p_reason text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_staff profiles; v_id uuid;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền đề xuất khen thưởng'; end if;
  select * into v_staff from profiles where id = p_staff_id;
  if v_staff is null then raise exception 'Không tìm thấy nhân sự'; end if;
  if v_me.role = 'tu_lenh' and v_staff.front != v_me.front then
    raise exception 'Chỉ được đề xuất cho nhân sự cùng mặt trận';
  end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Phải nhập lý do'; end if;

  insert into commendations (staff_id, badge_code, reason, proposed_by, status)
  values (p_staff_id, p_badge_code, p_reason, v_me.id, 'cho_duyet') returning id into v_id;
  return v_id;
end;
$$;

create or replace function approve_commendation(p_commendation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_com commendations;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được duyệt đề xuất khen thưởng'; end if;
  select * into v_com from commendations where id = p_commendation_id;
  if v_com is null then raise exception 'Không tìm thấy đề xuất'; end if;
  if v_com.status != 'cho_duyet' then raise exception 'Đề xuất này đã được xử lý'; end if;

  insert into warrior_badges (warrior_id, badge_code) values (v_com.staff_id, v_com.badge_code) on conflict do nothing;
  update commendations set status = 'da_duyet' where id = p_commendation_id;

  insert into feed (icon, text, actor_id)
  select '🏆', p.name || ' nhận huy hiệu từ đề xuất khen thưởng', v_me.id from profiles p where p.id = v_com.staff_id;
end;
$$;

create or replace function reject_commendation(p_commendation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_com commendations;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được xử lý đề xuất khen thưởng'; end if;
  select * into v_com from commendations where id = p_commendation_id;
  if v_com is null then raise exception 'Không tìm thấy đề xuất'; end if;
  if v_com.status != 'cho_duyet' then raise exception 'Đề xuất này đã được xử lý'; end if;
  update commendations set status = 'tu_choi' where id = p_commendation_id;
end;
$$;

-- ---- tiểu đội ----
create or replace function create_squad(p_id text, p_name text, p_leader_id uuid, p_deputy_id uuid, p_front front_type, p_dept text)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được tạo tiểu đội'; end if;
  insert into squads (id, name, leader_id, deputy_id, front, dept) values (p_id, p_name, p_leader_id, p_deputy_id, p_front, p_dept);
end;
$$;

create or replace function assign_squad_member(p_squad_id text, p_warrior_id uuid, p_squad_role text)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền quản lý tiểu đội'; end if;

  if p_squad_role in ('leader', 'deputy') then
    if exists (select 1 from squad_members where warrior_id = p_warrior_id)
       or exists (select 1 from squads where (leader_id = p_warrior_id or deputy_id = p_warrior_id) and id != p_squad_id) then
      raise exception 'Chiến binh đã thuộc một tiểu đội khác';
    end if;
    if p_squad_role = 'leader' then
      update squads set leader_id = p_warrior_id where id = p_squad_id;
    else
      update squads set deputy_id = p_warrior_id where id = p_squad_id;
    end if;
  elsif p_squad_role = 'member' then
    insert into squad_members (squad_id, warrior_id) values (p_squad_id, p_warrior_id);
  else
    raise exception 'squad_role không hợp lệ (leader|deputy|member)';
  end if;
end;
$$;

-- ---- nhiệm vụ (tạo mới) ----
create or replace function create_mission(
  p_title text, p_type mission_type, p_parent_id uuid, p_assignee_id uuid,
  p_target numeric, p_unit text, p_exp int, p_badge_reward text,
  p_deadline text, p_fixed boolean, p_icon text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_assignee profiles; v_id uuid;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền tạo nhiệm vụ'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception 'Phải nhập tiêu đề nhiệm vụ'; end if;

  select * into v_assignee from profiles where id = p_assignee_id;
  if v_assignee is null then raise exception 'Không tìm thấy người nhận nhiệm vụ'; end if;
  if v_me.role = 'tu_lenh' and v_assignee.front != v_me.front then
    raise exception 'Chỉ được giao nhiệm vụ trong mặt trận của mình';
  end if;

  insert into missions (title, type, parent_id, assigner_id, assignee_id, target, unit, exp, badge_reward, deadline, fixed, icon, status)
  values (p_title, p_type, p_parent_id, v_me.id, p_assignee_id, p_target, p_unit, p_exp, p_badge_reward, p_deadline, p_fixed, p_icon, 'todo')
  returning id into v_id;
  return v_id;
end;
$$;

-- ---- yêu cầu hỗ trợ ----
create or replace function create_support_request(p_type support_type, p_target_id uuid, p_content text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_count int; v_id uuid;
begin
  select * into v_me from profiles where id = auth.uid();
  if coalesce(trim(p_content), '') = '' then raise exception 'Phải nhập nội dung yêu cầu'; end if;

  select count(*) into v_count from support_requests
  where requester_id = v_me.id and created_at >= date_trunc('month', now());
  if v_count >= 4 then raise exception 'Đã đạt giới hạn 4 yêu cầu/tháng'; end if;

  insert into support_requests (type, requester_id, target_id, content, status)
  values (p_type, v_me.id, p_target_id, p_content, 'cho_duyet') returning id into v_id;
  return v_id;
end;
$$;

create or replace function respond_support_request(p_request_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_req support_requests;
begin
  select * into v_me from profiles where id = auth.uid();
  select * into v_req from support_requests where id = p_request_id;
  if v_req is null then raise exception 'Không tìm thấy yêu cầu'; end if;
  if v_req.status != 'cho_duyet' then raise exception 'Yêu cầu này đã được xử lý'; end if;
  if v_req.target_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người được nhắm tới hoặc CEO mới được phản hồi';
  end if;
  update support_requests set status = (case when p_approve then 'da_duyet' else 'tu_choi' end)::approval_status
  where id = p_request_id;
end;
$$;

create or replace function cancel_support_request(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_req support_requests;
begin
  select * into v_me from profiles where id = auth.uid();
  select * into v_req from support_requests where id = p_request_id;
  if v_req is null then raise exception 'Không tìm thấy yêu cầu'; end if;
  if v_req.requester_id != v_me.id then raise exception 'Chỉ người tạo yêu cầu mới được huỷ'; end if;
  if v_req.status != 'cho_duyet' then raise exception 'Chỉ huỷ được yêu cầu đang chờ duyệt'; end if;
  delete from support_requests where id = p_request_id;
end;
$$;

-- ---- quản trị nhân sự (CEO) ----
-- Lưu ý: auth.users phải được tạo TRƯỚC bằng service role (auth.admin.createUser)
-- ở tầng server Next.js — RPC này chỉ tạo dòng profiles khớp id đó.
create or replace function admin_create_warrior(
  p_user_id uuid, p_name text, p_phone text, p_dept text,
  p_front front_type, p_role role_type, p_squad_id text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được tạo tài khoản nhân sự'; end if;
  if exists (select 1 from profiles where phone = p_phone) then raise exception 'Số điện thoại đã tồn tại'; end if;
  insert into profiles (id, name, phone, dept, front, role, squad_id) values (p_user_id, p_name, p_phone, p_dept, p_front, p_role, p_squad_id);
end;
$$;

create or replace function admin_set_active(p_warrior_id uuid, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_target profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được khoá/mở tài khoản'; end if;
  select * into v_target from profiles where id = p_warrior_id;
  if v_target is null then raise exception 'Không tìm thấy chiến binh'; end if;
  if v_target.role = 'tong_tu_lenh' then raise exception 'Không thể khoá tài khoản CEO'; end if;
  if v_target.id = v_me.id then raise exception 'Không thể tự khoá chính mình'; end if;
  update profiles set active = p_active where id = p_warrior_id;
end;
$$;

-- ---- grant thực thi cho role authenticated ----
grant execute on function current_profile() to authenticated;
grant execute on function accept_mission(uuid) to authenticated;
grant execute on function submit_mission_result(uuid, jsonb) to authenticated;
grant execute on function approve_submission(uuid) to authenticated;
grant execute on function reject_submission(uuid, text) to authenticated;
grant execute on function revert_submission_to_rejected(uuid, text) to authenticated;
grant execute on function apply_penalty(uuid, text, text) to authenticated;
grant execute on function propose_commendation(uuid, text, text) to authenticated;
grant execute on function approve_commendation(uuid) to authenticated;
grant execute on function reject_commendation(uuid) to authenticated;
grant execute on function create_squad(text, text, uuid, uuid, front_type, text) to authenticated;
grant execute on function assign_squad_member(text, uuid, text) to authenticated;
grant execute on function create_mission(text, mission_type, uuid, uuid, numeric, text, int, text, text, boolean, text) to authenticated;
grant execute on function create_support_request(support_type, uuid, text) to authenticated;
grant execute on function respond_support_request(uuid, boolean) to authenticated;
grant execute on function cancel_support_request(uuid) to authenticated;
grant execute on function admin_create_warrior(uuid, text, text, text, front_type, role_type, text) to authenticated;
grant execute on function admin_set_active(uuid, boolean) to authenticated;
