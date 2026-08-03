-- ==========================================================================
-- 0034: cho phép xoá nhiệm vụ giao nhầm
--
-- Giao nhầm người hoặc nhầm chỉ tiêu thì hiện không có cách nào sửa qua giao
-- diện — phải vào thẳng cơ sở dữ liệu.
--
-- BA CHỐT CHẶN, không được bỏ cái nào:
--  1) Chỉ người GIAO nhiệm vụ đó hoặc CEO mới được xoá.
--  2) Chỉ xoá khi còn 'todo'. Đã nhận nghĩa là người ta đang làm dở.
--  3) Chưa có kết quả nộp nào. Khoá `submissions_mission_ref_uuid_fkey` đặt
--     ON DELETE CASCADE, nên xoá nhiệm vụ là cuốn theo toàn bộ kết quả đã nộp
--     — kể cả kết quả đã duyệt và đã cộng EXP. Chốt này chặn hẳn khả năng đó.
-- ==========================================================================

create or replace function delete_mission(p_mission_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_m missions; v_so_nop int;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;

  select * into v_m from missions where id = p_mission_id;
  if v_m.id is null then raise exception 'Không tìm thấy nhiệm vụ'; end if;

  if v_m.assigner_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người giao nhiệm vụ hoặc Tổng Tư Lệnh mới được xoá';
  end if;

  if v_m.status != 'todo' then
    raise exception 'Chỉ xoá được nhiệm vụ chưa ai nhận';
  end if;

  select count(*) into v_so_nop from submissions where mission_ref = p_mission_id;
  if v_so_nop > 0 then
    raise exception 'Nhiệm vụ đã có kết quả nộp, không xoá được';
  end if;

  delete from missions where id = p_mission_id;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('mission_delete', v_me.phone, v_me.name, v_me.id,
    jsonb_build_object('mission_id', p_mission_id, 'title', v_m.title,
                       'assignee_id', v_m.assignee_id));
end;
$$;

revoke all on function delete_mission(uuid) from public, anon;
grant execute on function delete_mission(uuid) to authenticated;
