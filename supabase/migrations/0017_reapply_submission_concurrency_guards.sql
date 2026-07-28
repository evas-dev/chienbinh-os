-- ==========================================================================
-- 0017: một migration chạy song song từ phiên làm việc khác (bổ sung
-- kpi_deltas cho việc thu hồi KPI chính xác — thay đổi hợp lệ) đã CREATE OR
-- REPLACE approve_submission / revert_submission_to_rejected dựa trên bản
-- TRƯỚC 0016, vô tình xóa mất:
--   1) guard CAS nguyên tử (UPDATE ... WHERE status = trạng thái cũ + GET
--      DIAGNOSTICS) chống duyệt/thu hồi trùng (SUB-13).
--   2) fix SUB-12 (bỏ hardcode 40 EXP cho nhiệm vụ type='ngay').
-- Vá lại migration này TRÊN NỀN bản mới nhất (giữ nguyên toàn bộ logic
-- kpi_deltas hợp lệ của họ), chỉ bổ sung lại 2 điểm trên.
-- ==========================================================================

create or replace function approve_submission(p_submission_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sub submissions; v_mission missions; v_me profiles; v_submitter profiles;
  v_exp_delta int; v_before_rank int; v_after_rank int;
  v_badge_msg text := ''; v_badge_inserted boolean := false;
  v_item objective_items%rowtype;
  v_raw numeric; v_applied numeric;
  v_kpi_deltas jsonb := '{}'::jsonb;
  v_updated int;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  select * into v_sub from submissions where id = p_submission_id;
  if v_sub.id is null then raise exception 'Không tìm thấy kết quả nộp'; end if;
  if v_sub.status != 'cho_duyet' then raise exception 'Kết quả này đã được xử lý'; end if;
  if v_sub.assigner_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người giao nhiệm vụ hoặc CEO mới được duyệt';
  end if;
  if v_sub.submitter_id = v_me.id then raise exception 'Không thể tự duyệt kết quả của chính mình'; end if;

  select * into v_mission from missions where id = v_sub.mission_ref;
  select * into v_submitter from profiles where id = v_sub.submitter_id;

  -- SUB-12: EXP luôn lấy từ cấu hình nhiệm vụ (mission.exp), không hardcode
  -- riêng cho type='ngay' — dữ liệu demo có nhiệm vụ ngày exp 50..180.
  v_exp_delta := coalesce(v_mission.exp, 40);
  v_before_rank := v_submitter.highest_rank_ord;

  -- SUB-13: CAS nguyên tử — chỉ request thấy còn 'cho_duyet' lúc UPDATE mới
  -- thắng; request đến sau khi đã có người xử lý sẽ nhận lỗi rõ ràng thay vì
  -- âm thầm cộng EXP lần hai.
  update submissions set status = 'da_duyet', reviewer_id = v_me.id, reviewed_at = now(), exp_granted = v_exp_delta
  where id = p_submission_id and status = 'cho_duyet';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Kết quả này đã được xử lý';
  end if;

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

  -- KPI: chủ sở hữu chỉ tiêu là người GIAO nhiệm vụ (assigner), không phải
  -- người nộp kết quả — giữ nguyên logic từ bản song song, chỉ chuyển vào
  -- sau guard CAS ở trên.
  for v_item in
    select oi.* from objective_items oi
    join objectives o on oi.objective_id = o.id
    where o.owner_id = v_sub.assigner_id
      and oi.metric_key is not null
      and oi.metric_key in ('lead', 'view', 'video', 'bai_viet', 'bai_web')
      and (v_sub.content ? oi.metric_key)
  loop
    v_raw := coalesce((v_sub.content->>v_item.metric_key)::numeric, 0);
    v_applied := least(v_item.target, v_item.current + v_raw) - v_item.current;
    if v_applied != 0 then
      update objective_items set current = v_item.current + v_applied where id = v_item.id;
      v_kpi_deltas := v_kpi_deltas || jsonb_build_object(v_item.id::text, v_applied);
    end if;
  end loop;
  if v_kpi_deltas != '{}'::jsonb then
    update submissions set kpi_deltas = v_kpi_deltas where id = p_submission_id;
  end if;

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

create or replace function revert_submission_to_rejected(p_submission_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_sub submissions; v_me profiles; v_submitter profiles;
  v_item_id uuid; v_delta numeric; v_updated int;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  select * into v_sub from submissions where id = p_submission_id;
  if v_sub.id is null then raise exception 'Không tìm thấy kết quả nộp'; end if;
  if v_sub.status != 'da_duyet' then raise exception 'Chỉ thu hồi được kết quả đã duyệt'; end if;
  if v_sub.assigner_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người giao nhiệm vụ hoặc CEO mới được thu hồi';
  end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Phải nhập lý do thu hồi'; end if;

  select * into v_submitter from profiles where id = v_sub.submitter_id;

  -- SUB-13/SUB-14: CAS nguyên tử — chặn thu hồi trùng hoặc đua với một
  -- duyệt/thu hồi khác đang xử lý cùng bản nộp.
  update submissions set status = 'tu_choi', reject_reason = p_reason, reviewed_at = now(), reviewer_id = v_me.id, reverted_at = now()
  where id = p_submission_id and status = 'da_duyet';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Kết quả không còn ở trạng thái đã duyệt (có thể đã bị thu hồi bởi yêu cầu khác)';
  end if;
  update missions set status = 'doing' where id = v_sub.mission_ref and status = 'done';

  insert into exp_log (phone, warrior_name, delta, season_delta, reason, ref_table, ref_id, warrior_id, created_by)
  values (v_submitter.phone, v_submitter.name, -coalesce(v_sub.exp_granted, 0), -round(coalesce(v_sub.exp_granted, 0) * 0.6),
          'Thu hồi duyệt: ' || v_sub.mission_title || ' — ' || p_reason, 'submissions', p_submission_id, v_submitter.id, v_me.id);

  -- Đảo đúng phần KPI đã cộng lúc duyệt (giữ nguyên logic kpi_deltas từ bản song song).
  if v_sub.kpi_deltas is not null then
    for v_item_id, v_delta in
      select key::uuid, value::numeric from jsonb_each_text(v_sub.kpi_deltas)
    loop
      update objective_items set current = greatest(0, current - v_delta) where id = v_item_id;
    end loop;
  end if;

  insert into feed (icon, text, actor_id) values ('🔄', 'Kết quả «' || v_sub.mission_title || '» bị thu hồi: ' || p_reason, v_me.id);
  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('submission_revert_reject', v_me.phone, v_me.name, v_me.id, jsonb_build_object('sub_id', p_submission_id, 'reason', p_reason, 'submitter', v_sub.submitter_phone));
end;
$$;
