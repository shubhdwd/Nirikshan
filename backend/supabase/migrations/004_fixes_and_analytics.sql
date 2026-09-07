-- ============================================================
-- Migration 004: NIRIKSHAN fixes & analytics support
-- 1. PCRN-first routing (route_case only routes PCRN)
-- 2. New route_org_assistance function (post-verification)
-- 3. verification_evidence table
-- 4. ngo_professional_assignments table
-- 5. Admin-wide & responder RLS policies
-- 6. Emergency flag column
-- 7. Realtime publications for new tables
-- ============================================================

-- -----------------------------------------------------------
-- 1. Fix route_case: only route PCRN assistance types
-- -----------------------------------------------------------
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
  offered_count integer := 0;
begin
  select * into c from cases where id = p_case_id;
  if not found then
    return 0;
  end if;

  update cases set status = 'ROUTING' where id = p_case_id and status = 'PENDING_ROUTING';

  -- Only route PCRN assistance types. NGO/Hospital/Police stay PENDING.
  for a in
    with pcrn_types as (
      select distinct assistance_type
      from case_assistance
      where case_id = p_case_id
        and status = 'PENDING'
        and assistance_type = 'PCRN'
    ),
    eligible as (
      select
        t.assistance_type,
        rp.user_id,
        rl.latitude,
        rl.longitude,
        rp.response_radius_km,
        distance_km(c.latitude, c.longitude, rl.latitude, rl.longitude) as km
      from pcrn_types t
      join user_roles up
        on (up.role in ('pcrn_l1', 'pcrn_l2'))
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

-- -----------------------------------------------------------
-- 2. New route_org_assistance: route NGO/Hospital/Police after VERIFIED
-- -----------------------------------------------------------
create or replace function public.route_org_assistance(p_case_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  c record;
  a record;
  offered_count integer := 0;
begin
  select * into c from cases where id = p_case_id;
  if not found then
    return 0;
  end if;

  -- Only proceed if case is VERIFIED or ORG_PENDING
  if c.status not in ('VERIFIED', 'ORG_PENDING') then
    return 0;
  end if;

  -- Set status to ORG_PENDING
  update cases set status = 'ORG_PENDING' where id = p_case_id;

  for a in
    with org_types as (
      select distinct assistance_type
      from case_assistance
      where case_id = p_case_id
        and status = 'PENDING'
        and assistance_type in ('NGO', 'HOSPITAL', 'POLICE')
    ),
    eligible as (
      select
        t.assistance_type,
        rp.user_id,
        rl.latitude,
        rl.longitude,
        rp.response_radius_km,
        distance_km(c.latitude, c.longitude, rl.latitude, rl.longitude) as km
      from org_types t
      join user_roles up
        on lower(up.role::text) = lower(t.assistance_type::text)
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
      values (a.user_id, p_case_id, 'Verified case assigned',
              'A verified child-welfare case requires your assistance.', 'ORG_ASSIGNMENT');
    offered_count := offered_count + 1;
  end loop;

  return offered_count;
end
$$;

-- Also fix reroute_assistance to respect PCRN-first (unchanged logic but re-affirm)
drop function if exists public.reroute_assistance(uuid, assistance_type);
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
            'A nearby request is available.', 'CASE_ASSIGNMENT');

  return next_user;
end
$$;

-- -----------------------------------------------------------
-- 3. verification_evidence table
-- -----------------------------------------------------------
create table if not exists public.verification_evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  verifier_id uuid not null references auth.users(id),
  storage_path text unique not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

alter table public.verification_evidence enable row level security;

-- Verifier can see/insert their own evidence
create policy ve_select_own on public.verification_evidence for select
  using (verifier_id = auth.uid());
create policy ve_insert_own on public.verification_evidence for insert
  with check (verifier_id = auth.uid());

-- PCRN L2 can see verification evidence for cases they are handling escalations on
create policy ve_select_l2_escalation on public.verification_evidence for select
  using (exists(
    select 1 from case_escalations ce
    where ce.case_id = verification_evidence.case_id
      and ce.handled_by = auth.uid()
  ));

-- -----------------------------------------------------------
-- 4. ngo_professional_assignments table
-- -----------------------------------------------------------
create table if not exists public.ngo_professional_assignments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  professional_user_id uuid not null references auth.users(id),
  assigned_by uuid not null references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ngo_professional_assignments enable row level security;

-- Members of the same org can see/insert/update
create policy npa_select_org on public.ngo_professional_assignments for select
  using (exists(
    select 1 from organization_members om
    where om.organization_id = ngo_professional_assignments.organization_id
      and om.user_id = auth.uid()
  ));
create policy npa_insert_org on public.ngo_professional_assignments for insert
  with check (exists(
    select 1 from organization_members om
    where om.organization_id = ngo_professional_assignments.organization_id
      and om.user_id = auth.uid()
  ));
create policy npa_update_org on public.ngo_professional_assignments for update
  using (exists(
    select 1 from organization_members om
    where om.organization_id = ngo_professional_assignments.organization_id
      and om.user_id = auth.uid()
  ));

-- updated_at trigger
create trigger npa_touch before update on public.ngo_professional_assignments
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------
-- 5. Admin-wide RLS policies (admin can SELECT everything)
-- -----------------------------------------------------------
-- Helper function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from user_roles
    where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
      and approval_status = 'APPROVED'
  )
$$;

create policy admin_all_profiles on public.profiles for select using (public.is_admin());
create policy admin_all_user_roles on public.user_roles for select using (public.is_admin());
create policy admin_all_responder_profiles on public.responder_profiles for select using (public.is_admin());
create policy admin_all_organizations on public.organizations for select using (public.is_admin());
create policy admin_all_org_members on public.organization_members for select using (public.is_admin());
create policy admin_all_cases on public.cases for select using (public.is_admin());
create policy admin_all_case_evidence on public.case_evidence for select using (public.is_admin());
create policy admin_all_case_assistance on public.case_assistance for select using (public.is_admin());
create policy admin_all_notifications on public.notifications for select using (public.is_admin());
create policy admin_all_assignments on public.case_assignments for select using (public.is_admin());
create policy admin_all_status_history on public.case_status_history for select using (public.is_admin());
create policy admin_all_verifications on public.case_verifications for select using (public.is_admin());
create policy admin_all_escalations on public.case_escalations for select using (public.is_admin());
create policy admin_all_interventions on public.case_interventions for select using (public.is_admin());
create policy admin_all_followups on public.case_followups for select using (public.is_admin());
create policy admin_all_availability on public.availability for select using (public.is_admin());
create policy admin_all_responder_locations on public.responder_locations for select using (public.is_admin());
create policy admin_all_audit_logs on public.audit_logs for select using (public.is_admin());
create policy admin_all_verification_evidence on public.verification_evidence for select using (public.is_admin());
create policy admin_all_ngo_assignments on public.ngo_professional_assignments for select using (public.is_admin());

-- -----------------------------------------------------------
-- 5b. Responder case-access policies (assigned responders see cases)
-- -----------------------------------------------------------
-- Responders (PCRN/NGO/Hospital/Police) can view case_evidence for their assigned cases
create policy evidence_assigned_responder on public.case_evidence for select
  using (exists(
    select 1 from case_assignments ca
    where ca.case_id = case_evidence.case_id
      and ca.responder_id = auth.uid()
      and ca.status = 'ACCEPTED'
  ));

-- Responders can view case_assistance for their assigned cases
create policy assistance_assigned_responder on public.case_assistance for select
  using (exists(
    select 1 from case_assignments ca
    where ca.case_id = case_assistance.case_id
      and ca.responder_id = auth.uid()
      and ca.status = 'ACCEPTED'
  ));

-- Responders can view case_status_history for their assigned cases
create policy history_assigned_responder on public.case_status_history for select
  using (exists(
    select 1 from case_assignments ca
    where ca.case_id = case_status_history.case_id
      and ca.responder_id = auth.uid()
      and ca.status = 'ACCEPTED'
  ));

-- Responders can view case_verifications for their assigned cases
create policy verifications_assigned_responder on public.case_verifications for select
  using (exists(
    select 1 from case_assignments ca
    where ca.case_id = case_verifications.case_id
      and ca.responder_id = auth.uid()
      and ca.status = 'ACCEPTED'
  ));

-- L2 can see escalations they are handling or open ones
create policy escalations_l2 on public.case_escalations for select
  using (
    handled_by = auth.uid()
    or (status = 'OPEN' and exists(
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'pcrn_l2'
        and ur.is_active = true
        and ur.approval_status = 'APPROVED'
    ))
  );

-- L2 can update escalations
create policy escalations_l2_update on public.case_escalations for update
  using (
    handled_by = auth.uid()
    or (status = 'OPEN' and exists(
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'pcrn_l2'
        and ur.is_active = true
        and ur.approval_status = 'APPROVED'
    ))
  );

-- -----------------------------------------------------------
-- 6. Emergency flag column on cases
-- -----------------------------------------------------------
alter table public.cases
  add column if not exists cannot_call_emergency boolean not null default false;

-- -----------------------------------------------------------
-- 7. Realtime publications for new tables
-- -----------------------------------------------------------
do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='verification_evidence') then
    alter publication supabase_realtime add table public.verification_evidence;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='case_escalations') then
    alter publication supabase_realtime add table public.case_escalations;
  end if;
end $$;

-- -----------------------------------------------------------
-- 8. Indexes for analytics performance
-- -----------------------------------------------------------
create index if not exists cases_lat_lon_idx on public.cases(latitude, longitude);
create index if not exists cases_created_at_idx on public.cases(created_at);
create index if not exists case_interventions_case_idx on public.case_interventions(case_id);
create index if not exists case_verifications_case_idx on public.case_verifications(case_id);
create index if not exists verification_evidence_case_idx on public.verification_evidence(case_id);
create index if not exists ngo_professional_case_idx on public.ngo_professional_assignments(case_id);
create index if not exists case_escalations_status_idx on public.case_escalations(status);
