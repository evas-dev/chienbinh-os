-- Chuyển chu kỳ mục tiêu/KPI từ THÁNG sang TUẦN (Thứ Hai – Chủ Nhật).
--
-- Cả `objectives`, `objective_items` và `missions` đang trống (dữ liệu demo đã
-- được dọn), nên đổi thẳng cấu trúc thay vì phải backfill.

-- ---------------------------------------------------------------------------
-- 1) Mốc tuần dùng chung
-- ---------------------------------------------------------------------------
-- Chốt theo giờ Việt Nam: server chạy UTC, nếu dùng now() trần thì từ 17:00
-- chiều Chủ Nhật (giờ VN) trở đi đã bị tính sang tuần mới.
-- date_trunc('week') của Postgres trả về Thứ Hai, đúng chuẩn ISO.
create or replace function tuan_hien_tai()
returns date language sql stable as $$
  select date_trunc('week', (now() at time zone 'Asia/Ho_Chi_Minh'))::date;
$$;

comment on function tuan_hien_tai is
  'Ngày Thứ Hai của tuần hiện tại theo giờ Việt Nam — mốc chu kỳ của objectives.';

-- ---------------------------------------------------------------------------
-- 2) objectives: month/year -> week_start
-- ---------------------------------------------------------------------------
alter table objectives drop column if exists month;
alter table objectives drop column if exists year;
alter table objectives
  add column if not exists week_start date not null default tuan_hien_tai();

-- Mỗi người chỉ có đúng 1 hồ sơ mục tiêu cho mỗi tuần. Trước đây không có ràng
-- buộc này nên hai lần giao KPI đồng thời có thể tạo 2 objective trùng kỳ.
create unique index if not exists objectives_owner_week_idx
  on objectives (owner_id, week_start);

comment on column objectives.week_start is
  'Thứ Hai của tuần áp dụng. Thay cho cặp month/year cũ.';

-- ---------------------------------------------------------------------------
-- 3) Loại nhiệm vụ: thang -> tuan
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
    where t.typname = 'mission_type' and e.enumlabel = 'thang'
  ) then
    alter type mission_type rename value 'thang' to 'tuan';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4) assign_objective_item: tìm/tạo hồ sơ mục tiêu theo TUẦN
-- ---------------------------------------------------------------------------
create or replace function assign_objective_item(
  p_owner_id uuid, p_metric text, p_metric_key text, p_target numeric,
  p_unit text, p_weight integer, p_confirm boolean default false
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me profiles;
  v_obj_id uuid;
  v_item_id uuid;
  v_tuan date := tuan_hien_tai();
  v_dup_exists boolean;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được giao KPI'; end if;
  if coalesce(trim(p_metric), '') = '' then raise exception 'Phải nhập tên chỉ tiêu'; end if;
  if p_target is null or p_target <= 0 then raise exception 'Con số mục tiêu phải lớn hơn 0'; end if;
  if p_weight is null or p_weight <= 0 or p_weight > 100 then raise exception 'Trọng số phải trong khoảng 1–100'; end if;

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
  select '🎯', 'CEO giao KPI «' || p_metric || '» cho ' || p.name, v_me.id, p_owner_id
  from profiles p where p.id = p_owner_id;

  return v_item_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5) approve_submission: chỉ cộng dồn vào chỉ tiêu của TUẦN HIỆN TẠI
-- ---------------------------------------------------------------------------
-- Lỗi sẵn có: vòng lặp roll-up chỉ lọc `o.owner_id = v_sub.assigner_id`, KHÔNG
-- lọc kỳ. Khi mỗi người chỉ có 1 hồ sơ mục tiêu thì vô hại, nhưng chu kỳ tuần
-- làm mỗi người tích luỹ nhiều hồ sơ và số liệu sẽ cộng vào MỌI tuần cũ.
-- Vá bằng cách chèn thêm điều kiện tuần vào đúng câu join đó, giữ nguyên phần
-- còn lại của hàm (đọc định nghĩa đang chạy thay vì dán tay).
do $$
declare
  v_def text;
  v_new text;
  v_cu  text := 'where o.owner_id = v_sub.assigner_id';
  v_moi text := 'where o.owner_id = v_sub.assigner_id and o.week_start = tuan_hien_tai()';
begin
  select pg_get_functiondef(p.oid) into v_def
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f' and p.proname = 'approve_submission';

  if v_def is null then
    raise exception 'Không tìm thấy approve_submission';
  end if;
  if position(v_cu in v_def) = 0 then
    raise exception 'Không thấy câu join roll-up KPI trong approve_submission — cấu trúc đã đổi, dừng lại thay vì vá mù';
  end if;

  v_new := replace(v_def, v_cu, v_moi);
  execute v_new;
end $$;
