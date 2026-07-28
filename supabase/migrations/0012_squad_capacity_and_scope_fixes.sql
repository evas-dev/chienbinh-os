-- ==========================================================================
-- 0012: đóng các lỗ hổng thật phát hiện qua gap-analysis epic-03/epic-07
--
--  1) ADM-08: admin_create_warrior nhận p_squad_id nhưng chỉ ghi vào cột
--     profiles.squad_id — cột này KHÔNG được bất kỳ trang nào dùng để tính
--     quân số/thành viên (squad/page.tsx, ranks/page.tsx, requests/page.tsx,
--     objectives/page.tsx đều đọc từ bảng squad_members). Nhân sự "được gán
--     tiểu đội lúc tạo" trước đây thực chất KHÔNG xuất hiện trong tiểu đội ở
--     bất kỳ đâu, không bị tính vào giới hạn quân số. Sửa: insert luôn vào
--     squad_members (đi qua trigger check_squad_member_limits để chặn
--     trùng/vượt trần), đồng thời vẫn giữ profiles.squad_id để tham chiếu.
--
--  2) SQU-05/SQU-06: check_squad_member_limits đếm rồi mới insert mà không
--     khoá — 2 giao dịch song song cùng thêm người vào suất cuối có thể đều
--     đọc được member_count=2 rồi đều insert thành công (vượt trần 3). Sửa:
--     khoá dòng squads (FOR UPDATE) + advisory lock theo warrior_id trước khi
--     đếm, để giao dịch thứ hai phải đợi giao dịch đầu commit rồi mới đếm lại.
--
--  3) SQU-04: assign_squad_member cho phép MỌI Tư Lệnh gán MỌI nhân sự vào
--     MỌI tiểu đội bất kể mặt trận — không khớp "Tư Lệnh chỉ thao tác trong
--     phạm vi tổ chức đã được giao" (đã áp dụng ở create_mission/
--     propose_commendation nhưng bị bỏ sót ở đây). Sửa: Tư Lệnh chỉ được thao
--     tác trong đúng mặt trận của mình (cả tiểu đội lẫn người được gán).
--     Lưu ý: AC3 của SQU-04 (Tư Lệnh chỉ được "đề xuất chờ duyệt" thay vì áp
--     dụng ngay) cần một luồng đề xuất/duyệt mới — chưa làm ở migration này,
--     ghi nhận là việc còn lại (xem báo cáo).
-- ==========================================================================

create or replace function check_squad_member_limits()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  member_count int;
begin
  -- Khoá theo tiểu đội (chống vượt trần quân số khi 2 giao dịch chạy song
  -- song) và theo người (chống 1 người bị thêm vào 2 tiểu đội cùng lúc).
  perform 1 from squads where id = new.squad_id for update;
  perform pg_advisory_xact_lock(hashtextextended(new.warrior_id::text, 0));

  select count(*) into member_count from squad_members where squad_id = new.squad_id;
  if member_count >= 3 then
    raise exception 'Tiểu đội % đã đủ tối đa 3 thành viên phụ', new.squad_id;
  end if;
  if exists (select 1 from squads where leader_id = new.warrior_id or deputy_id = new.warrior_id)
     or exists (select 1 from squad_members where warrior_id = new.warrior_id) then
    raise exception 'Chiến binh % đã thuộc một tiểu đội khác', new.warrior_id;
  end if;
  return new;
end;
$$;

create or replace function admin_create_warrior(
  p_user_id uuid, p_name text, p_phone text, p_dept text,
  p_front front_type, p_role role_type, p_squad_id text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_squad squads;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được tạo tài khoản nhân sự'; end if;
  if exists (select 1 from profiles where phone = p_phone) then raise exception 'Số điện thoại đã tồn tại'; end if;

  if p_squad_id is not null then
    select * into v_squad from squads where id = p_squad_id for update;
    if v_squad is null then raise exception 'Không tìm thấy tiểu đội'; end if;
  end if;

  insert into profiles (id, name, phone, dept, front, role, squad_id)
  values (p_user_id, p_name, p_phone, p_dept, p_front, p_role, p_squad_id);

  -- ADM-08: phải ghi luôn vào squad_members (nguồn sự thật của quân số/thành
  -- viên) — trigger check_squad_member_limits sẽ chặn nếu đội đã đủ 3 thành
  -- viên phụ, và toàn bộ giao dịch (kể cả insert profiles ở trên) sẽ rollback
  -- nếu bị chặn, nên không tạo tài khoản "nửa vời" (đã có profile, sai đội).
  if p_squad_id is not null then
    insert into squad_members (squad_id, warrior_id) values (p_squad_id, p_user_id);
  end if;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('admin_create_warrior', v_me.phone, v_me.name, v_me.id,
    jsonb_build_object('new_warrior_id', p_user_id, 'phone', p_phone, 'role', p_role, 'squad_id', p_squad_id));
end;
$$;

create or replace function admin_set_active(p_warrior_id uuid, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_target profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được khoá/mở tài khoản'; end if;
  select * into v_target from profiles where id = p_warrior_id;
  if v_target is null then raise exception 'Không tìm thấy chiến binh'; end if;
  if v_target.role = 'tong_tu_lenh' then raise exception 'Không thể khoá tài khoản CEO'; end if;
  if v_target.id = v_me.id then raise exception 'Không thể tự khoá chính mình'; end if;
  update profiles set active = p_active where id = p_warrior_id;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values (case when p_active then 'admin_reactivate' else 'admin_suspend' end,
    v_me.phone, v_me.name, v_me.id,
    jsonb_build_object('target_id', p_warrior_id, 'target_phone', v_target.phone, 'active', p_active));
end;
$$;

create or replace function assign_squad_member(p_squad_id text, p_warrior_id uuid, p_squad_role text)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_squad squads; v_target profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền quản lý tiểu đội'; end if;

  select * into v_squad from squads where id = p_squad_id for update;
  if v_squad is null then raise exception 'Không tìm thấy tiểu đội'; end if;

  select * into v_target from profiles where id = p_warrior_id;
  if v_target is null then raise exception 'Không tìm thấy chiến binh'; end if;

  -- SQU-04.2: Tư Lệnh chỉ được thao tác trong đúng mặt trận của mình (cùng
  -- quy tắc đã áp dụng ở create_mission/propose_commendation).
  if v_me.role = 'tu_lenh' and (v_squad.front != v_me.front or v_target.front != v_me.front) then
    raise exception 'Tư Lệnh chỉ được quản lý tiểu đội và nhân sự trong mặt trận của mình';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_warrior_id::text, 0));

  if p_squad_role in ('leader', 'deputy') then
    if exists (select 1 from squad_members where warrior_id = p_warrior_id)
       or exists (select 1 from squads where (leader_id = p_warrior_id or deputy_id = p_warrior_id) and id != p_squad_id) then
      raise exception 'Chiến binh đã thuộc một tiểu đội khác';
    end if;
    if p_squad_role = 'leader' then
      update squads set leader_id = p_warrior_id where id = p_squad_id;
    else
      update squads set deputy_id = p_warrior_id where id = p_squad_id;
    end if;
  elsif p_squad_role = 'member' then
    insert into squad_members (squad_id, warrior_id) values (p_squad_id, p_warrior_id);
  else
    raise exception 'squad_role không hợp lệ (leader|deputy|member)';
  end if;
end;
$$;
