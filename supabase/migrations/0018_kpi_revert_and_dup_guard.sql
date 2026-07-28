-- ==========================================================================
-- 0018: KPI-05 (cập nhật kết quả từ nguồn nghiệp vụ) + KPI-06 (ngăn KPI trùng)
--
-- Gap 1 (KPI-05 AC3 / business-rules.md "Thu hồi duyệt phải hoàn tác ... KPI"):
--   approve_submission cộng objective_items.current qua CASE cứng 4 khóa
--   (lead/view/video/bai_viet), NHƯNG revert_submission_to_rejected chỉ đảo
--   exp_log — không đảo objective_items.current. Nếu duyệt rồi thu hồi rồi
--   nộp lại + duyệt lại, KPI bị cộng trùng vĩnh viễn phần của lần duyệt cũ.
--   Sửa: lưu chính xác phần đã cộng cho từng objective_item vào
--   submissions.kpi_deltas (jsonb {item_id: applied_delta}), revert đọc lại
--   để trừ đúng số đã cộng (không tính lại từ content, vì current có thể đã
--   bị "least(target, ...)" ghim trần).
--
-- Gap 2 (case cứng thiếu khóa): CONTENT_TYPES (src/lib/missions.ts) có
--   video/view/lead/bai_viet/bai_web nhưng CASE chỉ khớp 4/5 khóa numeric —
--   'bai_web' bị bỏ sót, luôn cộng 0 dù metric_key khớp. Thay CASE cứng bằng
--   vòng lặp tổng quát theo objective_items.metric_key thực tế.
--
-- Gap 3 (KPI-06 AC1/AC3): assign_objective_item tạo objective_item mới mà
--   không kiểm tra trùng (cùng objective + cùng metric_key, hoặc cùng tên
--   chỉ tiêu khi không có metric_key) — tạo âm thầm bản ghi trùng. Thêm
--   p_confirm: mặc định false → cảnh báo (raise exception có tiền tố
--   'DUPLICATE_KPI:') thay vì tạo ngay; true → cho phép tạo (đã xác nhận).
-- ==========================================================================

alter table submissions add column if not exists kpi_deltas jsonb;

create or replace function approve_submission(p_submission_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sub submissions; v_mission missions; v_me profiles; v_submitter profiles;
  v_exp_delta int; v_before_rank int; v_after_rank int;
  v_badge_msg text := ''; v_badge_inserted boolean := false;
  v_item objective_items%rowtype;
  v_raw numeric; v_applied numeric;
  v_kpi_deltas jsonb := '{}'::jsonb;
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

  -- KPI mục tiêu tháng: khớp theo metric_key thực tế (không CASE cứng), chỉ
  -- áp dụng khóa số (loại trừ 'khac' — nội dung tự do, không phải số) và ghi
  -- lại chính xác phần đã cộng để revert_submission_to_rejected đảo đúng.
  for v_item in
    select oi.* from objective_items oi
    join objectives o on oi.objective_id = o.id
    where o.owner_id = v_submitter.id
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
  v_item_id uuid; v_delta numeric;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Phải đăng nhập'; end if;
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

  -- Đảo đúng phần KPI đã cộng lúc duyệt (không tính lại từ content — current
  -- có thể đã bị ghim ở "target" nếu vượt mức, nên phải trừ đúng số đã ghi).
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

-- ---- KPI-06: chặn tạo chỉ tiêu trùng âm thầm ----
drop function if exists assign_objective_item(uuid, text, text, numeric, text, int);

create or replace function assign_objective_item(
  p_owner_id uuid, p_metric text, p_metric_key text,
  p_target numeric, p_unit text, p_weight int,
  p_confirm boolean default false
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me profiles;
  v_obj_id uuid;
  v_item_id uuid;
  v_now timestamptz := now();
  v_dup_exists boolean;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được giao KPI'; end if;
  if coalesce(trim(p_metric), '') = '' then raise exception 'Phải nhập tên chỉ tiêu'; end if;
  if p_target is null or p_target <= 0 then raise exception 'Con số mục tiêu phải lớn hơn 0'; end if;
  if p_weight is null or p_weight <= 0 or p_weight > 100 then raise exception 'Trọng số phải trong khoảng 1–100'; end if;

  select id into v_obj_id from objectives
  where owner_id = p_owner_id
    and month = extract(month from v_now) and year = extract(year from v_now);

  if v_obj_id is null then
    insert into objectives (owner_id, month, year)
    values (p_owner_id, extract(month from v_now), extract(year from v_now))
    returning id into v_obj_id;
  end if;

  -- Trùng xác định theo owner + kỳ (đã có qua v_obj_id) + khóa đo lường (hoặc
  -- tên chỉ tiêu khi không có khóa) — khớp business-rules.md KPI-06. Không tự
  -- gộp: chỉ cảnh báo, người có quyền (CEO) xác nhận qua p_confirm mới tạo.
  select exists (
    select 1 from objective_items oi
    where oi.objective_id = v_obj_id
      and (
        (p_metric_key is not null and oi.metric_key = p_metric_key)
        or (p_metric_key is null and lower(trim(oi.metric)) = lower(trim(p_metric)))
      )
  ) into v_dup_exists;

  if v_dup_exists and not p_confirm then
    raise exception 'DUPLICATE_KPI: Đã có chỉ tiêu cùng khóa đo lường/tên trong tháng này cho người này. Xác nhận nếu vẫn muốn tạo thêm.';
  end if;

  insert into objective_items (objective_id, metric, metric_key, target, current, unit, weight)
  values (v_obj_id, p_metric, p_metric_key, p_target, 0, p_unit, p_weight)
  returning id into v_item_id;

  insert into feed (icon, text, actor_id)
  select '🎯', 'CEO giao KPI «' || p_metric || '» cho ' || p.name, v_me.id
  from profiles p where p.id = p_owner_id;

  return v_item_id;
end;
$$;

revoke execute on function assign_objective_item(uuid, text, text, numeric, text, int, boolean) from public;
revoke execute on function assign_objective_item(uuid, text, text, numeric, text, int, boolean) from anon;
grant execute on function assign_objective_item(uuid, text, text, numeric, text, int, boolean) to authenticated;
