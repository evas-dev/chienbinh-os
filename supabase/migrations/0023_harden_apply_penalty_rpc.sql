-- ==========================================================================
-- 0023: Siết chặt RPC apply_penalty — đóng gap PEN-02, PEN-05, PEN-06, PEN-11.
--
-- PEN-02: thiếu chặn tự xử phạt chính mình, thiếu chặn Tư Lệnh xử phạt người
--   ngoài mặt trận quản lý, thiếu chặn xử phạt tài khoản đã ngưng hoạt động.
--   (UI dropdown ở penalty/page.tsx trước đây liệt kê TOÀN BỘ nhân sự công ty
--   cho cả Tư Lệnh — chỉ là lọc hiển thị phía client, không phải kiểm soát
--   thật; RPC phải tự kiểm tra vì đây là security definer, bỏ qua RLS.)
-- PEN-05: apply_penalty trước đây KHÔNG có bất kỳ phát hiện trùng nào — gọi
--   lại đúng tham số (do mất kết nối / double-submit) sẽ trừ điểm 2 lần.
-- PEN-06: bút toán exp_log dùng ref_id = p_warrior_id (không phải id bản ghi
--   penalty_log) nên không thể truy vết chính xác từ một khoản trừ EXP về
--   đúng án phạt nguồn — sửa lại dùng id của bản ghi penalty_log vừa tạo.
-- PEN-11: apply_penalty chưa ghi system_log — không có audit trail.
-- ==========================================================================

create or replace function apply_penalty(p_warrior_id uuid, p_code text, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_me profiles;
  v_target profiles;
  v_penalty penalties;
  v_penalty_log_id uuid;
  v_reason_norm text;
  v_dup_recent boolean;
  v_dup_any boolean;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.role not in ('tong_tu_lenh', 'tu_lenh') then raise exception 'Không có quyền xử phạt'; end if;

  select * into v_target from profiles where id = p_warrior_id;
  if v_target is null then raise exception 'Không tìm thấy chiến binh'; end if;
  if v_target.role = 'tong_tu_lenh' then raise exception 'Không thể xử phạt Tổng Tư Lệnh'; end if;
  if v_target.id = v_me.id then raise exception 'Không thể tự xử phạt chính mình'; end if;
  if not v_target.active then raise exception 'Không thể xử phạt tài khoản đã ngưng hoạt động'; end if;
  if v_me.role = 'tu_lenh' and v_target.front != v_me.front then
    raise exception 'Chỉ được xử phạt nhân sự cùng mặt trận';
  end if;

  select * into v_penalty from penalties where code = p_code;
  if v_penalty is null then raise exception 'Không tìm thấy mã hình phạt'; end if;
  v_reason_norm := lower(trim(coalesce(p_reason, '')));
  if v_reason_norm = '' then raise exception 'Phải nhập lý do xử phạt'; end if;

  -- PEN-05 AC1: request gửi lặp lại do mất kết nối (giống hệt người, mã, lý
  -- do, người áp dụng trong 30s gần nhất) -> coi như idempotent, không tạo
  -- bản ghi/trừ điểm lần hai.
  select exists (
    select 1 from penalty_log
    where warrior_id = p_warrior_id and penalty_code = p_code and applied_by = v_me.id
      and lower(trim(reason)) = v_reason_norm
      and created_at > now() - interval '30 seconds'
  ) into v_dup_recent;
  if v_dup_recent then
    return;
  end if;

  -- PEN-05 AC2: đã có án phạt cùng mã + cùng lý do cho người này (không nhất
  -- thiết gần đây) -> cảnh báo có thể trùng thay vì âm thầm ghi thêm. Người
  -- chỉ huy muốn ghi tái phạm phải nêu lý do/tình tiết khác (AC3).
  select exists (
    select 1 from penalty_log
    where warrior_id = p_warrior_id and penalty_code = p_code
      and lower(trim(reason)) = v_reason_norm
  ) into v_dup_any;
  if v_dup_any then
    raise exception 'Cảnh báo: đã có án phạt trùng mã vi phạm và lý do cho người này — nếu đây là vụ tái phạm, hãy bổ sung chi tiết vụ việc mới vào lý do';
  end if;

  insert into penalty_log (warrior_id, penalty_code, reason, applied_by)
  values (p_warrior_id, p_code, p_reason, v_me.id)
  returning id into v_penalty_log_id;

  -- PEN-06: ref_id phải trỏ đúng về bản ghi penalty_log vừa tạo để truy vết
  -- được từ bút toán EXP về đúng án phạt nguồn.
  insert into exp_log (phone, warrior_name, delta, season_delta, reason, ref_table, ref_id, warrior_id, created_by)
  values (v_target.phone, v_target.name, v_penalty.exp_delta, 0, v_penalty.name || ': ' || p_reason,
          'penalty_log', v_penalty_log_id, v_target.id, v_me.id);

  insert into feed (icon, text, actor_id) values ('⚖️', v_target.name || ' bị xử phạt: ' || v_penalty.name, v_me.id);

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('penalty_apply', v_me.phone, v_me.name, v_me.id,
          jsonb_build_object('penalty_log_id', v_penalty_log_id, 'warrior', v_target.phone, 'code', p_code, 'reason', p_reason));
end;
$$;
