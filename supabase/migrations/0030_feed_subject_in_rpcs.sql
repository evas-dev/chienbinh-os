-- 0030: 8 RPC ghi feed phải set thêm subject_id (cột thêm ở 0029).
--
-- subject_id = nhân sự mà sự kiện NÓI VỀ, khác actor_id = người bấm nút.
-- Ví dụ khi Tư Lệnh duyệt kết quả của Chiến Sỹ:
--   actor_id   = Tư Lệnh (người duyệt)
--   subject_id = Chiến Sỹ (người được duyệt, +EXP)
-- Không có subject_id thì policy "read feed scoped by role" (0029) sẽ không
-- cho chính Chiến Sỹ đó thấy việc mình được duyệt / thăng quân hàm / bị phạt.
--
-- CÁCH LÀM — cố ý KHÔNG dán lại thân hàm:
-- 8 hàm này đã tích luỹ nhiều logic quan trọng qua các migration 0015–0023
-- (guard chống race condition, cộng/trừ EXP, roll-up KPI, chống trùng). Dán lại
-- thủ công là cơ hội để sai sót lọt vào đúng những chỗ nguy hiểm nhất. Thay vào
-- đó migration này ĐỌC định nghĩa đang chạy bằng pg_get_functiondef() rồi chỉ
-- thay đúng câu `insert into feed`, nên phần thân còn lại không thể bị đổi.
--
-- Regex neo vào 'insert into feed (icon, text, actor_id, subject_id)' rồi dùng
-- [^;]*? nên chỉ chèn giá trị trong phạm vi câu insert feed đó — không đụng tới
-- các câu `insert into system_log` cũng có v_me.id ở gần.

do $migr$
declare
  r record;
  v_oid oid;
  v_so_ban int;
  v_def text;
  v_new text;
  v_so_insert int;
  v_so_subject int;
begin
  for r in
    select *
    from (values
      -- hàm                             chủ thể của dòng feed
      ('apply_penalty',                  'v_target.id'),        -- người bị xử phạt
      ('approve_commendation',           'v_com.staff_id'),     -- người được khen
      ('approve_submission',             'v_submitter.id'),     -- người nộp được duyệt (2 dòng: duyệt + thăng quân hàm)
      ('assign_objective_item',          'p_owner_id'),         -- người được giao KPI
      ('reject_submission',              'v_sub.submitter_id'), -- người nộp bị từ chối
      ('revert_submission_to_rejected',  'v_submitter.id'),     -- người nộp bị thu hồi
      ('revoke_commendation',            'v_com.staff_id'),     -- người bị thu hồi huy hiệu
      ('submit_mission_result',          'v_me.id')             -- người nộp (actor trùng subject)
    ) as t(ten_ham, chu_the)
  loop
    select count(*), min(p.oid) into v_so_ban, v_oid
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f' and p.proname = r.ten_ham;

    if v_so_ban <> 1 then
      raise exception 'Cần đúng 1 bản của %, tìm thấy %', r.ten_ham, v_so_ban;
    end if;

    v_def := pg_get_functiondef(v_oid);

    -- 1) Bổ sung cột subject_id vào danh sách cột.
    v_new := replace(
      v_def,
      'insert into feed (icon, text, actor_id)',
      'insert into feed (icon, text, actor_id, subject_id)'
    );

    -- 2) Chèn giá trị chủ thể ngay sau v_me.id, chỉ trong câu insert feed.
    --    Đúng cho cả dạng `values (..., v_me.id);` và `select ..., v_me.id from ...;`
    v_new := regexp_replace(
      v_new,
      '(insert into feed \(icon, text, actor_id, subject_id\)[^;]*?v_me\.id)',
      '\1, ' || r.chu_the,
      'g'
    );

    -- Không đổi gì => giả định về hình dạng câu insert đã sai, dừng ngay thay vì
    -- apply âm thầm một migration không có tác dụng.
    if v_new = v_def then
      raise exception 'Không patch được câu insert feed trong %', r.ten_ham;
    end if;

    -- Mỗi câu insert feed phải nhận đúng 1 giá trị subject_id.
    select count(*) into v_so_insert
    from regexp_matches(v_new, 'insert into feed \(icon, text, actor_id, subject_id\)', 'g');
    select count(*) into v_so_subject
    from regexp_matches(v_new, 'v_me\.id, ' || replace(r.chu_the, '.', '\.'), 'g');

    if v_so_insert <> v_so_subject then
      raise exception '% có % câu insert feed nhưng chỉ chèn được % subject_id',
        r.ten_ham, v_so_insert, v_so_subject;
    end if;

    execute v_new;
  end loop;
end
$migr$;
