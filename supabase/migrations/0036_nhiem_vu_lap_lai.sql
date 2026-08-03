-- ==========================================================================
-- 0036: nhiệm vụ Daily tự giao lại theo các ngày trong tuần
--
-- Trước đây "Daily" chỉ là NHÃN phân loại, không có cơ chế lặp: mỗi nhiệm vụ
-- tạo đúng một lần, hôm sau quản lý phải bấm tay lại. Tệ hơn, nút mẫu đặt tên
-- "Hôm nay: ..." và hạn là hôm nay, nên sang ngày hôm sau nó nằm lại với chữ
-- "Hôm nay" và hạn đã quá.
--
-- Nay: quản lý tạo một MẪU LẶP, chọn những thứ trong tuần cần giao. Mỗi sáng
-- có một tác vụ chạy sinh nhiệm vụ thật cho đúng những ngày đó.
-- ==========================================================================

create table if not exists recurring_missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  unit text not null,
  target numeric not null check (target > 0),
  exp integer not null check (exp >= 0),
  assignee_id uuid not null references profiles(id) on delete cascade,
  assigner_id uuid not null references profiles(id) on delete cascade,
  -- Thứ trong tuần theo chuẩn ISO: 1 = Thứ Hai … 7 = Chủ Nhật. Dùng ISO chứ
  -- không dùng `extract(dow)` (0 = Chủ Nhật) để khỏi lệch một ngày khi so.
  weekdays smallint[] not null check (
    array_length(weekdays, 1) between 1 and 7
    and weekdays <@ array[1,2,3,4,5,6,7]::smallint[]
  ),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists recurring_missions_assigner_idx on recurring_missions (assigner_id);
create index if not exists recurring_missions_active_idx on recurring_missions (active) where active;

-- Nhiệm vụ sinh ra từ mẫu nào. `on delete set null`: xoá mẫu thì các nhiệm vụ
-- đã giao vẫn còn nguyên, chỉ ngừng sinh tiếp.
alter table missions add column if not exists recurring_id uuid
  references recurring_missions(id) on delete set null;

-- Chốt chống trùng: một mẫu chỉ sinh ĐÚNG MỘT nhiệm vụ cho mỗi ngày. Tác vụ
-- hẹn giờ chạy lại (retry, chạy tay, hai lần trong ngày) cũng không nhân đôi.
create unique index if not exists missions_recurring_ngay_idx
  on missions (recurring_id, deadline) where recurring_id is not null;

alter table recurring_missions enable row level security;

-- Xem được mẫu liên quan tới mình; sửa đổi bắt buộc đi qua RPC.
drop policy if exists "doc mau lap theo pham vi" on recurring_missions;
create policy "doc mau lap theo pham vi" on recurring_missions for select using (
  assigner_id = auth.uid()
  or assignee_id = auth.uid()
  or exists (select 1 from profiles me where me.id = auth.uid() and me.role = 'tong_tu_lenh')
);

