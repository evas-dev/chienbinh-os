-- ==========================================================================
-- 0019: KPI-05 — sửa lỗi cốt lõi khiến KPI KHÔNG BAO GIỜ tự cập nhật cho
-- luồng chính (Tư Lệnh bẻ mục tiêu thành nhiệm vụ giao Chiến Sỹ, KPI-03).
--
-- Bằng chứng thật trên dữ liệu demo: submission của Lan Chi (chiến sỹ,
-- content {"lead":130,...}) đã "da_duyet" từ trước, nhưng objective_items
-- "Khách hàng mới" (metric_key='lead') của Minh Đức (tư lệnh, chủ sở hữu
-- KPI, người giao nhiệm vụ) vẫn đứng yên ở current=78 — không hề nhích lên
-- dù đã duyệt. Nguyên nhân: approve_submission khớp
--   "o.owner_id = v_submitter.id"
-- tức là tìm objective do CHÍNH NGƯỜI NỘP sở hữu — nhưng theo KPI-03,
-- objective luôn thuộc về Tư Lệnh (người giao/assigner), còn người nộp kết
-- quả luôn là Chiến Sỹ (không sở hữu objective nào). Vế điều kiện không bao
-- giờ đúng cho luồng chuẩn → objective_items.current không bao giờ tự tăng
-- từ việc chiến sỹ nộp/được duyệt, trái KPI-05 AC1.
--
-- Sửa: khớp theo "o.owner_id = v_sub.assigner_id" — chủ sở hữu KPI là người
-- đã giao nhiệm vụ (thường là Tư Lệnh), đúng với luồng bẻ mục tiêu → giao
-- việc → nộp → duyệt → cộng dồn về đúng KPI người giao.
--
-- Không backfill dữ liệu demo cũ (current=78 giữ nguyên) — chỉ sửa hành vi
-- cho các lượt duyệt kể từ đây, tránh xáo trộn số liệu demo mà các epic khác
-- có thể đang tham chiếu.
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

  -- KPI: chủ sở hữu chỉ tiêu là người GIAO nhiệm vụ (assigner — thường là Tư
  -- Lệnh theo KPI-03 "bẻ mục tiêu thành nhiệm vụ"), không phải người nộp kết
  -- quả (submitter — Chiến Sỹ, không sở hữu objective nào). Xem ghi chú đầu file.
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
