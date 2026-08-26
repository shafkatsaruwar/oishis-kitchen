-- A to-do list for the kitchen — 2026-08-25
--
-- Deliberately thin: a line of text and a date it is due by. No assignees, no
-- notes, no priorities, no subtasks — one person runs this kitchen and a list
-- that needs filling in is a list that stops getting used.
--
-- due_date is a date, not a timestamp: "Thursday" is the unit a kitchen works
-- in, and a time of day would be a field to fill in for no gain. Null means no
-- deadline, which sorts last.
--
-- Depends on public.is_admin() from rls-lockdown.sql.
-- Run in the Supabase SQL editor. Safe to run twice.

create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  due_date   date,
  is_done    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

do $$
begin
  if not exists (
    select from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks: admin only'
  ) then
    execute 'create policy "tasks: admin only" on public.tasks for all
             using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;
