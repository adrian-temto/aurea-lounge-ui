-- ============ Auréa: base schema ============
-- The tables the site started with, before roles (002), menu hierarchy (003) and the rest.
-- This file was missing from the repository (the first project was set up in the Lovable /
-- Supabase editors), so a new project could not be built from migrations alone. It recreates
-- that starting point; 002 onwards then turn it into the current schema.
begin;

-- ---------- 0. Private schema ----------
-- Helper functions live here, out of reach of the Data API (which only exposes "public"), but
-- usable from RLS policies.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ---------- 1. Profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

-- A profile row for every new account.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Replaced by the role tables in 002.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- ---------- 2. Menu ----------
create table public.menu_categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(8, 2) not null check (price >= 0),
  tag text check (tag in ('V', 'VG')),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;

create policy "Anyone reads categories" on public.menu_categories
  for select to anon, authenticated using (true);
create policy "Admin manages categories" on public.menu_categories
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Anyone reads visible items" on public.menu_items
  for select to anon, authenticated using (is_visible);
create policy "Admin manages items" on public.menu_items
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ---------- 3. Reservations ----------
create table public.reservations (
  id bigint generated always as identity primary key,
  name text not null check (char_length(trim(name)) between 1 and 100),
  phone text not null check (char_length(phone) between 5 and 40),
  reservation_date date not null,
  reservation_time time not null,
  guests integer not null check (guests between 1 and 50),
  special_requests text check (char_length(special_requests) <= 1000),
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);
create index reservations_date_idx on public.reservations (reservation_date, reservation_time);
alter table public.reservations enable row level security;

create policy "Anyone can request a reservation" on public.reservations
  for insert to anon, authenticated
  with check (status = 'new' and reservation_date >= current_date);
create policy "Admin reads reservations" on public.reservations
  for select to authenticated using ((select private.is_admin()));
create policy "Admin updates reservations" on public.reservations
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admin deletes reservations" on public.reservations
  for delete to authenticated using ((select private.is_admin()));

-- New requests show up in the dashboard live (Supabase Realtime, filtered by the select policy).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reservations'
     ) then
    alter publication supabase_realtime add table public.reservations;
  end if;
end
$$;

-- ---------- 4. Row level security for every future table ----------
-- 004 stops exposing this function through the API. The event trigger needs a role that may
-- create one; where that isn't allowed the function alone is enough for 004 and the app.
create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  cmd record;
begin
  for cmd in
    select * from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name = 'public' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
      exception when others then
        raise log 'rls_auto_enable: failed for %', cmd.object_identity;
      end;
    end if;
  end loop;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_event_trigger where evtname = 'ensure_rls') then
    create event trigger ensure_rls on ddl_command_end
      when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      execute function public.rls_auto_enable();
  end if;
exception when insufficient_privilege then
  raise notice 'ensure_rls event trigger skipped (insufficient privilege)';
end
$$;

commit;
