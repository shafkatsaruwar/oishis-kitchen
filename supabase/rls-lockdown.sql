-- =============================================================================
-- RLS lockdown — 2026-08-17
--
-- Before this: the anon key (shipped in the public web bundle and the iOS app)
-- could UPDATE and DELETE every row in every table. Anyone could mark orders
-- paid, change totals, delete orders, or rewrite the menu.
--
-- After this:
--   WRITES  -> only the authenticated admin (checked by email in the JWT)
--   READS   -> public where the site needs them (menu, order tracking, reviews)
--   Exceptions kept for the site to function:
--     - anyone may INSERT an order        (the checkout)
--     - anyone may INSERT a review, but ONLY with status 'pending'
--       (nobody can self-approve a review anymore)
--   grocery_items and ingredients are fully private to the admin.
--
-- The web admin already signs in with Supabase Auth, so it keeps working
-- unchanged. The iOS app gains a sign-in screen in the same build as this.
-- =============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'mohammedshafkatsaruwar@gmail.com'
$$;

-- Drop every existing policy on the tables we're locking down, then rebuild.
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('orders', 'menu_items', 'reviews', 'grocery_items', 'ingredients')
  loop
    execute format('drop policy %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------- orders ----
alter table public.orders enable row level security;

create policy "orders: public read"
  on public.orders for select
  using (true);

create policy "orders: public insert"           -- the checkout
  on public.orders for insert
  with check (true);

create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders: admin delete"
  on public.orders for delete
  using (public.is_admin());

-- ------------------------------------------------------------ menu_items ----
alter table public.menu_items enable row level security;

create policy "menu: public read"
  on public.menu_items for select
  using (true);

create policy "menu: admin write"
  on public.menu_items for insert
  with check (public.is_admin());

create policy "menu: admin update"
  on public.menu_items for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "menu: admin delete"
  on public.menu_items for delete
  using (public.is_admin());

-- --------------------------------------------------------------- reviews ----
alter table public.reviews enable row level security;

create policy "reviews: public read"
  on public.reviews for select
  using (true);

create policy "reviews: public submit, pending only"
  on public.reviews for insert
  with check (public.is_admin() or status = 'pending');

create policy "reviews: admin update"
  on public.reviews for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "reviews: admin delete"
  on public.reviews for delete
  using (public.is_admin());

-- --------------------------------------------------------- grocery_items ----
alter table public.grocery_items enable row level security;

create policy "grocery: admin only"
  on public.grocery_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------- ingredients ----
-- Skipped automatically if the table doesn't exist yet.
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'ingredients') then
    execute 'alter table public.ingredients enable row level security';
    execute $q$create policy "ingredients: admin only"
      on public.ingredients for all
      using (public.is_admin())
      with check (public.is_admin())$q$;
  end if;
end $$;
