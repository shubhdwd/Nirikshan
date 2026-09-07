-- ============================================================
-- Migration 008: Add pcrn_l3 role
--
-- The Level 3 (Professional) role is used throughout the backend
-- (auth.ts Role type, requireRole guards) and frontend, but it is
-- missing from the app_role enum. Without it, assigning pcrn_l3 to
-- a user via user_roles fails with an invalid enum value.
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumtypid = 'public.app_role'::regtype
      and enumlabel = 'pcrn_l3'
  ) then
    alter type public.app_role add value if not exists 'pcrn_l3' after 'pcrn_l2';
  end if;
end $$;
