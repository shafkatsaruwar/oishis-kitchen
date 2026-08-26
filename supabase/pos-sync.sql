-- Shared register state across the iPad and the web — 2026-08-25
--
-- The register runs on two devices and neither knew what the other did.
-- Favourites were localStorage on the web and @AppStorage on iOS, so starring
-- a dish on the iPad left the web unstarred. The QR screenshots had to be
-- uploaded once per device. The open ticket lived only in the device that rang
-- it, so a sale started on the iPad could not be charged on the web.
--
-- Category order and icons already sync: both apps read category_order and
-- category_icon off menu_items and sort by them. Nothing is needed here.
--
-- Depends on public.is_admin() from rls-lockdown.sql.
-- Run in the Supabase SQL editor. Safe to run twice.

-- ------------------------------------------------------------ favourites ----
-- The high-runners you tap all day. Cascade: a deleted dish takes its star
-- with it rather than leaving an id nothing can resolve.
create table if not exists public.pos_favorites (
  menu_item_id uuid primary key references public.menu_items(id) on delete cascade,
  created_at   timestamptz not null default now()
);

-- -------------------------------------------------------------- settings ----
-- Key/value for register settings that are not per-device: today the Venmo and
-- Zelle QR screenshots, as data URLs.
create table if not exists public.pos_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------ open ticket ----
-- One register, one ticket in progress. A fixed row rather than a table of
-- tickets, so both devices upsert the same id and neither has to discover the
-- other's. Last write wins, and updated_by lets a device ignore its own echo.
create table if not exists public.pos_tickets (
  id            uuid primary key,
  lines         jsonb not null default '[]'::jsonb,
  customer_name text,
  updated_at    timestamptz not null default now(),
  updated_by    text
);

insert into public.pos_tickets (id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- ------------------------------------------------------------------- RLS ----
-- Register state is admin-only, same as grocery_items.
alter table public.pos_favorites enable row level security;
alter table public.pos_settings  enable row level security;
alter table public.pos_tickets   enable row level security;

do $$
declare t text;
begin
  foreach t in array array['pos_favorites', 'pos_settings', 'pos_tickets'] loop
    if not exists (
      select from pg_policies
      where schemaname = 'public' and tablename = t and policyname = t || ': admin only'
    ) then
      execute format(
        'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
        t || ': admin only', t
      );
    end if;
  end loop;
end $$;

-- -------------------------------------------------------------- realtime ----
-- The open ticket has to reach the other device without waiting for a poll.
do $$
begin
  if not exists (
    select from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pos_tickets'
  ) then
    execute 'alter publication supabase_realtime add table public.pos_tickets';
  end if;
end $$;
