-- ==========================================================================
-- 0025: SUP-01 / SUP-02 / SUP-03 — siết create/respond/cancel_support_request
--
-- Gap 1 (SUP-01 AC3): các hàm hiện tại không kiểm tra `v_me.active` — một
-- tài khoản đã bị khoá nhưng còn phiên đăng nhập cũ vẫn gọi được RPC thành
-- công (khác các RPC khác trong 0004 đã có guard `not v_me.active`).
--
-- Gap 2 (SUP-02): p_target_id không được xác thực — người gọi có thể gửi
-- yêu cầu tới bất kỳ uuid nào (kể cả tài khoản đã khoá, hoặc sai loại vai
-- trò, hoặc chính mình), miễn đi qua được RLS. Thêm kiểm tra: người nhận
-- phải tồn tại, đang active, đúng loại vai trò cho loại yêu cầu, và không
-- phải chính người gửi.
--
-- Gap 3 (SUP-03 AC3): `date_trunc('month', now())` phụ thuộc TimeZone của
-- session Postgres (mặc định UTC trên Supabase), không phải giờ Việt Nam
-- như quy tắc nghiệp vụ yêu cầu — gây lệch ~7 tiếng ở ranh giới tháng. Sửa
-- bằng cách quy đổi tường minh sang Asia/Ho_Chi_Minh trước khi date_trunc,
-- rồi quy đổi lại về timestamptz để so sánh với created_at.
--
-- Gap 4 (SUP-07): xem cancel_support_request bên dưới — huỷ chuyển từ xoá
-- cứng sang đánh dấu `cancelled_at` để giữ đúng quota tháng theo quy tắc.
-- ==========================================================================

alter table support_requests add column if not exists cancelled_at timestamptz;

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

  -- Ranh giới tháng theo giờ Việt Nam, quy về timestamptz để so sánh an toàn
  -- bất kể TimeZone của session hiện tại.
  v_month_start := date_trunc('month', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh';

  select count(*) into v_count from support_requests
  where requester_id = v_me.id and created_at >= v_month_start;
  if v_count >= 4 then raise exception 'Đã đạt giới hạn 4 yêu cầu/tháng'; end if;

  insert into support_requests (type, requester_id, target_id, content, status)
  values (p_type, v_me.id, p_target_id, p_content, 'cho_duyet') returning id into v_id;
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
end;
$$;

-- SUP-07: huỷ chuyển sang đánh dấu `cancelled_at` thay vì xoá hẳn — bản ghi
-- cũ (delete from support_requests) làm quota tháng bị tính lại thấp hơn
-- sau khi huỷ, mâu thuẫn trực tiếp với quy tắc "Hủy không hoàn lại hạn mức
-- tháng đã sử dụng" (đếm quota theo count(*) created_at, xoá row = hoàn quota
-- ngầm). Giữ nguyên row để lưu vết và giữ đúng quota, chỉ ẩn khỏi luồng xử lý.
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
end;
$$;
