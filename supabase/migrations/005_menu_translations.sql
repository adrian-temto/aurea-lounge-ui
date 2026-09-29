-- ============ Auréa: English menu texts ============
-- Optional English versions of category/subcategory names and dish names/descriptions.
-- NULL means "not translated yet": the English site then shows the German text.
-- Prices, photos, availability and allergens stay shared between languages.
-- Applied to the live project 2026-09-29.
begin;

alter table public.menu_categories
  add column name_en text check (name_en is null or char_length(trim(name_en)) between 1 and 60);

alter table public.menu_items
  add column name_en text check (name_en is null or char_length(trim(name_en)) between 1 and 120),
  add column description_en text check (description_en is null or char_length(description_en) <= 300);

commit;
