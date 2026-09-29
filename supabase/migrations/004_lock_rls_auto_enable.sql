-- ============ Auréa: stop exposing rls_auto_enable() through the API ============
-- public.rls_auto_enable() backs the "ensure_rls" event trigger, which switches on row level
-- security for every new table in public. It only works as an event trigger, but as a
-- SECURITY DEFINER function in the public schema it was listed as /rest/v1/rpc/rls_auto_enable
-- for anon and signed-in users (Supabase advisor 0028/0029). The trigger keeps working:
-- event triggers don't need EXECUTE for the roles that run DDL.
-- Applied to the live project 2026-09-29.
begin;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

commit;
