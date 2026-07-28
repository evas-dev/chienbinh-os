-- ==========================================================================
-- 0007: RPC còn thiếu so với plan gốc — CEO giao KPI cho trưởng phòng,
-- sửa cấu hình quỹ thưởng.
-- ==========================================================================

create or replace function assign_objective_item(
  p_owner_id uuid, p_metric text, p_metric_key text,
  p_target numeric, p_unit text, p_weight int
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me profiles;
  v_obj_id uuid;
  v_item_id uuid;
  v_now timestamptz := now();
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được giao KPI'; end if;
  if coalesce(trim(p_metric), '') = '' then raise exception 'Phải nhập tên chỉ tiêu'; end if;

  select id into v_obj_id from objectives
  where owner_id = p_owner_id
    and month = extract(month from v_now) and year = extract(year from v_now);

  if v_obj_id is null then
    insert into objectives (owner_id, month, year)
    values (p_owner_id, extract(month from v_now), extract(year from v_now))
    returning id into v_obj_id;
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

create or replace function set_bonus_config(p_pool numeric, p_months int)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được sửa quỹ thưởng'; end if;
  if p_pool < 0 then raise exception 'Quỹ không thể âm'; end if;

  update app_config set value = jsonb_build_object('pool', p_pool, 'months', p_months)
  where key = 'bonus_pool';
end;
$$;

revoke execute on function assign_objective_item(uuid, text, text, numeric, text, int) from public;
revoke execute on function assign_objective_item(uuid, text, text, numeric, text, int) from anon;
grant execute on function assign_objective_item(uuid, text, text, numeric, text, int) to authenticated;

revoke execute on function set_bonus_config(numeric, int) from public;
revoke execute on function set_bonus_config(numeric, int) from anon;
grant execute on function set_bonus_config(numeric, int) to authenticated;
