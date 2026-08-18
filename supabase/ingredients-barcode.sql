-- Barcode learning for pantry ingredients — 2026-08-17
--
-- Desi products (radhuni moshla, moong daal, ginger paste) aren't in public
-- barcode databases, so the app learns them: the first scan of an unknown code
-- asks what it is, saves the mapping here, and every later scan of that code
-- goes straight to the right ingredient.
--
-- Run in the Supabase SQL editor. Safe to run twice.

alter table public.ingredients
  add column if not exists barcode text;

-- One ingredient per barcode, but plenty of ingredients with no barcode at all.
create unique index if not exists ingredients_barcode_key
  on public.ingredients (barcode)
  where barcode is not null;
