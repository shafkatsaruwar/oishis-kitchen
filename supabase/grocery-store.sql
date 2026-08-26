-- Shops for the grocery list — 2026-08-25
--
-- A shopping run is several stops, not one pile: Bangla Market for the moshla,
-- Costco for the drinks, market basket for the to-go cups. The list groups on
-- this column and totals each shop separately; items with no shop collect in an
-- Unsorted group at the bottom rather than disappearing.
--
-- Null means unassigned. Blank strings are normalised to null by the apps, so
-- an empty shop never becomes a group of its own.
--
-- Run in the Supabase SQL editor. Safe to run twice.

alter table public.grocery_items
  add column if not exists store text;
