-- ==========================================================================
-- 0022: Siết chặt RPC khen thưởng — đóng gap REW-01, REW-02, REW-04, REW-08,
-- REW-11 (audit).
--
-- REW-01: propose_commendation thiếu chặn tự đề xuất khen chính mình và
--   thiếu kiểm tra nhân sự đang hoạt động / huy hiệu hợp lệ (trước đây dựa
--   vào FK constraint, lỗi sẽ lộ chi tiết Postgres thay vì thông báo rõ ràng).
-- REW-02: approve_commendation thiếu chặn tự duyệt đề xuất do chính mình tạo
--   (Tổng Tư Lệnh vẫn được phép propose_commendation nên có thể tự duyệt).
-- REW-04: propose_commendation chưa dẫn người dùng tới đề xuất đang chờ hiện
--   có cho cùng người + huy hiệu (AC1) và chưa chặn đề xuất mới khi huy hiệu
--   đó đã được trao rồi từ trước (AC2 — ngoài bảo vệ PK warrior_badges).
-- REW-08: chưa có cách nào thu hồi một khen thưởng đã trao sai — thêm RPC
--   revoke_commendation, đánh dấu thu hồi thay vì xoá lịch sử.
-- REW-11: propose/approve/reject_commendation chưa ghi system_log — không có
--   audit trail nào cho các hành động khen thưởng.
-- ==========================================================================

alter table commendations add column if not exists revoked_at timestamptz;
alter table commendations add column if not exists revoked_by uuid references profiles(id);
alter table commendations add column if not exists revoke_reason text;

alter table warrior_badges add column if not exists revoked_at timestamptz;
alter table warrior_badges add column if not exists revoked_by uuid references profiles(id);
alter table warrior_badges add column if not exists revoke_reason text;

create or replace function propose_commendation(p_staff_id uuid, p_badge_code text, p_reason text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me profiles; v_staff profiles; v_existing_id uuid; v_id uuid;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền đề xuất khen thưởng'; end if;

  select * into v_staff from profiles where id = p_staff_id;
  if v_staff is null then raise exception 'Không tìm thấy nhân sự'; end if;
  if not v_staff.active then raise exception 'Chỉ đề xuất khen cho nhân sự đang hoạt động'; end if;
  if v_staff.id = v_me.id then raise exception 'Không thể tự đề xuất khen chính mình'; end if;
  if v_me.role = 'tu_lenh' and v_staff.front != v_me.front then
    raise exception 'Chỉ được đề xuất cho nhân sự cùng mặt trận';
  end if;

  if not exists (select 1 from badges where code = p_badge_code) then
    raise exception 'Huy hiệu không hợp lệ';
  end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Phải nhập lý do'; end if;

  -- REW-04 AC1: đã có đề xuất đang chờ cho cùng người + huy hiệu -> trả về
  -- đề xuất hiện có thay vì tạo bản ghi trùng.
  select id into v_existing_id from commendations
  where staff_id = p_staff_id and badge_code = p_badge_code and status = 'cho_duyet'
  limit 1;
  if v_existing_id is not null then
    return v_existing_id;
  end if;

  -- REW-04 AC2: huy hiệu này đã được trao (chưa bị thu hồi) cho người này rồi
  -- -> không tạo đề xuất mới. (Huy hiệu lặp lại theo kỳ chưa được mô hình hoá
  -- trong schema hiện tại — xem ghi chú AC3 trong tài liệu user story.)
  if exists (
    select 1 from warrior_badges
    where warrior_id = p_staff_id and badge_code = p_badge_code and revoked_at is null
  ) then
    raise exception 'Nhân sự này đã có huy hiệu này rồi';
  end if;

  insert into commendations (staff_id, badge_code, reason, proposed_by, status)
  values (p_staff_id, p_badge_code, p_reason, v_me.id, 'cho_duyet') returning id into v_id;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('commendation_propose', v_me.phone, v_me.name, v_me.id,
          jsonb_build_object('commendation_id', v_id, 'staff', v_staff.phone, 'badge_code', p_badge_code, 'reason', p_reason));

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
  if v_com.proposed_by = v_me.id then raise exception 'Không thể tự duyệt đề xuất do chính mình tạo'; end if;

  insert into warrior_badges (warrior_id, badge_code) values (v_com.staff_id, v_com.badge_code) on conflict do nothing;
  update commendations set status = 'da_duyet' where id = p_commendation_id;

  insert into feed (icon, text, actor_id)
  select '🏆', p.name || ' nhận huy hiệu từ đề xuất khen thưởng', v_me.id from profiles p where p.id = v_com.staff_id;
  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('commendation_approve', v_me.phone, v_me.name, v_me.id,
          jsonb_build_object('commendation_id', p_commendation_id, 'staff_id', v_com.staff_id, 'badge_code', v_com.badge_code));
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

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('commendation_reject', v_me.phone, v_me.name, v_me.id,
          jsonb_build_object('commendation_id', p_commendation_id, 'staff_id', v_com.staff_id, 'badge_code', v_com.badge_code));
end;
$$;

-- ---- REW-08: hoàn tác / thu hồi khen thưởng sai ----
create or replace function revoke_commendation(p_commendation_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_com commendations;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được thu hồi khen thưởng'; end if;

  select * into v_com from commendations where id = p_commendation_id;
  if v_com is null then raise exception 'Không tìm thấy đề xuất'; end if;
  if v_com.status != 'da_duyet' then raise exception 'Chỉ thu hồi được đề xuất đã trao'; end if;
  if v_com.revoked_at is not null then raise exception 'Đề xuất này đã được thu hồi trước đó'; end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Phải nhập lý do thu hồi'; end if;

  update commendations
  set revoked_at = now(), revoked_by = v_me.id, revoke_reason = p_reason
  where id = p_commendation_id;

  -- Không xoá bản ghi warrior_badges gốc — chỉ đánh dấu thu hồi để giữ lịch sử.
  update warrior_badges
  set revoked_at = now(), revoked_by = v_me.id, revoke_reason = p_reason
  where warrior_id = v_com.staff_id and badge_code = v_com.badge_code and revoked_at is null;

  insert into feed (icon, text, actor_id)
  select '↩️', p.name || ' bị thu hồi huy hiệu «' || v_com.badge_code || '»: ' || p_reason, v_me.id
  from profiles p where p.id = v_com.staff_id;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('commendation_revoke', v_me.phone, v_me.name, v_me.id,
          jsonb_build_object('commendation_id', p_commendation_id, 'staff_id', v_com.staff_id, 'badge_code', v_com.badge_code, 'reason', p_reason));
end;
$$;

grant execute on function revoke_commendation(uuid, text) to authenticated;
revoke execute on function revoke_commendation(uuid, text) from public, anon;
