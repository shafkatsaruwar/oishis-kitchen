-- =============================================================================
-- RLS for event_requests — 2026-11-24
--
-- Supabase flagged rls_disabled_in_public on this project. event_requests was
-- never covered by rls-lockdown.sql, so the anon key shipped in the public web
-- bundle could read, edit and delete every catering request — names, phone
-- numbers and emails included.
--
-- After this:
--   anyone may INSERT a request   (the Book Event form)
--   only the admin may read, update or delete
--
-- Run in the Supabase SQL editor. Safe to run twice.
-- =============================================================================

alter table public.event_requests enable row level security;

drop policy if exists "event_requests: public insert" on public.event_requests;
drop policy if exists "event_requests: admin all" on public.event_requests;

create policy "event_requests: public insert"
  on public.event_requests for insert
  with check (true);

create policy "event_requests: admin all"
  on public.event_requests for all
  using (public.is_admin())
  with check (public.is_admin());

-- Anything else still exposed? This should return no rows once you're done.
select tablename
  from pg_tables
 where schemaname = 'public'
   and rowsecurity = false;
