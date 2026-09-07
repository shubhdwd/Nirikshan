-- ============================================================
-- Migration 007: Fix user_roles primary key
--
-- Problem: user_roles has user_id as sole PK, so each user can
-- only ever have ONE role. Registration tries to insert both
-- 'citizen' AND 'pcrn_l1' rows when L1 opt-in is selected,
-- causing a PK violation that crashes account creation.
--
-- Fix: Replace the single-column PK with a composite PK on
-- (user_id, role) so a user can hold multiple roles.
-- ============================================================

-- Step 1: Drop the existing single-column PK
alter table public.user_roles drop constraint user_roles_pkey;

-- Step 2: Drop the redundant unique constraint added in migration 006
-- (it was added to work around the PK issue but the PK itself was the problem)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'user_roles_user_id_role_key'
  ) then
    alter table public.user_roles drop constraint user_roles_user_id_role_key;
  end if;
end $$;

-- Step 3: Add composite PK on (user_id, role)
alter table public.user_roles add primary key (user_id, role);
