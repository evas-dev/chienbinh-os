-- ==========================================================================
-- 0002: seed phần dữ liệu demo còn thiếu (missions/objectives/squad_members/
-- support_requests/commendations/penalty_log/feed) bằng đúng UUID thật của
-- 12 profiles đã tồn tại trên project live — giữ nguyên dữ liệu demo làm
-- dữ liệu khởi điểm thật theo quyết định đã chốt.
-- ==========================================================================

-- ---- support_requests: text -> enum tường minh + index cho check giới hạn
--      4 yêu cầu/tháng (tính trực tiếp bằng date_trunc trong RPC, không dùng
--      generated column vì to_char()/date_trunc(timestamptz) không immutable) ----
create type support_type as enum ('ho_tro_quan_ly','ho_tro_nhan_su','nghi_phep','de_xuat');
alter table support_requests alter column type type support_type using type::support_type;
create index support_requests_requester_created_idx on support_requests(requester_id, created_at);

-- ---- bảng tạm map id ngắn trong js/data.js -> uuid thật, dùng nội bộ migration này ----
create temporary table mission_id_map (old_id text primary key, id uuid not null default gen_random_uuid());
insert into mission_id_map (old_id) values
  ('m1'),('m2'),('m3'),('m4'),('m5'),('m6'),('m7'),('m8'),
  ('d1'),('d2'),('d3'),('d4'),('d5'),('b1'),('b2'),('b3');

-- ---- missions (16 nhiệm vụ demo từ js/data.js) ----
insert into missions (id, title, type, parent_id, assigner_id, assignee_id, target, unit, current, exp, badge_reward, deadline, status, fixed, icon)
select m.id, v.title, v.type::mission_type, p.id, a.id, asg.id, v.target, v.unit, v.current, v.exp, v.badge_reward, v.deadline, v.status::mission_status, v.fixed, v.icon
from (values
  ('m1','CHIẾN DỊCH Q3: Chiếm 300 khách hàng mới','chien_dich',null,'0901000001','0901000002',300,'khách hàng',182,2000,'general','30/09','doing',false,null),
  ('m2','Tháng 8: Chốt 40 hợp đồng mới','thang','m1','0901000002','0901000005',40,'hợp đồng',27,600,'big_deal','31/08','doing',false,null),
  ('m3','Tháng 8: 60 bài viết / video đạt tổng 500K view','thang','m1','0901000003','0901000007',500000,'view',318000,700,'viral','31/08','doing',false,null),
  ('m4','Hôm nay: Gọi chăm sóc 20 khách hàng cũ','ngay','m2','0901000002','0901000006',20,'cuộc gọi',0,120,null,'Hôm nay','todo',false,null),
  ('m5','Hôm nay: Đăng 3 video ngắn kênh TikTok','ngay','m3','0901000003','0901000008',3,'video',1,100,null,'Hôm nay','doing',false,null),
  ('m6','Tuần này: Tìm 25 khách hàng tiềm năng mới','thang','m1','0901000002','0901000006',25,'lead',25,300,'streak','18/08','review',false,null),
  ('m7','Tháng 8: Giữ hệ thống 0 sự cố nghiêm trọng','thang',null,'0901000001','0901000004',30,'ngày',22,500,'guardian','31/08','doing',false,null),
  ('m8','Hôm nay: Xử lý toàn bộ ticket CSKH tồn đọng','ngay',null,'0901000009','0901000011',15,'ticket',9,110,null,'Hôm nay','doing',false,null),
  ('d1','Viết 1 bài / đăng nội dung','ngay',null,'0901000002','0901000005',1,'bài',1,40,null,'Hôm nay','done',true,'✍️'),
  ('d2','Gọi chăm sóc 20 khách hàng cũ','ngay',null,'0901000002','0901000005',20,'cuộc',12,60,null,'Hôm nay','doing',true,'📞'),
  ('d3','Học 1 kỹ năng bán hàng mới','ngay',null,'0901000002','0901000005',1,'kỹ năng',0,80,null,'Hôm nay','todo',true,'📚'),
  ('b1','CHINH PHỤC: Chốt thêm 1 hợp đồng khó','ngay','m2','0901000002','0901000005',1,'HĐ',0,150,'big_deal','Hôm nay','todo',false,'🔥'),
  ('b2','CHINH PHỤC: Tìm 5 khách hàng tiềm năng','ngay','m2','0901000002','0901000005',5,'lead',2,100,null,'Hôm nay','doing',false,'🎯'),
  ('d4','Sản xuất 3 video ngắn','ngay',null,'0901000003','0901000007',3,'video',1,60,null,'Hôm nay','doing',true,'🎬'),
  ('d5','Đạt 5.000 view nội dung','ngay',null,'0901000003','0901000007',5000,'view',3200,50,null,'Hôm nay','doing',true,'📈'),
  ('b3','CHINH PHỤC: 1 video đạt 20K view','ngay','m3','0901000003','0901000007',20000,'view',0,180,'viral','Hôm nay','todo',false,'🚀')
) as v(old_id, title, type, parent_old_id, assigner_phone, assignee_phone, target, unit, current, exp, badge_reward, deadline, status, fixed, icon)
join mission_id_map m on m.old_id = v.old_id
left join mission_id_map p on p.old_id = v.parent_old_id
join profiles a on a.phone = v.assigner_phone
join profiles asg on asg.phone = v.assignee_phone;

