-- ============================================================
-- MIGRATION 004: Chat messages, NGO areas, training, credentials
-- ============================================================

-- 1. Per-case coordination chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  role text not null check(role in ('system','citizen','coordinator','pcrn_l1','pcrn_l2','pcrn_l3','ngo')),
  text text not null,
  created_at timestamptz not null default now()
);
create index chat_case_idx on public.chat_messages(case_id, created_at desc);
alter table public.chat_messages enable row level security;

-- Case participants can read chat; sender can insert
create policy chat_read on public.chat_messages for select using (
  exists(select 1 from cases c where c.id=case_id and c.reported_by=auth.uid())
  or exists(select 1 from case_assignments a where a.case_id=chat_messages.case_id and a.responder_id=auth.uid())
  or exists(select 1 from case_escalations e where e.case_id=chat_messages.case_id and e.handled_by=auth.uid())
);
create policy chat_insert on public.chat_messages for insert with check (
  sender_id=auth.uid()
  and exists(select 1 from cases c where c.id=case_id and c.reported_by=auth.uid())
  or exists(select 1 from case_assignments a where a.case_id=chat_messages.case_id and a.responder_id=auth.uid())
);

-- 2. NGO areas served
create table public.ngo_areas_served (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  area_name text not null,
  created_at timestamptz not null default now(),
  unique(organization_id, area_name)
);
alter table public.ngo_areas_served enable row level security;
create policy ngo_areas_read on public.ngo_areas_served for select using (
  exists(select 1 from organizations o where o.id=organization_id and o.approval_status='APPROVED')
);

-- 3. Training modules (for L2 responders)
create table public.training_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  role_filter text not null default 'pcrn_l2',
  created_at timestamptz not null default now()
);
alter table public.training_modules enable row level security;
create policy training_read on public.training_modules for select using (true);

-- User training progress
create table public.user_training_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.training_modules(id) on delete cascade,
  status text not null default 'pending' check(status in ('pending','in_progress','completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key(user_id, module_id)
);
alter table public.user_training_progress enable row level security;
create policy training_progress_self on public.user_training_progress for all using(user_id=auth.uid()) with check(user_id=auth.uid());

-- 4. User credentials / recognition
create table public.user_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credential_type text not null,
  title text not null,
  note text,
  tone text not null default 'info' check(tone in ('info','pending','verified','resolved','muted','emergency')),
  status text not null default 'active' check(status in ('active','pending','expired')),
  created_at timestamptz not null default now()
);
create index credentials_user_idx on public.user_credentials(user_id);
alter table public.user_credentials enable row level security;
create policy credentials_self on public.user_credentials for all using(user_id=auth.uid()) with check(user_id=auth.uid());

-- 5. Enable realtime on chat_messages
do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_messages') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;
