-- ==========================================================================
-- 0016: MIS-13 / SUB-04 / SUB-13 — accept_mission, submit_mission_result,
-- approve_submission, reject_submission, revert_submission_to_rejected đều
-- kiểm tra trạng thái bằng SELECT rồi UPDATE KHÔNG lặp lại điều kiện đó
-- trong WHERE. Đây là race window kinh điển (check-then-act không nguyên
-- tử): hai request đồng thời cùng đọc trạng thái cũ, cả hai đều qua được
-- điều kiện, cả hai đều UPDATE thành công (statement sau chỉ chờ lock rồi
-- ghi đè im lặng) — với approve_submission điều này CỘNG EXP HAI LẦN cho
-- cùng một submission (SUB-13 vi phạm nghiêm trọng nhất). Vá bằng UPDATE
-- ... WHERE <cột id> AND <điều kiện trạng thái cũ>, kiểm tra ROW_COUNT: nếu
-- 0 dòng bị ảnh hưởng nghĩa là request khác đã xử lý trước — từ chối rõ
-- ràng thay vì âm thầm chạy tiếp phần thân bài (exp_log, feed, badge...).
--
-- Kèm SUB-12 — approve_submission hardcode v_exp_delta = 40 cho MỌI nhiệm vụ
-- type='ngay', bỏ qua mission.exp thật sự cấu hình (dữ liệu demo hiện có
-- nhiệm vụ ngày với exp 50/60/80/100/110/120/150/180 — tất cả đều chỉ được
-- cộng 40 khi duyệt). Vi phạm quy tắc "EXP nhiệm vụ phải lấy từ cấu hình
-- nhiệm vụ, không dùng hằng số ngầm" (business-rules.md). Sửa: luôn dùng
-- coalesce(mission.exp, 40) không phân biệt loại nhiệm vụ.
--
-- Kèm defense-in-depth cho SUB-04: unique index (mission_ref, round) — dù
-- guard nguyên tử ở submit_mission_result đã chặn được race, index này đảm
-- bảo không con đường nào khác (kể cả sửa RPC sau này) tạo được 2 bản nộp
-- cùng lượt cho cùng nhiệm vụ.
-- ==========================================================================

create unique index if not exists submissions_mission_ref_round_uniq
  on submissions (mission_ref, round);

-- ---- MIS-13: nhận nhiệm vụ nguyên tử ----
create or replace function accept_mission(p_mission_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_mission missions; v_updated int;
begin
  if auth.uid() is null then raise exception 'Phải đăng nhập'; end if;
  select * into v_mission from missions where id = p_mission_id;
  if v_mission.id is null then raise exception 'Không tìm thấy nhiệm vụ'; end if;
  if v_mission.assignee_id != auth.uid() then raise exception 'Chỉ người được giao nhiệm vụ mới được nhận'; end if;

  update missions set status = 'doing' where id = p_mission_id and status = 'todo';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Nhiệm vụ không ở trạng thái chưa nhận (có thể đã được nhận bởi yêu cầu khác)';
  end if;
end;
$$;

-- ---- SUB-04: nộp kết quả nguyên tử — chuyển mission sang review trước,
-- chỉ request thắng cuộc mới được tạo submission (chặn double-submit) ----
create or replace function submit_mission_result(p_mission_id uuid, p_content jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me profiles;
  v_mission missions;
  v_round int;
  v_sub_id uuid;
  v_updated int;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if not v_me.active then raise exception 'Tài khoản đã bị ngưng'; end if;

  select * into v_mission from missions where id = p_mission_id;
  if v_mission.id is null then raise exception 'Không tìm thấy nhiệm vụ'; end if;
  if v_mission.assignee_id != v_me.id then raise exception 'Chỉ người được giao nhiệm vụ mới được nộp kết quả'; end if;

  update missions set status = 'review' where id = p_mission_id and status = 'doing';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Nhiệm vụ không ở trạng thái đang làm, không thể nộp';
  end if;

  select count(*) + 1 into v_round from submissions where mission_ref = p_mission_id and submitter_id = v_me.id;

  insert into submissions (mission_ref, mission_title, submitter_id, submitter_phone, assigner_id, assigner_phone, round, content, status)
  values (p_mission_id, v_mission.title, v_me.id, v_me.phone, v_mission.assigner_id,
          (select phone from profiles where id = v_mission.assigner_id), v_round, p_content, 'cho_duyet')
  returning id into v_sub_id;

  insert into feed (icon, text, actor_id)
  values ('🧾', v_me.name || ' nộp kết quả «' || v_mission.title || '» (Lần ' || v_round || ') — chờ duyệt', v_me.id);
  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('mission_submit', v_me.phone, v_me.name, v_me.id, jsonb_build_object('mission_ref', p_mission_id, 'round', v_round, 'content', p_content));

  return v_sub_id;
end;
$$;

-- ---- SUB-13 + SUB-12: duyệt kết quả nguyên tử, EXP luôn lấy từ cấu hình ----
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

  -- SUB-12: bỏ nhánh hardcode 40 riêng cho type='ngay' — luôn lấy từ mission.exp
  v_exp_delta := coalesce(v_mission.exp, 40);
  v_before_rank := v_submitter.highest_rank_ord;

  -- SUB-13: CAS — chỉ request nào thấy còn 'cho_duyet' tại thời điểm UPDATE mới thắng
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
      if v_badge_inserted then
        v_badge_msg := ' + huy hiệu ' || v_mission.badge_reward;
      end if;
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

-- ---- SUB-07 / SUB-13: từ chối kết quả nguyên tử ----
create or replace function reject_submission(p_submission_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_sub submissions; v_me profiles; v_updated int;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  select * into v_sub from submissions where id = p_submission_id;
  if v_sub.id is null then raise exception 'Không tìm thấy kết quả nộp'; end if;
  if v_sub.status != 'cho_duyet' then raise exception 'Kết quả này đã được xử lý'; end if;
  if v_sub.assigner_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người giao nhiệm vụ hoặc CEO mới được từ chối';
  end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Phải nhập lý do từ chối'; end if;

  update submissions set status = 'tu_choi', reject_reason = p_reason, reviewed_at = now(), reviewer_id = v_me.id
  where id = p_submission_id and status = 'cho_duyet';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Kết quả này đã được xử lý';
  end if;
  update missions set status = 'doing' where id = v_sub.mission_ref;

  insert into feed (icon, text, actor_id) values ('❌', 'Kết quả «' || v_sub.mission_title || '» bị từ chối: ' || p_reason, v_me.id);
  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('submission_reject', v_me.phone, v_me.name, v_me.id, jsonb_build_object('sub_id', p_submission_id, 'reason', p_reason, 'submitter', v_sub.submitter_phone));
end;
$$;

-- ---- SUB-14 / SUB-13: thu hồi duyệt nguyên tử ----
create or replace function revert_submission_to_rejected(p_submission_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_sub submissions; v_me profiles; v_submitter profiles; v_updated int;
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

  insert into feed (icon, text, actor_id) values ('🔄', 'Kết quả «' || v_sub.mission_title || '» bị thu hồi: ' || p_reason, v_me.id);
  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('submission_revert_reject', v_me.phone, v_me.name, v_me.id, jsonb_build_object('sub_id', p_submission_id, 'reason', p_reason, 'submitter', v_sub.submitter_phone));
end;
$$;
