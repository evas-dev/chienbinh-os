-- ==========================================================================
-- CHIẾN BINH OS — Supabase / PostgreSQL schema
-- Chạy trong Supabase Dashboard → SQL Editor → New query → Run.
-- Auth: dùng Supabase Auth. Đăng nhập bằng SĐT + mật khẩu theo cách "phone-as-email"
--   (tạo user với email = <phone>@chienbinh.local, mật khẩu riêng) để giữ UX SĐT+mật khẩu.
--   profiles.id = auth.users.id (1-1).
-- ==========================================================================

-- ============================ ENUMS =======================================
create type front_type     as enum ('hau_phuong','tien_tuyen');
create type role_type      as enum ('tong_tu_lenh','tu_lenh','chien_sy');
create type mission_type   as enum ('chien_dich','thang','ngay');
create type mission_status as enum ('todo','doing','review','done');
create type approval_status as enum ('cho_duyet','da_duyet','tu_choi');
create type severity_type  as enum ('nhe','vua','nang','rat_nang');

-- ===================== BẢNG THAM CHIẾU (reference) ========================
-- Quân hàm
create table ranks (
  id serial primary key,
  name text not null,
  min_exp int not null,
  insignia text,
  tier text,
  ord int not null
);

-- Huy hiệu (định nghĩa)
create table badges (
  code text primary key,
  name text not null,
  icon text,
  rarity text,
  description text
);

-- Danh mục xử phạt
create table penalties (
  code text primary key,
  name text not null,
  exp_delta int not null,          -- số EXP trừ (âm)
  extra text,
  severity severity_type
);

-- Phần thưởng đổi bằng huy hiệu
create table rewards (
  id serial primary key,
  name text not null,
  cost text,
  icon text
);

-- ============================ TIỂU ĐỘI ====================================
create table squads (
  id text primary key,
  name text not null,
  leader_id uuid,
  deputy_id uuid,
  front front_type,
  dept text
);

-- ===================== NHÂN SỰ (profiles) =================================
-- Liên kết auth.users. Mật khẩu do Supabase Auth quản (KHÔNG lưu ở đây).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text unique not null,
  front front_type,
  dept text,
  squad_id text references squads(id),
  role role_type not null default 'chien_sy',
  exp int not null default 0,
  season_points int not null default 0,
  active boolean not null default true,     -- false = tài khoản bị ngưng (đăng nhập bị chặn ở tầng app/RLS)
  created_at timestamptz default now()
);

alter table squads add constraint fk_squad_leader foreign key (leader_id) references profiles(id) on delete set null;
alter table squads add constraint fk_squad_deputy foreign key (deputy_id) references profiles(id) on delete set null;

-- Huy hiệu đã đạt (n-n)
create table warrior_badges (
  warrior_id uuid references profiles(id) on delete cascade,
  badge_code text references badges(code),
  awarded_at timestamptz default now(),
  primary key (warrior_id, badge_code)
);

-- ===================== MỤC TIÊU THÁNG (KPI trọng số) ======================
create table objectives (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade, -- quản lý hoặc nhân sự nhận KPI
  month int not null,
  year int not null,
  created_at timestamptz default now()
);
create table objective_items (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid references objectives(id) on delete cascade,
  metric text not null,      -- VD: "Doanh số tháng", "Tổng view"
  target numeric not null,
  current numeric not null default 0,
  unit text,                 -- ₫, view, KH, HĐ...
  weight int not null default 10  -- trọng số %
);

-- ============================ NHIỆM VỤ ====================================
create table missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type mission_type not null,
  parent_id uuid references missions(id) on delete set null,  -- cây giao–nhận
  assigner_id uuid references profiles(id),
  assignee_id uuid references profiles(id),
  target numeric,
  unit text,
  current numeric default 0,
  exp int default 0,
  badge_reward text references badges(code),
  deadline text,
  status mission_status default 'todo',
  fixed boolean default false,   -- true = nhiệm vụ cố định hằng ngày
  icon text,
  created_at timestamptz default now()
);

