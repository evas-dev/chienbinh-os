-- ==========================================================================
-- 0027: SEC-05 — create/respond/cancel_support_request chưa ghi system_log
-- (khác các RPC nhạy cảm khác trong app đã có audit từ 0003/0010/0022/0023).
-- Redefine 3 hàm từ 0025, thêm đúng 1 insert system_log mỗi hàm, không đổi
-- logic nghiệp vụ nào khác.
-- ==========================================================================

create or replace function create_support_request(p_type support_type, p_target_id uuid, p_content text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me profiles;
  v_target profiles;
  v_count int;
  v_id uuid;
  v_month_start timestamptz;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if not v_me.active then raise exception 'Tài khoản đã bị ngưng'; end if;
  if coalesce(trim(p_content), '') = '' then raise exception 'Phải nhập nội dung yêu cầu'; end if;

  select * into v_target from profiles where id = p_target_id;
  if v_target.id is null then raise exception 'Không tìm thấy người nhận'; end if;
  if not v_target.active then raise exception 'Người nhận đã ngưng hoạt động, hãy chọn người khác'; end if;
  if v_target.id = v_me.id then raise exception 'Không thể tự gửi yêu cầu cho chính mình'; end if;
  if p_type = 'ho_tro_nhan_su' then
    if v_target.role != 'chien_sy' then raise exception 'Yêu cầu hỗ trợ từ nhân sự khác chỉ gửi cho đồng nghiệp Chiến Sỹ'; end if;
  else
    if v_target.role not in ('tu_lenh', 'tong_tu_lenh') then raise exception 'Loại yêu cầu này chỉ gửi cho quản lý'; end if;
  end if;

  v_month_start := date_trunc('month', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh';

  select count(*) into v_count from support_requests
  where requester_id = v_me.id and created_at >= v_month_start;
  if v_count >= 4 then raise exception 'Đã đạt giới hạn 4 yêu cầu/tháng'; end if;

  insert into support_requests (type, requester_id, target_id, content, status)
  values (p_type, v_me.id, p_target_id, p_content, 'cho_duyet') returning id into v_id;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('support_request_create', v_me.phone, v_me.name, v_me.id,
          jsonb_build_object('request_id', v_id, 'type', p_type, 'target', v_target.phone));

  return v_id;
end;
$$;

create or replace function respond_support_request(p_request_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_req support_requests; v_updated int;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if not v_me.active then raise exception 'Tài khoản đã bị ngưng'; end if;
  select * into v_req from support_requests where id = p_request_id;
  if v_req.id is null then raise exception 'Không tìm thấy yêu cầu'; end if;
  if v_req.target_id != v_me.id and v_me.role != 'tong_tu_lenh' then
    raise exception 'Chỉ người được nhắm tới hoặc CEO mới được phản hồi';
  end if;
  if v_req.cancelled_at is not null then raise exception 'Yêu cầu này đã bị huỷ'; end if;

  update support_requests set status = (case when p_approve then 'da_duyet' else 'tu_choi' end)::approval_status
  where id = p_request_id and status = 'cho_duyet' and cancelled_at is null;
  get diagnostics v_updated = row_count;
  if v_updated = 0 then raise exception 'Yêu cầu này đã được xử lý'; end if;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('support_request_respond', v_me.phone, v_me.name, v_me.id,
          jsonb_build_object('request_id', p_request_id, 'approved', p_approve));
end;
$$;

create or replace function cancel_support_request(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles; v_req support_requests; v_updated int;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if not v_me.active then raise exception 'Tài khoản đã bị ngưng'; end if;
  select * into v_req from support_requests where id = p_request_id;
  if v_req.id is null then raise exception 'Không tìm thấy yêu cầu'; end if;
  if v_req.requester_id != v_me.id then raise exception 'Chỉ người tạo yêu cầu mới được huỷ'; end if;

  update support_requests set cancelled_at = now()
  where id = p_request_id and status = 'cho_duyet' and cancelled_at is null;
  get diagnostics v_updated = row_count;
  if v_updated = 0 then raise exception 'Chỉ huỷ được yêu cầu đang chờ duyệt'; end if;

  insert into system_log (event_type, actor_phone, actor_name, actor_id, payload)
  values ('support_request_cancel', v_me.phone, v_me.name, v_me.id,
          jsonb_build_object('request_id', p_request_id));
end;
$$;
