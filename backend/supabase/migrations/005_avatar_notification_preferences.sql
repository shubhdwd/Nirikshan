-- ============================================================
-- Migration 005: Missing features — avatar, notifications, search
-- 1. profiles.avatar_url column
-- 2. notification_preferences table
-- 3. training_modules.content, duration_minutes columns
-- ============================================================

-- -----------------------------------------------------------
-- 1. Avatar URL on profiles
-- -----------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'avatar_url'
  ) then
    alter table profiles add column avatar_url text;
  end if;
end $$;

-- -----------------------------------------------------------
-- 2. Notification preferences table
-- -----------------------------------------------------------
create table if not exists notification_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  enabled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, type)
);

alter table notification_preferences enable row level security;

create policy "Users can view own notification preferences"
  on notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification preferences"
  on notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on notification_preferences for update
  using (auth.uid() = user_id);

create policy "Service role can manage all notification preferences"
  on notification_preferences for all
  using (auth.role() = 'service_role');

-- -----------------------------------------------------------
-- 3. Training module content & duration
-- -----------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'training_modules' and column_name = 'content'
  ) then
    alter table training_modules add column content text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'training_modules' and column_name = 'duration_minutes'
  ) then
    alter table training_modules add column duration_minutes integer default 0;
  end if;
end $$;
