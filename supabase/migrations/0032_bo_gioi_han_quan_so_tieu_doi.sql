-- ==========================================================================
-- 0032: bỏ trần 3 thành viên phụ mỗi tiểu đội
--
-- Trần quân số (đặt ở 0001, siết lại ở 0012) chặn tiểu đội có quá 3 thành
-- viên phụ. Nghiệp vụ đổi: tiểu đội được phép có bao nhiêu người tuỳ ý.
--
-- GIỮ NGUYÊN quy tắc "một người chỉ thuộc một tiểu đội" — đây là ràng buộc
-- độc lập, và nhiều trang (objectives, requests) vẫn giả định mỗi người có
-- đúng một đội trưởng trực tiếp.
--
-- Bỏ luôn `for update` trên squads: khoá đó chỉ tồn tại để đếm quân số an
-- toàn khi có trần (0012 · SQU-05/06). Không còn trần thì nó chỉ khiến các
-- lượt thêm người vào cùng một đội phải xếp hàng vô ích. Advisory lock theo
-- warrior_id vẫn cần, vì nó bảo vệ phép kiểm tra "đã thuộc đội khác chưa".
-- ==========================================================================

create or replace function check_squad_member_limits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.warrior_id::text, 0));

  if exists (select 1 from squads where leader_id = new.warrior_id or deputy_id = new.warrior_id)
     or exists (select 1 from squad_members where warrior_id = new.warrior_id) then
    raise exception 'Chiến binh % đã thuộc một tiểu đội khác', new.warrior_id;
  end if;
  return new;
end;
$$;
