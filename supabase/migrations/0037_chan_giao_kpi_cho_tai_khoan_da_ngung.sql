-- Không cho giao KPI vào tài khoản đã ngưng (profiles.active = false).
--
-- Giao diện đã lọc người đã ngưng khỏi mọi ô chọn, nhưng lọc ở giao diện chỉ là
-- gợi ý: tab mở sẵn từ trước, nút back, hay gọi thẳng RPC đều vượt qua được.
-- `create_mission`, `create_recurring_mission`, `propose_commendation`,
-- `apply_penalty` đã tự kiểm từ trước; `assign_objective_item` là hàm cuối cùng
-- còn thiếu — nó thậm chí chưa kiểm cả sự tồn tại của người nhận, nên một uuid
-- gõ nhầm vẫn tạo ra hồ sơ mục tiêu mồ côi.
--
-- Giữ nguyên phần còn lại của bản 0031 (mục tiêu theo tuần).

create or replace function assign_objective_item(
  p_owner_id uuid, p_metric text, p_metric_key text, p_target numeric,
  p_unit text, p_weight integer, p_confirm boolean default false
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me profiles;
  v_owner profiles;
  v_obj_id uuid;
  v_item_id uuid;
  v_tuan date := tuan_hien_tai();
  v_dup_exists boolean;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được giao KPI'; end if;
  if coalesce(trim(p_metric), '') = '' then raise exception 'Phải nhập tên chỉ tiêu'; end if;
  if p_target is null or p_target <= 0 then raise exception 'Con số mục tiêu phải lớn hơn 0'; end if;
  if p_weight is null or p_weight <= 0 or p_weight > 100 then raise exception 'Trọng số phải trong khoảng 1–100'; end if;

  select * into v_owner from profiles where id = p_owner_id;
  if v_owner.id is null then raise exception 'Không tìm thấy người nhận KPI'; end if;
  if not v_owner.active then raise exception 'Không thể giao KPI cho tài khoản đã ngưng hoạt động'; end if;

  select id into v_obj_id from objectives
  where owner_id = p_owner_id and week_start = v_tuan;

  if v_obj_id is null then
    insert into objectives (owner_id, week_start) values (p_owner_id, v_tuan)
    on conflict (owner_id, week_start) do nothing
    returning id into v_obj_id;

    -- Có unique index nên khi hai lần giao chạy song song, lần thua sẽ không
    -- insert được và v_obj_id là null — đọc lại bản của lần thắng.
    if v_obj_id is null then
      select id into v_obj_id from objectives
      where owner_id = p_owner_id and week_start = v_tuan;
    end if;
  end if;

  -- Trùng xác định theo owner + kỳ + khóa đo lường (hoặc tên chỉ tiêu khi không
  -- có khóa) — khớp business-rules.md KPI-06. Không tự gộp: chỉ cảnh báo, CEO
  -- xác nhận qua p_confirm mới tạo.
  select exists (
    select 1 from objective_items oi
    where oi.objective_id = v_obj_id
      and (
        (p_metric_key is not null and oi.metric_key = p_metric_key)
        or (p_metric_key is null and lower(trim(oi.metric)) = lower(trim(p_metric)))
      )
  ) into v_dup_exists;

  if v_dup_exists and not p_confirm then
    raise exception 'DUPLICATE_KPI: Đã có chỉ tiêu cùng khóa đo lường/tên trong tuần này cho người này. Xác nhận nếu vẫn muốn tạo thêm.';
  end if;

  insert into objective_items (objective_id, metric, metric_key, target, current, unit, weight)
  values (v_obj_id, p_metric, p_metric_key, p_target, 0, p_unit, p_weight)
  returning id into v_item_id;

  insert into feed (icon, text, actor_id, subject_id)
  values ('🎯', 'CEO giao KPI «' || p_metric || '» cho ' || v_owner.name, v_me.id, p_owner_id);

  return v_item_id;
end;
$$;

notify pgrst, 'reload schema';