-- ==========================================================================
-- Sinh nhiệm vụ cho HÔM NAY
--
-- Không nhận tham số ngày: chốt cứng "hôm nay theo giờ Việt Nam" để tác vụ
-- hẹn giờ (chạy theo giờ UTC) không bao giờ sinh nhầm sang ngày khác.
-- ==========================================================================
create or replace function generate_daily_missions(p_only_template uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_thu smallint := extract(isodow from (now() at time zone 'Asia/Ho_Chi_Minh'))::smallint;
  v_dem integer := 0;
  r record;
begin
  for r in
    select rm.* from recurring_missions rm
    join profiles p on p.id = rm.assignee_id
    where rm.active
      and p.active                       -- không giao cho tài khoản đã ngưng
      and v_thu = any (rm.weekdays)
      and (p_only_template is null or rm.id = p_only_template)
  loop
    insert into missions (
      title, type, assigner_id, assignee_id, target, unit, exp,
      deadline, fixed, status, recurring_id
    )
    values (
      r.title, 'ngay', r.assigner_id, r.assignee_id, r.target, r.unit, r.exp,
      v_hom_nay, true, 'todo', r.id
    )
    on conflict (recurring_id, deadline) where recurring_id is not null do nothing;

    if found then v_dem := v_dem + 1; end if;
  end loop;

  return v_dem;
end;
$$;

-- Chỉ tác vụ hẹn giờ và tiến trình máy chủ được gọi; người dùng thường không.
revoke all on function generate_daily_missions(uuid) from public, anon, authenticated;

-- ==========================================================================
-- RPC cho quản lý
-- ==========================================================================
create or replace function create_recurring_mission(
  p_title text, p_target numeric, p_unit text, p_exp integer,
  p_assignee_ids uuid[], p_weekdays smallint[]
)
returns integer language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_target profiles; v_id uuid; v_dem integer := 0; v_ai uuid;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền giao nhiệm vụ'; end if;

  if coalesce(trim(p_title), '') = '' then raise exception 'Phải nhập tên nhiệm vụ'; end if;
  if coalesce(trim(p_unit), '') = '' then raise exception 'Phải nhập đơn vị tính'; end if;
  if p_target is null or p_target <= 0 then raise exception 'Chỉ tiêu phải lớn hơn 0'; end if;
  if p_exp is null or p_exp < 0 then raise exception 'EXP thưởng không được âm'; end if;
  if p_weekdays is null or array_length(p_weekdays, 1) is null then
    raise exception 'Phải chọn ít nhất một ngày trong tuần';
  end if;
  if coalesce(array_length(p_assignee_ids, 1), 0) = 0 then
    raise exception 'Phải chọn người nhận';
  end if;

  foreach v_ai in array p_assignee_ids loop
    select * into v_target from profiles where id = v_ai;
    if v_target.id is null then raise exception 'Không tìm thấy người nhận nhiệm vụ'; end if;
    if not v_target.active then raise exception 'Không thể giao cho tài khoản đã bị ngưng'; end if;
    if v_me.role = 'tu_lenh' and v_target.front != v_me.front then
      raise exception 'Chỉ được giao nhiệm vụ trong mặt trận của mình';
    end if;

    insert into recurring_missions (title, unit, target, exp, assignee_id, assigner_id, weekdays)
    values (trim(p_title), trim(p_unit), p_target, p_exp, v_ai, v_me.id, p_weekdays)
    returning id into v_id;

    -- Sinh luôn cho hôm nay nếu hôm nay nằm trong lịch — nếu không, quản lý
    -- lập lịch buổi sáng mà phải đợi tới mai mới thấy gì.
    perform generate_daily_missions(v_id);
    v_dem := v_dem + 1;
  end loop;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('recurring_create', v_me.phone, v_me.name, v_me.id,
    jsonb_build_object('title', p_title, 'so_nguoi', v_dem, 'weekdays', p_weekdays));

  return v_dem;
end;
$$;

create or replace function set_recurring_mission_active(p_id uuid, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_rm recurring_missions;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  select * into v_rm from recurring_missions where id = p_id;
  if v_rm.id is null then raise exception 'Không tìm thấy lịch lặp'; end if;
  if v_rm.assigner_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người tạo lịch hoặc Tổng Tư Lệnh mới được đổi';
  end if;
  update recurring_missions set active = p_active where id = p_id;
end;
$$;

create or replace function delete_recurring_mission(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_rm recurring_missions;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  select * into v_rm from recurring_missions where id = p_id;
  if v_rm.id is null then raise exception 'Không tìm thấy lịch lặp'; end if;
  if v_rm.assigner_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người tạo lịch hoặc Tổng Tư Lệnh mới được xoá';
  end if;
  -- Nhiệm vụ đã sinh ra vẫn giữ nguyên (khoá ngoại đặt set null).
  delete from recurring_missions where id = p_id;
end;
$$;

revoke all on function create_recurring_mission(text, numeric, text, integer, uuid[], smallint[]) from public, anon;
grant execute on function create_recurring_mission(text, numeric, text, integer, uuid[], smallint[]) to authenticated;
revoke all on function set_recurring_mission_active(uuid, boolean) from public, anon;
grant execute on function set_recurring_mission_active(uuid, boolean) to authenticated;
revoke all on function delete_recurring_mission(uuid) from public, anon;
grant execute on function delete_recurring_mission(uuid) to authenticated;