-- d1 đã thật sự được nộp + duyệt trên live (xem submissions/exp_log) —
-- current/status ở trên đã set 'done'/1 để khớp thực tế, khác baseline gốc
-- trong js/data.js (vốn ghi 'todo'/0 vì lúc đó mission chưa tồn tại trong DB).

-- ---- squad_members: 1 thành viên phụ mỗi tiểu đội Sale/Marketing (theo data.js) ----
insert into squad_members (squad_id, warrior_id)
select 's1', id from profiles where phone = '0901000006' -- Hoàng Long
union all
select 's2', id from profiles where phone = '0901000008'; -- Tiến Dũng

-- ---- objectives + objective_items (mục tiêu tháng 8, theo data.js) ----
with obj as (
  insert into objectives (owner_id, month, year)
  select id, 8, 2026 from profiles where phone in ('0901000002','0901000003','0901000004','0901000009','0901000012')
  returning id, owner_id
)
insert into objective_items (objective_id, metric, metric_key, target, current, unit, weight)
select o.id, v.metric, v.metric_key, v.target, v.current, v.unit, v.weight
from obj o
join profiles p on p.id = o.owner_id
join (values
  ('0901000002','Doanh số tháng',null,2000000000,1240000000,'₫',40),
  ('0901000002','Hợp đồng mới',null,40,27,'HĐ',30),
  ('0901000002','Khách hàng mới','lead',120,78,'KH',30),
  ('0901000003','Tổng view nội dung','view',500000,318000,'view',40),
  ('0901000003','Lead tiềm năng','lead',300,186,'lead',35),
  ('0901000003','Bài / video xuất bản','bai_viet',60,41,'bài',25),
  ('0901000004','Tính năng bàn giao',null,8,5,'feature',50),
  ('0901000004','Ngày không sự cố',null,30,22,'ngày',50),
  ('0901000009','Ticket xử lý',null,400,268,'ticket',50),
  ('0901000009','CSAT hài lòng',null,95,91,'%',50),
  ('0901000012','Đóng sổ đúng hạn',null,100,80,'%',60),
  ('0901000012','Công nợ thu hồi',null,500000000,320000000,'₫',40)
) as v(phone, metric, metric_key, target, current, unit, weight) on v.phone = p.phone;

