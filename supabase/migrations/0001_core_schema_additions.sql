-- ==========================================================================
-- 0001: bổ sung cấu trúc còn thiếu so với thực tế đang chạy
-- ==========================================================================

-- ---- squad_members: tiểu đội hiện chỉ có leader_id/deputy_id, thiếu chỗ
--      chứa tối đa 3 thành viên phụ ----
create table squad_members (
  squad_id text not null references squads(id) on delete cascade,
  warrior_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (squad_id, warrior_id)
);
create index squad_members_warrior_id_idx on squad_members(warrior_id);

-- Tối đa 3 thành viên phụ/tiểu đội, và mỗi người chỉ thuộc đúng 1 tiểu đội
-- (leader/deputy/member) — khớp cấu trúc dữ liệu demo hiện có.
create or replace function check_squad_member_limits()
returns trigger language plpgsql as $$
declare
  member_count int;
begin
  select count(*) into member_count from squad_members where squad_id = new.squad_id;
  if member_count >= 3 then
    raise exception 'Tiểu đội % đã đủ tối đa 3 thành viên phụ', new.squad_id;
  end if;
  if exists (select 1 from squads where leader_id = new.warrior_id or deputy_id = new.warrior_id)
     or exists (select 1 from squad_members where warrior_id = new.warrior_id) then
    raise exception 'Chiến binh % đã thuộc một tiểu đội khác', new.warrior_id;
  end if;
  return new;
end;
$$;
create trigger trg_check_squad_member_limits
before insert on squad_members
for each row execute function check_squad_member_limits();

-- ---- profiles: rank "danh vọng cao nhất từng đạt" (không tụt khi bị phạt) ----
alter table profiles add column if not exists highest_rank_ord int not null default 0;
update profiles p set highest_rank_ord = coalesce(
  (select max(r.ord) from ranks r where r.min_exp <= p.exp), 0
);

-- ---- objective_items: khóa metric tường minh, thay cho so khớp chuỗi con
--      nhãn tiếng Việt (fragile) trong _applyKpiUpdate hiện tại ----
alter table objective_items add column if not exists metric_key text;

-- ---- submissions: mở rộng để có FK thật + snapshot exp_granted (đảm bảo
--      thu hồi duyệt trừ đúng số đã cộng, không tính lại từ mission.exp
--      có thể đã đổi) ----
alter table submissions
  add column if not exists submitter_id uuid references profiles(id),
  add column if not exists assigner_id  uuid references profiles(id),
  add column if not exists exp_granted  int,
  add column if not exists reverted_at  timestamptz;

update submissions s set
  submitter_id = (select id from profiles where phone = s.submitter_phone),
  assigner_id  = (select id from profiles where phone = s.assigner_phone)
where submitter_id is null;

update submissions s set exp_granted = (
  select e.delta from exp_log e where e.ref_id = s.id order by e.created_at asc limit 1
)
where exp_granted is null and s.status = 'da_duyet';

alter table submissions alter column status drop default;
alter table submissions alter column status type approval_status using status::approval_status;
alter table submissions alter column status set default 'cho_duyet'::approval_status;

-- ---- exp_log: trở thành ledger nguồn sự thật cho EXP + điểm mùa ----
alter table exp_log
  add column if not exists warrior_id   uuid references profiles(id),
  add column if not exists season_delta int not null default 0,
  add column if not exists ref_table    text,
  add column if not exists created_by   uuid references profiles(id);

update exp_log e set warrior_id = (select id from profiles where phone = e.phone)
where warrior_id is null;
update exp_log set ref_table = 'submissions' where ref_table is null and ref_id is not null;
-- Dòng test có sẵn: +40 EXP duyệt nhiệm vụ ngày → season_delta = round(40*0.6) = 24
update exp_log set season_delta = round(delta * 0.6)
where ref_table = 'submissions' and season_delta = 0 and delta > 0;

alter table exp_log alter column warrior_id set not null;

-- Ledger nguồn sự thật: profiles.exp/season_points là cache được tính lại
-- từ exp_log mỗi khi có dòng mới — không ai UPDATE trực tiếp 2 cột này được.
create or replace function apply_exp_log_to_profile()
returns trigger language plpgsql security definer as $$
begin
  update profiles set
    exp = greatest(0, (select coalesce(sum(delta), 0) from exp_log where warrior_id = new.warrior_id)),
    season_points = greatest(0, (select coalesce(sum(season_delta), 0) from exp_log where warrior_id = new.warrior_id))
  where id = new.warrior_id;

  update profiles p set highest_rank_ord = greatest(
    p.highest_rank_ord,
    coalesce((select max(r.ord) from ranks r where r.min_exp <= p.exp), 0)
  ) where p.id = new.warrior_id;

  return new;
end;
$$;
create trigger trg_apply_exp_log_to_profile
after insert on exp_log
for each row execute function apply_exp_log_to_profile();

-- ---- system_log: FK actor_id để join an toàn (giữ song song actor_phone hiển thị) ----
alter table system_log add column if not exists actor_id uuid references profiles(id);
update system_log s set actor_id = (select id from profiles where phone = s.actor_phone)
where actor_id is null;
