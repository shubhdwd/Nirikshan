-- Improved routing: one nearest eligible responder per assistance_type, skipping already-offered users.
drop function if exists public.route_case(uuid);
create or replace function public.route_case(p_case_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  c record;
  a record;
  d numeric;
  offered_count integer := 0;
begin
  select * into c from cases where id = p_case_id;
  if not found then
    return 0;
  end if;

  update cases set status = 'ROUTING' where id = p_case_id and status = 'PENDING_ROUTING';

  for a in
    with types as (
      select distinct assistance_type
      from case_assistance
      where case_id = p_case_id
        and status = 'PENDING'
    ),
    eligible as (
      select
        t.assistance_type,
        rp.user_id,
        rl.latitude,
        rl.longitude,
        rp.response_radius_km,
        distance_km(c.latitude, c.longitude, rl.latitude, rl.longitude) as km
      from types t
      join user_roles up
        on ( lower(up.role::text) = lower(t.assistance_type::text)
             or (t.assistance_type = 'PCRN' and up.role in ('pcrn_l1', 'pcrn_l2')) )
      join responder_profiles rp on rp.user_id = up.user_id
      join responder_locations rl on rl.responder_id = rp.user_id
      where rp.approved and rp.active and up.is_active
        and up.approval_status = 'APPROVED'
        and exists(
          select 1 from availability av
          where av.responder_id = rp.user_id
            and av.available
            and now() between av.starts_at and av.ends_at
        )
        and not exists(
          select 1 from case_assignments ex
          where ex.case_id = p_case_id
            and ex.responder_id = rp.user_id
            and ex.assistance_type = t.assistance_type
        )
    ),
    ranked as (
      select
        assistance_type, user_id, latitude, longitude, response_radius_km, km,
        row_number() over (partition by assistance_type order by km asc) as rn
      from eligible
      where km <= response_radius_km
    )
    select assistance_type, user_id, latitude, longitude, km
    from ranked
    where rn = 1
  loop
    insert into case_assignments(case_id, responder_id, assistance_type, distance_km)
      values (p_case_id, a.user_id, a.assistance_type, a.km);
    insert into notifications(user_id, case_id, title, body, type)
      values (a.user_id, p_case_id, 'New case available',
              'A nearby human-verification request is available.', 'CASE_ASSIGNMENT');
    offered_count := offered_count + 1;
  end loop;

  return offered_count;
end
$$;

-- Re-route helper for a single assistance type (used after DECLINED).
create or replace function public.reroute_assistance(p_case_id uuid, p_assistance assistance_type)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  c record;
  next_user uuid;
  next_km numeric;
begin
  select * into c from cases where id = p_case_id;
  if not found then
    return null;
  end if;

  select rp.user_id, distance_km(c.latitude, c.longitude, rl.latitude, rl.longitude) as km
    into next_user, next_km
  from user_roles up
  join responder_profiles rp on rp.user_id = up.user_id
  join responder_locations rl on rl.responder_id = rp.user_id
  where ( lower(up.role::text) = lower(p_assistance::text)
          or (p_assistance = 'PCRN' and up.role in ('pcrn_l1','pcrn_l2')) )
    and rp.approved and rp.active and up.is_active
    and up.approval_status = 'APPROVED'
    and exists(
      select 1 from availability av
      where av.responder_id = rp.user_id
        and av.available
        and now() between av.starts_at and av.ends_at
    )
    and not exists(
      select 1 from case_assignments ex
      where ex.case_id = p_case_id
        and ex.responder_id = rp.user_id
        and ex.assistance_type = p_assistance
    )
    and distance_km(c.latitude, c.longitude, rl.latitude, rl.longitude) <= rp.response_radius_km
  order by km asc
  limit 1;

  if next_user is null then
    return null;
  end if;

  insert into case_assignments(case_id, responder_id, assistance_type, distance_km)
    values (p_case_id, next_user, p_assistance, next_km);
  insert into notifications(user_id, case_id, title, body, type)
    values (next_user, p_case_id, 'New case available',
            'A nearby human-verification request is available.', 'CASE_ASSIGNMENT');

  return next_user;
end
$$;