-- ---- support_requests (2 yêu cầu demo) ----
insert into support_requests (type, requester_id, target_id, content, status, created_at)
select 'nghi_phep'::support_type, r.id, t.id, 'Xin nghỉ phép 1 ngày 20/08 (việc gia đình)', 'da_duyet'::approval_status, timestamptz '2026-07-15 09:00+07'
from profiles r, profiles t where r.phone = '0901000005' and t.phone = '0901000002'
union all
select 'ho_tro_quan_ly'::support_type, r.id, t.id, 'Cần quản lý cùng đi chốt hợp đồng KH lớn', 'cho_duyet'::approval_status, timestamptz '2026-07-17 09:00+07'
from profiles r, profiles t where r.phone = '0901000005' and t.phone = '0901000002';

-- ---- commendations (2 đề xuất khen thưởng demo) ----
insert into commendations (staff_id, badge_code, reason, proposed_by, status)
select s.id, 'big_deal', 'Chốt hợp đồng lớn nhất tháng cho đội Sale', p.id, 'cho_duyet'::approval_status
from profiles s, profiles p where s.phone = '0901000005' and p.phone = '0901000002'
union all
select s.id, 'viral', 'Video đạt 120K view, dẫn đầu Marketing', p.id, 'cho_duyet'::approval_status
from profiles s, profiles p where s.phone = '0901000007' and p.phone = '0901000003';

-- ---- penalty_log (1 án phạt demo — thuần lịch sử hiển thị, KHÔNG tạo thêm
--      exp_log vì baseline exp bên dưới đã phản ánh sẵn exp hiện tại) ----
insert into penalty_log (warrior_id, penalty_code, reason, applied_by, created_at)
select w.id, 'khong_hoan_thanh', 'Trễ chỉ tiêu gọi khách 2 ngày', b.id, timestamptz '2026-07-12 09:00+07'
from profiles w, profiles b where w.phone = '0901000006' and b.phone = '0901000002';

-- ---- feed (5 mục nhật ký demo, cũ nhất trước) ----
insert into feed (icon, text, actor_id, created_at)
select v.icon, v.text, p.id, v.created_at
from (values
  ('💡','Văn Khoa được duyệt sáng kiến cải tiến quy trình deploy (+huy hiệu 💡)','0901000010',timestamptz '2026-07-27 08:00+07'),
  ('🛡','Tiểu đội Lá Chắn (CSKH) giữ vững 0 khiếu nại 2 tuần liên tiếp',null,timestamptz '2026-07-27 09:00+07'),
  ('🔥','Lan Chi hoàn thành chuỗi 7 ngày bất bại, nhận huy hiệu ⚡ Bất Bại','0901000005',timestamptz '2026-07-27 14:00+07'),
  ('🎖','Minh Đức thăng quân hàm Trung Sỹ sau khi chốt hợp đồng lớn','0901000002',timestamptz '2026-07-27 15:00+07'),
  ('👑','Thu Hà vươn lên #1 bảng xếp hạng mùa của Tiền Tuyến','0901000003',timestamptz '2026-07-27 16:30+07')
) as v(icon, text, phone, created_at)
left join profiles p on p.phone = v.phone;

-- ---- fix submissions.mission_ref: text 'd1' -> uuid thật của mission d1 ----
alter table submissions add column mission_ref_uuid uuid references missions(id) on delete cascade;
update submissions s set mission_ref_uuid = m.id from mission_id_map m where m.old_id = s.mission_ref;
alter table submissions alter column mission_ref_uuid set not null;
alter table submissions drop column mission_ref;
alter table submissions rename column mission_ref_uuid to mission_ref;

-- ---- exp_log baseline: mốc khởi điểm = exp/season_points hiện tại của mỗi
--      người, để từ nay exp_log là nguồn sự thật duy nhất (trigger ở
--      migration 0001 sẽ cộng dồn baseline + các dòng thật đã có, vd Lan Chi
--      1850 + 40 (đã duyệt thật) = 1890) ----
insert into exp_log (phone, warrior_name, delta, season_delta, reason, ref_table, warrior_id)
select phone, name, exp, season_points, 'seed_baseline: mốc khởi điểm dữ liệu demo', 'seed', id
from profiles;