-- Báo cáo kết quả (bằng chứng) — cần duyệt
create table mission_reports (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references missions(id) on delete cascade,
  submitter_id uuid references profiles(id),
  proof text,                    -- mã KH, hóa đơn, link view...
  quantity numeric,
  status approval_status default 'cho_duyet',
  reviewer_id uuid references profiles(id),
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- ============================ XỬ PHẠT =====================================
create table penalty_log (
  id uuid primary key default gen_random_uuid(),
  warrior_id uuid references profiles(id) on delete cascade,
  penalty_code text references penalties(code),
  reason text,
  applied_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ===================== YÊU CẦU HỖ TRỢ =====================================
create table support_requests (
  id uuid primary key default gen_random_uuid(),
  type text not null,            -- ho_tro_quan_ly | ho_tro_nhan_su | nghi_phep | de_xuat
  requester_id uuid references profiles(id) on delete cascade,
  target_id uuid references profiles(id),   -- người hỗ trợ / người duyệt
  content text,
  status approval_status default 'cho_duyet',
  created_at timestamptz default now()
);

-- ===================== ĐỀ XUẤT KHEN THƯỞNG ================================
create table commendations (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references profiles(id) on delete cascade,
  badge_code text references badges(code),
  reason text,
  proposed_by uuid references profiles(id),
  status approval_status default 'cho_duyet',
  created_at timestamptz default now()
);

-- ===================== NHẬT KÝ CHIẾN CÔNG (feed/thông báo) ================
create table feed (
  id uuid primary key default gen_random_uuid(),
  icon text,
  text text not null,
  actor_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- ===================== CẤU HÌNH (mục tiêu cty, quỹ thưởng, mùa) ===========
create table app_config (
  key text primary key,
  value jsonb
);

-- ==========================================================================
-- SEED — dữ liệu tham chiếu (quân hàm, huy hiệu, xử phạt, phần thưởng, cấu hình)
-- ==========================================================================
insert into ranks (name, min_exp, insignia, tier, ord) values
 ('Tân Thủ',0,'○','Tân binh',0),('Binh Nhì',150,'▪','Chiến sĩ',1),('Binh Nhất',350,'▪▪','Chiến sĩ',2),
 ('Hạ Sĩ',500,'➤','Hạ sĩ quan',3),('Trung Sĩ',900,'➤➤','Hạ sĩ quan',4),('Thượng Sĩ',1400,'➤➤➤','Hạ sĩ quan',5),
 ('Thiếu Úy',2000,'★','Cấp Úy',6),('Trung Úy',2700,'★★','Cấp Úy',7),('Thượng Úy',3500,'★★★','Cấp Úy',8),('Đại Úy',4400,'★★★★','Cấp Úy',9),
 ('Thiếu Tá',5400,'✪','Cấp Tá',10),('Trung Tá',6500,'✪✪','Cấp Tá',11),('Thượng Tá',7700,'✪✪✪','Cấp Tá',12),('Đại Tá',9000,'✪✪✪✪','Cấp Tá',13),
 ('Thiếu Tướng',10500,'⭐','Cấp Tướng',14),('Trung Tướng',12500,'⭐⭐','Cấp Tướng',15),('Thượng Tướng',15000,'⭐⭐⭐','Cấp Tướng',16),('Đại Tướng',18000,'⭐⭐⭐⭐','Cấp Tướng',17);

insert into badges (code,name,icon,rarity,description) values
 ('first_blood','Máu Lửa','🔥','rare','Hoàn thành nhiệm vụ đầu tiên'),
 ('big_deal','Hợp Đồng Lớn','💼','epic','Ký hợp đồng giá trị cao'),
 ('viral','Bùng Nổ View','📈','epic','Bài đạt mốc view khủng'),
 ('kaizen','Cải Tiến','💡','rare','Sáng kiến giúp tổ chức tốt hơn'),
 ('guardian','Hậu Phương Vững','🛡','rare','Không lỗi vận hành trong tháng'),
 ('streak','Bất Bại 7 Ngày','⚡','rare','7 ngày liên tiếp hoàn thành nhiệm vụ'),
 ('general','Danh Tướng','👑','legendary','Đứng #1 bảng xếp hạng mùa');

insert into penalties (code,name,exp_delta,extra,severity) values
 ('khong_hoan_thanh','Không hoàn thành nhiệm vụ',-150,'−1 ngày phép','nhe'),
 ('noi_xau','Nói xấu / gièm pha đồng đội',-200,'Thẻ cảnh cáo','vua'),
 ('mat_doan_ket','Gây mất đoàn kết nội bộ',-300,'Thẻ cảnh cáo + kiểm điểm','nang'),
 ('bien_thu','Biển thủ / tham nhũng tổ chức',-1000,'Đình chỉ + xử lý kỷ luật','rat_nang');

insert into rewards (name,cost,icon) values
 ('Nghỉ phép 1 ngày','3 huân chương','🌴'),('Nghỉ phép 2 ngày','6 huân chương','🏖'),
 ('Tiền đào tạo / khóa học','4 huân chương','📚'),('Chương trình đào tạo VIP','Huân chương 👑','🎓'),('Quà / hiện vật','2 huân chương','🎁');

insert into app_config (key,value) values
 ('bonus_pool', '{"pool":600000000,"months":6}'),
 ('company_target', '{"revenue":2000000000}'),
 ('pilot', '{"departments":["Marketing"]}');

-- ==========================================================================
-- RLS (Row Level Security) — bật cho mọi bảng. Chính sách chi tiết ở phase sau.
-- Ví dụ mẫu: ai đăng nhập cũng đọc được profiles (cho bảng xếp hạng);
-- chỉ CEO (tong_tu_lenh) mới tạo/ngưng tài khoản.
-- ==========================================================================
alter table profiles enable row level security;
alter table missions enable row level security;
alter table mission_reports enable row level security;
alter table objectives enable row level security;
alter table objective_items enable row level security;
alter table warrior_badges enable row level security;
alter table penalty_log enable row level security;
alter table support_requests enable row level security;
alter table commendations enable row level security;
alter table feed enable row level security;
alter table squads enable row level security;

-- Hàm tiện ích: lấy role của người đang đăng nhập
create or replace function current_role_type() returns role_type language sql stable as $$
  select role from profiles where id = auth.uid();
$$;

-- Ví dụ policy (mẫu — mở rộng ở phase phân quyền):
create policy "read profiles for all authed" on profiles for select using (auth.role() = 'authenticated');
create policy "self update profile" on profiles for update using (id = auth.uid());
create policy "ceo manage profiles" on profiles for all using (current_role_type() = 'tong_tu_lenh');
create policy "read feed for all authed" on feed for select using (auth.role() = 'authenticated');

-- (Các bảng còn lại: tạm để RLS bật + chưa có policy = chặn hết ở client.
--  Phase sau sẽ thêm policy theo vai: chiến sỹ thấy nhiệm vụ của mình, quản lý thấy đội, CEO thấy tất cả.)
