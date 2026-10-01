-- ============ Auréa: super admin (owner) ============
-- Two roles from now on: 'owner' (the one super admin) and 'admin'. The 'staff' (Team) role is
-- removed; anyone who had it becomes an admin, so nobody is locked out, and the owner can remove
-- them in the dashboard afterwards.
--
-- The owner creates admin accounts in the dashboard (Team): the new admin gets an email with a
-- temporary password and chooses their own at the first sign-in. Creating and removing accounts
-- happens on the server with the secret key, after the app checked that the caller is the owner.
--
-- AFTER running this, make the owner (their account must exist; replace the email):
--   insert into public.user_roles (user_id, role)
--   select id, 'owner' from auth.users where email = 'owner@example.com';
begin;

-- ---------- 1. Roles: drop 'staff', add 'owner' ----------
insert into public.user_roles (user_id, role)
select user_id, 'admin' from public.user_roles where role = 'staff'
on conflict (user_id, role) do nothing;
delete from public.user_roles where role = 'staff';
delete from public.role_permissions where role = 'staff';

-- An enum value can't be dropped, so the type is rebuilt. No policy or function signature uses it.
alter type public.app_role rename to app_role_old;
create type public.app_role as enum ('owner', 'admin');
alter table public.user_roles
  alter column role type public.app_role using role::text::public.app_role;
alter table public.role_permissions
  alter column role type public.app_role using role::text::public.app_role;
drop type public.app_role_old;

insert into public.role_permissions (role, permission) values
  ('owner', 'menu.manage'),
  ('owner', 'reservations.manage');

-- There is only ever one super admin.
create unique index user_roles_single_owner on public.user_roles (role) where role = 'owner';

commit;
