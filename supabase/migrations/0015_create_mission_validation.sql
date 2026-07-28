-- ==========================================================================
-- 0015: MIS-07 — create_mission hiện chỉ kiểm tra tiêu đề rỗng, không chặn
-- mục tiêu/EXP âm hoặc bằng 0, đơn vị/hạn rỗng, hay người nhận đã bị ngưng
-- (MIS-06 tiêu chí 3). Client (create-mission-dialog.tsx, fixed-task-button.tsx)
-- có validate sơ bộ nhưng RPC là security definer — gọi thẳng qua
-- /rest/v1/rpc/create_mission vẫn tạo được nhiệm vụ rác. Vá tại DB, nguồn sự
-- thật duy nhất.
-- ==========================================================================

create or replace function create_mission(
  p_title text, p_type mission_type, p_parent_id uuid, p_assignee_id uuid,
  p_target numeric, p_unit text, p_exp int, p_badge_reward text,
  p_deadline text, p_fixed boolean, p_icon text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_assignee profiles; v_id uuid;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền tạo nhiệm vụ'; end if;

  if coalesce(trim(p_title), '') = '' then raise exception 'Phải nhập tiêu đề nhiệm vụ'; end if;
  if coalesce(trim(p_unit), '') = '' then raise exception 'Phải nhập đơn vị tính'; end if;
  if coalesce(trim(p_deadline), '') = '' then raise exception 'Phải nhập hạn hoàn thành'; end if;
  if p_assignee_id is null then raise exception 'Phải chọn người nhận nhiệm vụ'; end if;
  if p_target is null or p_target <= 0 then raise exception 'Chỉ tiêu phải lớn hơn 0'; end if;
  if p_exp is null or p_exp < 0 then raise exception 'EXP thưởng không được âm'; end if;

  select * into v_assignee from profiles where id = p_assignee_id;
  if v_assignee.id is null then raise exception 'Không tìm thấy người nhận nhiệm vụ'; end if;
  if not v_assignee.active then raise exception 'Không thể giao nhiệm vụ cho tài khoản đã bị ngưng'; end if;
  if v_me.role = 'tu_lenh' and v_assignee.front != v_me.front then
    raise exception 'Chỉ được giao nhiệm vụ trong mặt trận của mình';
  end if;

  insert into missions (title, type, parent_id, assigner_id, assignee_id, target, unit, exp, badge_reward, deadline, fixed, icon, status)
  values (p_title, p_type, p_parent_id, v_me.id, p_assignee_id, p_target, p_unit, p_exp, p_badge_reward, p_deadline, p_fixed, p_icon, 'todo')
  returning id into v_id;
  return v_id;
end;
$$;
