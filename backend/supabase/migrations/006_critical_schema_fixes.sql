-- ============================================================
-- Migration 006: Critical schema fixes
-- 1. user_roles: add UNIQUE(user_id, role) for upsert support
-- 2. profiles: add consent and avatar columns
-- 3. responder_profiles: add L1/L2 registration columns
-- 4. organizations: add full organization detail columns
-- ============================================================

-- -----------------------------------------------------------
-- 1. user_roles: composite unique constraint for upsert
-- -----------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_roles_user_id_role_key'
  ) then
    alter table user_roles add constraint user_roles_user_id_role_key unique (user_id, role);
  end if;
end $$;

-- -----------------------------------------------------------
-- 2. profiles: consent and avatar columns
-- -----------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'consent_terms'
  ) then
    alter table profiles add column consent_terms boolean not null default false;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'consent_reporting'
  ) then
    alter table profiles add column consent_reporting boolean not null default false;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'avatar_url'
  ) then
    alter table profiles add column avatar_url text;
  end if;
end $$;

-- -----------------------------------------------------------
-- 3. responder_profiles: L1/L2 registration columns
-- -----------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'id_type'
  ) then
    alter table responder_profiles add column id_type text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'id_number'
  ) then
    alter table responder_profiles add column id_number text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'motivation'
  ) then
    alter table responder_profiles add column motivation text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'availability'
  ) then
    alter table responder_profiles add column availability jsonb default '[]'::jsonb;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'emergency_contact_name'
  ) then
    alter table responder_profiles add column emergency_contact_name text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'emergency_contact_relationship'
  ) then
    alter table responder_profiles add column emergency_contact_relationship text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'emergency_contact_phone'
  ) then
    alter table responder_profiles add column emergency_contact_phone text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'skills'
  ) then
    alter table responder_profiles add column skills jsonb default '[]'::jsonb;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'has_training'
  ) then
    alter table responder_profiles add column has_training boolean default false;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'training_areas'
  ) then
    alter table responder_profiles add column training_areas jsonb default '[]'::jsonb;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'certification_name'
  ) then
    alter table responder_profiles add column certification_name text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'certification_org'
  ) then
    alter table responder_profiles add column certification_org text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'certification_date'
  ) then
    alter table responder_profiles add column certification_date text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'responder_profiles' and column_name = 'assessment_score'
  ) then
    alter table responder_profiles add column assessment_score numeric(5,2);
  end if;
end $$;

-- -----------------------------------------------------------
-- 4. organizations: full organization detail columns
-- -----------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'address'
  ) then
    alter table organizations add column address text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'state_district'
  ) then
    alter table organizations add column state_district text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'pin_code'
  ) then
    alter table organizations add column pin_code text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'website'
  ) then
    alter table organizations add column website text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'official_email'
  ) then
    alter table organizations add column official_email text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'official_contact'
  ) then
    alter table organizations add column official_contact text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'legal_details'
  ) then
    alter table organizations add column legal_details jsonb default '{}'::jsonb;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'authorized_rep_name'
  ) then
    alter table organizations add column authorized_rep_name text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'authorized_rep_designation'
  ) then
    alter table organizations add column authorized_rep_designation text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'authorized_rep_email'
  ) then
    alter table organizations add column authorized_rep_email text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'authorized_rep_phone'
  ) then
    alter table organizations add column authorized_rep_phone text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'authorized_rep_id'
  ) then
    alter table organizations add column authorized_rep_id text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'case_capabilities'
  ) then
    alter table organizations add column case_capabilities jsonb default '[]'::jsonb;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'response_availability'
  ) then
    alter table organizations add column response_availability text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'max_response_radius'
  ) then
    alter table organizations add column max_response_radius text;
  end if;
end $$;
