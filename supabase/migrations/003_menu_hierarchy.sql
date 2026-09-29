-- ============ Auréa: menu hierarchy, publishing, allergens, images ============
-- Extends the existing menu tables in place; every existing category and dish is kept.
--   * menu_categories gets parent_id (one level of subcategories) and is_published.
--   * menu_items gets is_available, allergens and image_path. is_visible stays the
--     "published" flag so nothing that reads it breaks.
--   * The public only sees published dishes in published categories (and parents).
--   * Dish photos live in the public "menu-images" bucket; only menu.manage may write.
-- Existing rows get published/available = true. Applied to the live project 2026-09-29.
begin;

-- ---------- 1. Categories: subcategories + publishing ----------
alter table public.menu_categories
  add column parent_id bigint references public.menu_categories(id) on delete cascade,
  add column is_published boolean not null default true,
  add constraint menu_categories_not_own_parent check (parent_id is distinct from id),
  add constraint menu_categories_name_length check (char_length(trim(name)) between 1 and 60);

create index menu_categories_parent_id_idx on public.menu_categories (parent_id);

-- Names were unique across the whole menu; now only among siblings, so e.g. "Iced" can sit
-- under both Coffee and Tea. Case-insensitive, and top-level names count as one group.
alter table public.menu_categories drop constraint if exists menu_categories_name_key;
create unique index menu_categories_sibling_name_key
  on public.menu_categories (coalesce(parent_id, 0), lower(trim(name)));

-- Only one level: a subcategory's parent must be top-level, and a category that has
-- subcategories can't itself become one.
create or replace function private.check_menu_category_depth()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is null then
    return new;
  end if;
  if exists (select 1 from public.menu_categories p where p.id = new.parent_id and p.parent_id is not null) then
    raise exception 'Unterkategorien können keine eigenen Unterkategorien haben.' using errcode = 'check_violation';
  end if;
  if exists (select 1 from public.menu_categories c where c.parent_id = new.id) then
    raise exception 'Eine Kategorie mit Unterkategorien kann keine Unterkategorie werden.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger menu_categories_depth
  before insert or update of parent_id on public.menu_categories
  for each row execute function private.check_menu_category_depth();

-- ---------- 2. Dishes: availability, allergens, image ----------
alter table public.menu_items
  add column is_available boolean not null default true,
  -- The 14 EU allergens (LMIV Annex II), stored as stable keys; labels live in the app.
  add column allergens text[] not null default '{}',
  add column image_path text,
  add constraint menu_items_allergens_known check (
    allergens <@ array[
      'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soy', 'milk',
      'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs'
    ]::text[]
  ),
  add constraint menu_items_image_path_format check (
    image_path is null or image_path ~ '^items/[0-9a-f-]{36}\.(jpg|png|webp)$'
  ),
  add constraint menu_items_price_range check (price >= 0 and price < 10000);

-- menu_items.category_id already cascades on delete (the dashboard warns first); index it.
create index if not exists menu_items_category_id_idx on public.menu_items (category_id);

-- ---------- 3. Public read access: published only ----------
-- SECURITY DEFINER so the policy can look at the parent row without recursing into
-- menu_categories' own policy.
create or replace function private.menu_category_is_public(category bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.menu_categories c
    left join public.menu_categories p on p.id = c.parent_id
    where c.id = category
      and c.is_published
      and (c.parent_id is null or p.is_published)
  );
$$;
revoke all on function private.menu_category_is_public(bigint) from public;
grant execute on function private.menu_category_is_public(bigint) to anon, authenticated;

-- The original read-everything policies; the menu.manage "for all" policies from 002 stay.
drop policy if exists "Anyone reads categories" on public.menu_categories;
drop policy if exists "Anyone reads visible items" on public.menu_items;

create policy "Public reads published categories" on public.menu_categories
  for select to anon, authenticated
  using (private.menu_category_is_public(id));

create policy "Public reads published dishes" on public.menu_items
  for select to anon, authenticated
  using (is_visible and private.menu_category_is_public(category_id));

-- ---------- 4. Dish photos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets serve files by URL without a SELECT policy; writes need menu.manage.
-- Storage also checks SELECT before deleting or replacing, so managers get that too.
create policy "Menu managers list dish photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'menu-images' and (select private.has_permission('menu.manage')));

create policy "Menu managers upload dish photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'menu-images' and (select private.has_permission('menu.manage')));

create policy "Menu managers replace dish photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'menu-images' and (select private.has_permission('menu.manage')))
  with check (bucket_id = 'menu-images' and (select private.has_permission('menu.manage')));

create policy "Menu managers delete dish photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'menu-images' and (select private.has_permission('menu.manage')));

commit;
