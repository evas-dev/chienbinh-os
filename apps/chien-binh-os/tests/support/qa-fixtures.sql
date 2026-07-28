-- Fixture cho tests/staff-admin-and-squads.spec.ts (nhóm "ADM-08 & SQU-04/05/06").
-- Test process chỉ có anon key nên KHÔNG tự tạo được auth.users — phải chạy
-- khối SETUP này qua mcp__supabase__execute_sql (hoặc SQL editor) TRƯỚC khi
-- chạy suite, rồi chạy khối TEARDOWN ngay sau khi suite chạy xong. Không để
-- các dòng dept='QA' tồn tại lâu dài — chúng sẽ hiện thành 1 tab phòng ban
-- giả trên /admin thật.

-- ============================== SETUP ======================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', 'c7640c34-8824-49e2-9bbd-469cd593f7c6', 'authenticated', 'authenticated', 'qa_u_admok@chienbinh.local', crypt('123456', gen_salt('bf')), now(), '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '825dd19a-3153-44b9-8a81-e8443374842e', 'authenticated', 'authenticated', 'qa_u_full@chienbinh.local', crypt('123456', gen_salt('bf')), now(), '', '', '', '', now(), now())
on conflict (id) do nothing;

insert into squads (id, name, front) values
  ('sq_qa_full', 'QA Full Test Squad', 'tien_tuyen'),
  ('sq_qa_admok', 'QA AdmOK Test Squad', 'tien_tuyen'),
  ('sq_qa_cap', 'QA Capacity Test Squad', 'tien_tuyen'),
  ('sq_qa_race', 'QA Race Test Squad', 'tien_tuyen')
on conflict (id) do nothing;

insert into profiles (id, name, phone, role, dept, front, active, exp, season_points) values
  ('9e61ddb8-3523-4568-bc97-3f03fb493745', 'QA Fixture p1', '0909990101', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('28adc187-647b-447b-80a0-a8fe9f45941e', 'QA Fixture p2', '0909990102', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('e477bea4-61c4-4c19-959a-4ca587a4654d', 'QA Fixture p3', '0909990103', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('58eb62a1-f569-44b7-9db7-f8dcdcc8bec8', 'QA Fixture p4', '0909990104', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('6171eb91-f0fa-4a58-ad25-27afd1ec2484', 'QA Fixture p5', '0909990105', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('115e7963-b328-426d-bed5-9f250b23e007', 'QA Fixture p6', '0909990106', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('7d28a4f5-daa2-4dfa-8c2b-e0e8cf337cd2', 'QA Fixture p7', '0909990107', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('cd54b3c5-b674-4e46-888a-346421abb23a', 'QA Fixture p8', '0909990108', 'chien_sy', 'QA', 'hau_phuong', true, 0, 0),
  ('3a755a88-280a-4056-a6e0-d2fbb94f4054', 'QA Fixture rf1', '0909990109', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('79be30e9-cc86-4078-ae91-b7dcd05194ec', 'QA Fixture rf2', '0909990110', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('e1f4ff6f-1fb0-4f61-b3b6-046af729b2eb', 'QA Fixture raceA', '0909990111', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0),
  ('926472f1-931b-44b5-8496-63a2088bfbc7', 'QA Fixture raceB', '0909990112', 'chien_sy', 'QA', 'tien_tuyen', true, 0, 0)
on conflict (id) do nothing;

insert into squad_members (squad_id, warrior_id, squad_role) values
  ('sq_qa_full', '9e61ddb8-3523-4568-bc97-3f03fb493745', 'member'),
  ('sq_qa_full', '28adc187-647b-447b-80a0-a8fe9f45941e', 'member'),
  ('sq_qa_full', 'e477bea4-61c4-4c19-959a-4ca587a4654d', 'member'),
  ('sq_qa_race', '3a755a88-280a-4056-a6e0-d2fbb94f4054', 'member'),
  ('sq_qa_race', '79be30e9-cc86-4078-ae91-b7dcd05194ec', 'member')
on conflict do nothing;

-- ============================== TEARDOWN ===================================
-- (chạy sau khi suite xong — bỏ comment các dòng dưới, hoặc chạy riêng)

-- delete from squad_members where warrior_id in (select id from profiles where dept = 'QA');
-- delete from profiles where dept = 'QA';
-- delete from squads where id in ('sq_qa_full','sq_qa_admok','sq_qa_cap','sq_qa_race');
-- delete from auth.users where email like 'qa_%@chienbinh.local';
