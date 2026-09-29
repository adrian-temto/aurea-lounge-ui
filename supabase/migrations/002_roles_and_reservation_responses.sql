-- ============ Auréa: roles & permissions, reservation responses ============
-- Replaces profiles.is_admin with a role table that users can read but never write,
-- and lets staff attach a response to a reservation.
begin;

-- ---------- 1. Roles and permissions ----------
create type public.app_role as enum ('admin', 'staff');
create type public.app_permission as enum ('menu.manage', 'reservations.manage');

create table public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.role_permissions (
  id bigint generated always as identity primary key,
  role public.app_role not null,
  permission public.app_permission not null,
  unique (role, permission)
);

insert into public.role_permissions (role, permission) values
  ('admin', 'menu.manage'),
  ('admin', 'reservations.manage'),
  ('staff', 'reservations.manage');

alter table public.user_roles       enable row level security;
alter table public.role_permissions enable row level security;

-- Read-only through the API. Roles are granted in the SQL editor (or a future owner-only tool).
revoke all on public.user_roles, public.role_permissions from anon, authenticated;
grant select on public.user_roles, public.role_permissions to authenticated;

create policy "Users read own roles" on public.user_roles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Signed-in users read the permission map" on public.role_permissions
  for select to authenticated using (true);

-- For RLS policies. SECURITY DEFINER so a later policy on user_roles can call it without
-- recursing; kept in the private schema, which the Data API does not expose.
create or replace function private.has_permission(requested public.app_permission)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    where ur.user_id = (select auth.uid())
      and rp.permission = requested
  );
$$;
revoke all on function private.has_permission(public.app_permission) from public;
grant execute on function private.has_permission(public.app_permission) to authenticated;

-- For the app (which tabs to show). SECURITY INVOKER: RLS limits it to the caller's own roles.
create or replace function public.my_permissions()
returns setof public.app_permission
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct rp.permission
  from public.user_roles ur
  join public.role_permissions rp on rp.role = ur.role
  where ur.user_id = (select auth.uid());
$$;
revoke all on function public.my_permissions() from public, anon;
grant execute on function public.my_permissions() to authenticated;

-- ---------- 2. Move existing admins over, then remove the boolean ----------
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from public.profiles where is_admin
on conflict do nothing;

drop policy if exists "Admin manages categories" on public.menu_categories;
drop policy if exists "Admin manages items" on public.menu_items;
drop policy if exists "Admin reads reservations" on public.reservations;
drop policy if exists "Admin updates reservations" on public.reservations;
drop policy if exists "Admin deletes reservations" on public.reservations;
drop policy if exists "Anyone can request a reservation" on public.reservations;
drop function if exists private.is_admin();
alter table public.profiles drop column is_admin;

-- ---------- 3. Menu: permission-based ----------
create policy "Menu managers manage categories" on public.menu_categories
  for all to authenticated
  using ((select private.has_permission('menu.manage')))
  with check ((select private.has_permission('menu.manage')));

create policy "Menu managers manage items" on public.menu_items
  for all to authenticated
  using ((select private.has_permission('menu.manage')))
  with check ((select private.has_permission('menu.manage')));

-- ---------- 4. Reservations: guest account link + staff response ----------
alter table public.reservations
  add column user_id uuid references auth.users(id) on delete set null,
  add column admin_response text check (char_length(admin_response) <= 2000),
  add column responded_at timestamptz,
  add column responded_by uuid references auth.users(id) on delete set null;
create index on public.reservations (user_id);

create policy "Anyone can request a reservation" on public.reservations
  for insert to anon, authenticated
  with check (
    status = 'new'
    and reservation_date >= current_date
    and admin_response is null
    and responded_at is null
    and responded_by is null
    and (user_id is null or user_id = (select auth.uid()))
  );

create policy "Guests read own reservations" on public.reservations
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Staff read reservations" on public.reservations
  for select to authenticated
  using ((select private.has_permission('reservations.manage')));

create policy "Staff update reservations" on public.reservations
  for update to authenticated
  using ((select private.has_permission('reservations.manage')))
  with check ((select private.has_permission('reservations.manage')));

create policy "Staff delete reservations" on public.reservations
  for delete to authenticated
  using ((select private.has_permission('reservations.manage')));

commit;
