-- ==========================================================================
-- 0009: vá bug thật — "if v_mission is not null" dùng sai ngữ nghĩa PL/pgSQL.
-- Với kiểu ROW, "X IS NOT NULL" chỉ đúng khi TẤT CẢ cột đều non-null. Vì
-- missions có cột nullable (badge_reward, parent_id, icon...), một dòng
-- mission tìm thấy hợp lệ vẫn có thể làm "IS NOT NULL" trả về false →
-- update missions set status='done' KHÔNG BAO GIỜ chạy. Sửa bằng cách
-- kiểm tra v_mission.id (cột chắc chắn NOT NULL) thay vì cả dòng.
-- ==========================================================================

create or replace function approve_submission(p_submission_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sub submissions; v_mission missions; v_me profiles; v_submitter profiles;
  v_exp_delta int; v_before_rank int; v_after_rank int;
  v_badge_msg text := ''; v_badge_inserted boolean := false;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Phải đăng nhập'; end if;
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

  if v_mission.id is not null then
    update missions set status = 'done', current = target where id = v_sub.mission_ref;
    if v_mission.badge_reward is not null then
      insert into warrior_badges (warrior_id, badge_code) values (v_submitter.id, v_mission.badge_reward) on conflict do nothing;
      v_badge_inserted := found;
      if v_badge_inserted then v_badge_msg := ' + huy hiệu ' || v_mission.badge_reward; end if;
    end if;
  end if;

  insert into exp_log (phone, warrior_name, delta, season_delta, reason, ref_table, ref_id, warrior_id, created_by)
  values (v_submitter.phone, v_submitter.name, v_exp_delta, round(v_exp_delta * 0.6),
          'Duyệt: ' || v_sub.mission_title, 'submissions', p_submission_id, v_submitter.id, v_me.id);

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
