-- Additional private bucket for PCRN verification evidence
insert into storage.buckets(id,name,public) values('verification-evidence','verification-evidence',false) on conflict(id) do update set public=false;

-- Storage RLS policies. Objects are namespaced as <user_id>/<case_id>/<uuid>.
-- Owner (uploader) can read their own objects. Case citizen can read their own case evidence. Service role bypasses RLS.
drop policy if exists case_evidence_owner_read on storage.objects;
drop policy if exists case_evidence_owner_write on storage.objects;
drop policy if exists case_evidence_citizen_read on storage.objects;
drop policy if exists verification_evidence_owner_read on storage.objects;
drop policy if exists verification_evidence_owner_write on storage.objects;

create policy case_evidence_owner_write on storage.objects for insert
  with check(bucket_id='case-evidence' and (storage.foldername(name))[1]=auth.uid()::text);
create policy case_evidence_owner_read on storage.objects for select
  using(bucket_id='case-evidence' and (owner=auth.uid() or (storage.foldername(name))[1]=auth.uid()::text));
create policy case_evidence_citizen_read on storage.objects for select
  using(bucket_id='case-evidence' and exists(
    select 1 from public.cases c
    where c.reported_by = auth.uid()
      and (storage.foldername(name))[2] = c.id::text
  ));

create policy verification_evidence_owner_write on storage.objects for insert
  with check(bucket_id='verification-evidence' and (storage.foldername(name))[1]=auth.uid()::text);
create policy verification_evidence_owner_read on storage.objects for select
  using(bucket_id='verification-evidence' and (owner=auth.uid() or (storage.foldername(name))[1]=auth.uid()::text));
