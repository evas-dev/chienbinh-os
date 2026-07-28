-- ==========================================================================
-- 0008: vá bug — submissions thiếu cột reviewer_id dù các RPC
-- approve/reject/revert_submission đều tham chiếu tới (phát hiện qua kiểm
-- thử thật: duyệt nhiệm vụ báo OK ở tầng app nhưng DB không đổi gì).
-- ==========================================================================
alter table submissions add column if not exists reviewer_id uuid references profiles(id);
