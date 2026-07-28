-- ==========================================================================
-- 0026: BON-02 — set_bonus_config hiện không kiểm tra p_months (chu kỳ chỉ
-- được hỗ trợ 3 hoặc 6 tháng theo quy tắc nghiệp vụ) và không chặn p_pool
-- null (điều kiện `p_pool < 0` với null trả về null → không raise → lưu
-- quỹ null, phá vỡ hiển thị ở trang /bonus). Thêm validate rõ ràng, nêu
-- đúng trường cần sửa theo yêu cầu AC2.
-- ==========================================================================

create or replace function set_bonus_config(p_pool numeric, p_months integer)
returns void language plpgsql security definer set search_path = public as $$
declare v_me profiles;
begin
  select * into v_me from profiles where id = auth.uid();
  if v_me.id is null then raise exception 'Phải đăng nhập'; end if;
  if v_me.role != 'tong_tu_lenh' then raise exception 'Chỉ CEO mới được sửa quỹ thưởng'; end if;
  if p_pool is null or p_pool < 0 then raise exception 'Quỹ thưởng phải là số không âm'; end if;
  if p_months is null or p_months not in (3, 6) then raise exception 'Chu kỳ chia quỹ chỉ hỗ trợ 3 hoặc 6 tháng'; end if;

  update app_config set value = jsonb_build_object('pool', p_pool, 'months', p_months)
  where key = 'bonus_pool';
end;
$$;
