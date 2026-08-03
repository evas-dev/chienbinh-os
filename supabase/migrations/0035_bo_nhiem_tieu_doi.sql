-- ==========================================================================
-- 0035: bổ nhiệm / gỡ chức trong tiểu đội
--
-- LỖI ĐANG CÓ: assign_squad_member chặn bổ nhiệm bất kỳ ai đã có tên trong
-- squad_members — kể cả người đang là thành viên thường của CHÍNH tiểu đội đó.
-- Nghĩa là không thể phong một thành viên lên đội trưởng, dù đấy là việc bình
-- thường nhất. Cả 5 tiểu đội hiện đang trống chức vì lý do này.
--
-- Sửa: chỉ chặn khi người đó thuộc tiểu đội KHÁC. Cùng đội thì chuyển chức.
-- Người đang giữ chức bị thay sẽ lùi về làm thành viên thường, không bị đá ra
-- khỏi đội.
--
-- Bổ sung remove_squad_member để gỡ người khỏi tiểu đội — trước đây chỉ thêm
-- được, không gỡ được.
-- ==========================================================================

create or replace function assign_squad_member(p_squad_id text, p_warrior_id uuid, p_squad_role text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_me profiles; v_squad squads; v_target profiles;
  v_doi_hien_tai text; v_nguoi_giu_chuc_cu uuid;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền quản lý tiểu đội'; end if;
  if p_squad_role not in ('leader', 'deputy', 'member') then
    raise exception 'squad_role không hợp lệ (leader|deputy|member)';
  end if;

  select * into v_squad from squads where id = p_squad_id for update;
  if v_squad.id is null then raise exception 'Không tìm thấy tiểu đội'; end if;

  select * into v_target from profiles where id = p_warrior_id;
  if v_target.id is null then raise exception 'Không tìm thấy chiến binh'; end if;
  if not v_target.active then raise exception 'Không thể bổ nhiệm tài khoản đã bị ngưng'; end if;

  -- Tư Lệnh chỉ được thao tác trong đúng mặt trận của mình (cùng quy tắc đã
  -- áp dụng ở create_mission/propose_commendation).
  if v_me.role = 'tu_lenh' and (v_squad.front != v_me.front or v_target.front != v_me.front) then
    raise exception 'Tư Lệnh chỉ được quản lý tiểu đội và nhân sự trong mặt trận của mình';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_warrior_id::text, 0));

  -- Người này đang ở tiểu đội nào? Gộp cả hai nguồn: chức chỉ huy nằm ở bảng
  -- squads, còn thành viên thường nằm ở squad_members.
  select coalesce(
    (select id from squads where leader_id = p_warrior_id or deputy_id = p_warrior_id limit 1),
    (select squad_id from squad_members where warrior_id = p_warrior_id limit 1)
  ) into v_doi_hien_tai;

  if v_doi_hien_tai is not null and v_doi_hien_tai <> p_squad_id then
    raise exception 'Chiến binh đã thuộc một tiểu đội khác';
  end if;

  if p_squad_role in ('leader', 'deputy') then
    -- Nhớ người đang giữ chức TRƯỚC KHI ghi đè, để lát nữa cho họ lùi về
    -- thành viên thường thay vì biến mất khỏi đội.
    v_nguoi_giu_chuc_cu := case when p_squad_role = 'leader' then v_squad.leader_id else v_squad.deputy_id end;

    -- Gỡ khỏi ghế thành viên thường và khỏi chức cũ (nếu đang giữ chức kia).
    delete from squad_members where warrior_id = p_warrior_id;
    if p_squad_role = 'leader' then
      update squads set leader_id = p_warrior_id,
                        deputy_id = case when deputy_id = p_warrior_id then null else deputy_id end
      where id = p_squad_id;
    else
      update squads set deputy_id = p_warrior_id,
                        leader_id = case when leader_id = p_warrior_id then null else leader_id end
      where id = p_squad_id;
    end if;

    -- Chỉ đẩy người cũ xuống SAU khi bảng squads đã cập nhật: trigger
    -- check_squad_member_limits từ chối chèn người còn đang giữ chức chỉ huy.
    if v_nguoi_giu_chuc_cu is not null and v_nguoi_giu_chuc_cu <> p_warrior_id then
      insert into squad_members (squad_id, warrior_id)
      values (p_squad_id, v_nguoi_giu_chuc_cu)
      on conflict do nothing;
    end if;
  else
    -- Hạ về thành viên thường: bỏ chức trước rồi mới chèn, cùng lý do trigger.
    update squads
    set leader_id = case when leader_id = p_warrior_id then null else leader_id end,
        deputy_id = case when deputy_id = p_warrior_id then null else deputy_id end
    where id = p_squad_id;
    insert into squad_members (squad_id, warrior_id) values (p_squad_id, p_warrior_id)
    on conflict do nothing;
  end if;

  update profiles set squad_id = p_squad_id where id = p_warrior_id;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('squad_assign', v_me.phone, v_me.name, v_me.id,
    jsonb_build_object('squad_id', p_squad_id, 'warrior_id', p_warrior_id, 'squad_role', p_squad_role));
end;
$$;

create or replace function remove_squad_member(p_squad_id text, p_warrior_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_squad squads; v_target profiles; v_co int;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền quản lý tiểu đội'; end if;

  select * into v_squad from squads where id = p_squad_id for update;
  if v_squad.id is null then raise exception 'Không tìm thấy tiểu đội'; end if;

  select * into v_target from profiles where id = p_warrior_id;
  if v_target.id is null then raise exception 'Không tìm thấy chiến binh'; end if;

  if v_me.role = 'tu_lenh' and (v_squad.front != v_me.front or v_target.front != v_me.front) then
    raise exception 'Tư Lệnh chỉ được quản lý tiểu đội và nhân sự trong mặt trận của mình';
  end if;

  update squads
  set leader_id = case when leader_id = p_warrior_id then null else leader_id end,
      deputy_id = case when deputy_id = p_warrior_id then null else deputy_id end
  where id = p_squad_id;

  delete from squad_members where squad_id = p_squad_id and warrior_id = p_warrior_id;
  get diagnostics v_co = row_count;

  -- Không có dòng thành viên nào bị xoá VÀ cũng không giữ chức gì ở đội này
  -- thì tức là gọi nhầm — báo lỗi thay vì im lặng coi như xong.
  if v_co = 0 and v_squad.leader_id is distinct from p_warrior_id
     and v_squad.deputy_id is distinct from p_warrior_id then
    raise exception 'Chiến binh không thuộc tiểu đội này';
  end if;

  update profiles set squad_id = null where id = p_warrior_id and squad_id = p_squad_id;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('squad_remove', v_me.phone, v_me.name, v_me.id,
    jsonb_build_object('squad_id', p_squad_id, 'warrior_id', p_warrior_id));
end;
$$;

revoke all on function remove_squad_member(text, uuid) from public, anon;
grant execute on function remove_squad_member(text, uuid) to authenticated;
