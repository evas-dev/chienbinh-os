-- ==========================================================================
-- 0021: Thu hẹp RLS đọc trên commendations & penalty_log theo phạm vi.
--
-- Trước migration này, policy "read commendations" / "read penalty_log" chỉ
-- kiểm tra auth.role() = 'authenticated' — nghĩa là BẤT KỲ người dùng đăng
-- nhập nào (kể cả Chiến Sỹ) cũng SELECT được toàn bộ đề xuất khen thưởng và
-- án phạt của mọi người trong công ty qua PostgREST trực tiếp, bất kể trang
-- UI có lọc theo phạm vi hay không (UI chỉ là lớp lọc hiển thị, không phải
-- kiểm soát truy cập thật).
--
-- Đóng gap: REW-09 (Xem lịch sử khen thưởng theo quyền, AC3), PEN-08 (Xem
-- lịch sử kỷ luật theo phạm vi, AC1/AC2), PEN-04 (Xem hồ sơ kỷ luật cá nhân,
-- AC3 — từ chối xem hồ sơ người khác).
--
-- Quy tắc phạm vi mới:
--   - Tổng Tư Lệnh: xem toàn bộ (không giới hạn).
--   - Tư Lệnh: xem của chính mình (staff_id/warrior_id = mình), việc mình
--     đề xuất/áp dụng (proposed_by/applied_by = mình), và mọi việc của nhân
--     sự cùng mặt trận (front) — đúng phạm vi quản lý.
--   - Chiến Sỹ: chỉ xem của chính mình (staff_id/warrior_id = mình).
-- ==========================================================================

drop policy if exists "read commendations" on commendations;
create policy "read commendations scoped" on commendations
for select
to authenticated
using (
  exists (select 1 from profiles me where me.id = auth.uid() and me.role = 'tong_tu_lenh')
  or staff_id = auth.uid()
  or proposed_by = auth.uid()
  or exists (
    select 1 from profiles me
    join profiles tgt on tgt.id = commendations.staff_id
    where me.id = auth.uid() and me.role = 'tu_lenh' and tgt.front = me.front
  )
);

drop policy if exists "read penalty_log" on penalty_log;
create policy "read penalty_log scoped" on penalty_log
for select
to authenticated
using (
  exists (select 1 from profiles me where me.id = auth.uid() and me.role = 'tong_tu_lenh')
  or warrior_id = auth.uid()
  or applied_by = auth.uid()
  or exists (
    select 1 from profiles me
    join profiles tgt on tgt.id = penalty_log.warrior_id
    where me.id = auth.uid() and me.role = 'tu_lenh' and tgt.front = me.front
  )
);
