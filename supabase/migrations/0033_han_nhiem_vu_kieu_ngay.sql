-- ==========================================================================
-- 0033: hạn nhiệm vụ chuyển từ chữ tự do sang kiểu NGÀY thật
--
-- `missions.deadline` đang là text nên giao diện phải cho gõ tay ("03/08",
-- "31/08", thậm chí "Hôm nay" do nút giao nhanh gửi lên). Hệ quả:
--   - Không chọn được bằng lịch, người dùng phải tự gõ đúng định dạng.
--   - Không có năm nên không thể so sánh để biết nhiệm vụ đã quá hạn.
--   - Mỗi nơi ghi một kiểu, không sắp xếp được.
--
-- Chuyển dữ liệu cũ rồi đổi kiểu cột. Cố tình KHÔNG dùng `using` bao dung
-- kiểu "cái gì hỏng thì cho null": nếu còn giá trị lạ thì lệnh ALTER phải
-- báo lỗi để biết mà xử lý, hơn là âm thầm xoá mất hạn của nhiệm vụ.
-- ==========================================================================

-- Dạng "dd/mm" (không năm) — gán năm hiện tại theo giờ Việt Nam.
update missions
set deadline = to_char(
      to_date(
        deadline || '/' || extract(year from (now() at time zone 'Asia/Ho_Chi_Minh'))::text,
        'DD/MM/YYYY'
      ),
      'YYYY-MM-DD'
    )
where deadline ~ '^\d{1,2}/\d{1,2}$';

-- Các chuỗi mô tả do nút giao nhanh sinh ra.
update missions
set deadline = to_char((now() at time zone 'Asia/Ho_Chi_Minh')::date, 'YYYY-MM-DD')
where deadline in ('Hôm nay', 'hôm nay', '—');

alter table missions alter column deadline type date using deadline::date;

-- Hàm giữ NGUYÊN chữ ký (p_deadline text) để không phải drop/tạo lại — làm
-- vậy sẽ mất quyền execute đã cấp. Chỉ siết thêm phần kiểm định dạng, còn
-- việc ép kiểu text -> date do Postgres tự làm khi insert.
create or replace function create_mission(
  p_title text, p_type mission_type, p_parent_id uuid, p_assignee_id uuid,
  p_target numeric, p_unit text, p_exp integer, p_badge_reward text,
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
  -- Chốt đúng một định dạng YYYY-MM-DD: để Postgres tự đoán thì '03/08' sẽ ra
  -- ngày 3 tháng 8 hay 8 tháng 3 tuỳ tham số DateStyle của phiên làm việc.
  if p_deadline !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'Hạn hoàn thành phải theo dạng YYYY-MM-DD';
  end if;
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
  values (p_title, p_type, p_parent_id, v_me.id, p_assignee_id, p_target, p_unit, p_exp, p_badge_reward, p_deadline::date, p_fixed, p_icon, 'todo')
  returning id into v_id;
  return v_id;
end;
$$;
