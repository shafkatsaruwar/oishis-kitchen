-- Where an order came from — 2026-10-14
--
-- Counter sales and website orders live in the same table and were told apart
-- only by customer_name being the literal string "Walk-in". That is a string
-- two registers happen to write, not a fact about the order: take a walk-in
-- from someone who gives their name and it silently files as an online order.
--
-- 'pos'    — rung up at the register, done the moment it is taken
-- 'online' — website checkout, phone order, monthly plan: anything that joins
--            the queue and needs preparing
--
-- Nullable on purpose. An app still running an older build writes no source at
-- all, and both readers fall back to the old name check for those rows, so the
-- split stays right through the transition rather than filing every sale from
-- an un-updated iPad as online.
--
-- Run in the Supabase SQL editor. Safe to run twice.

alter table public.orders
  add column if not exists source text;

-- Backfill history by the rule that was implicit until now.
update public.orders
   set source = case when customer_name = 'Walk-in' then 'pos' else 'online' end
 where source is null;

create index if not exists orders_source_idx on public.orders (source);
