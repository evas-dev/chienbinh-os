-- FEED: phân quyền xem nhật ký theo vai trò + tách chủ thể ra khỏi chuỗi text.
--
-- Vấn đề: feed chỉ có `actor_id` = người THỰC HIỆN hành động. Với phần lớn sự
-- kiện, người được nói tới lại là người khác:
--   insert into feed (icon, text, actor_id)
--   values ('✅', v_submitter.name || ' được duyệt ...', v_me.id)
--                 ^^^ chủ thể là Chiến Sỹ      ^^^ actor là Tư Lệnh duyệt
-- Nên lọc theo actor_id sẽ khiến Chiến Sỹ KHÔNG thấy chính việc mình được
-- duyệt / thăng quân hàm / bị xử phạt. Thêm `subject_id` = người mà sự kiện
-- nói về, tách khỏi actor.
--
-- Phạm vi xem (chốt với người dùng):
--   - Chiến Sỹ      : chỉ sự kiện của chính mình
--   - Tư Lệnh       : của mình + nhân sự CÙNG PHÒNG BAN (dept)
--   - Tổng Tư Lệnh  : toàn bộ
--
-- Lưu ý: dùng `dept` chứ không phải `front` như policy penalty_log. Cố ý —
-- một mặt trận gồm nhiều phòng ban với nhiều Tư Lệnh (Tiền Tuyến = Marketing
-- + Sale), lọc theo front sẽ cho Tư Lệnh Marketing thấy nhân sự của Tư Lệnh
-- Sale, không phải "nhân sự bên dưới" của mình. `dept` cũng bền hơn squad_id
-- vì nhân sự tạo mới luôn có phòng ban, còn tiểu đội có thể chưa gán.

alter table feed
  add column if not exists subject_id uuid references profiles(id) on delete set null;

comment on column feed.subject_id is
  'Nhân sự mà sự kiện NÓI VỀ (khác actor_id = người thực hiện). NULL = thông báo chung toàn công ty, mọi người đọc được — mọi RPC ghi feed về một cá nhân BẮT BUỘC set cột này, nếu bỏ trống thì dòng đó thành công khai.';

-- Feed luôn truy vấn theo "mới nhất trước, lọc theo chủ thể".
create index if not exists feed_subject_created_idx on feed (subject_id, created_at desc);

-- Backfill 6 dòng hiện có (seed demo). Khớp theo tên ở đầu chuỗi text; dòng
-- nói về tiểu đội (🛡) cố tình để NULL vì không thuộc cá nhân nào.
update feed f set subject_id = p.id
from profiles p
where f.subject_id is null
  and f.text like p.name || ' %';

drop policy if exists "read feed for all authed" on feed;

create policy "read feed scoped by role" on feed for select using (
  -- Thông báo chung không gắn cá nhân (VD thành tích tiểu đội).
  subject_id is null
  -- Sự kiện về chính mình.
  or subject_id = auth.uid()
  -- Người tự tay thực hiện luôn thấy lại thao tác của mình (VD Tư Lệnh duyệt
  -- kết quả cho nhân sự phòng khác do CEO giao chéo).
  or actor_id = auth.uid()
  -- CEO xem toàn bộ.
  or exists (
    select 1 from profiles me
    where me.id = auth.uid() and me.role = 'tong_tu_lenh'
  )
  -- Tư Lệnh xem nhân sự cùng phòng ban.
  or exists (
    select 1 from profiles me
    join profiles subj on subj.id = feed.subject_id
    where me.id = auth.uid() and me.role = 'tu_lenh' and subj.dept = me.dept
  )
);
