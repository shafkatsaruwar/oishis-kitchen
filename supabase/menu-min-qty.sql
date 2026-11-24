-- Every dish starts at 8 — 2026-11-24
--
-- The web admin already saves new dishes with min_qty 8, but a dish saved any
-- other way got no minimum, and the cart then started it at 1. Make 8 the
-- column default and fill in dishes that have none. Whole-tray dishes
-- ("Jorda (Half Tray)") sell one at a time, so they get 1.
--
-- Run in the Supabase SQL editor. Safe to run twice.

alter table public.menu_items
  alter column min_qty set default 8;

update public.menu_items
   set min_qty = case when name ilike '%tray%' then 1 else 8 end
 where min_qty is null;
