-- ============ Auréa: double opt-in for offers by email ============
-- Ticking "offers by email" in the booking form is not consent yet: the guest gets an email with
-- a link and only confirming there sets marketing_email_confirmed_at (the proof of consent).
--   * The token is made here, by a trigger, never by the client: whoever inserts a row can't
--     know it (guests have no SELECT), so nobody can confirm for someone else's address.
--   * The app reads it with the server-only secret key to send the email.
--   * confirm_marketing_email(token) is callable by anyone holding the token, within 30 days.
begin;

alter table public.reservations
  add column marketing_email_confirmed_at timestamptz,
  add column marketing_token uuid unique;

create or replace function private.set_marketing_token()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.marketing_token := case when new.marketing_email then gen_random_uuid() end;
  new.marketing_email_confirmed_at := null;
  return new;
end;
$$;

create trigger reservations_marketing_token
  before insert on public.reservations
  for each row execute function private.set_marketing_token();

-- SECURITY DEFINER: guests can't update reservations; the unguessable token is the permission.
create or replace function public.confirm_marketing_email(p_token uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with done as (
    update public.reservations
    set marketing_email_confirmed_at = now(),
        marketing_token = null
    where marketing_token = p_token
      and marketing_email
      and marketing_email_confirmed_at is null
      and created_at > now() - interval '30 days'
    returning 1
  )
  select exists (select 1 from done);
$$;
revoke all on function public.confirm_marketing_email(uuid) from public;
grant execute on function public.confirm_marketing_email(uuid) to anon, authenticated;

-- Retention also clears the opt-in and its token.
create or replace function private.anonymize_old_reservations()
returns integer
language sql
security definer
set search_path = ''
as $$
  with done as (
    update public.reservations
    set name = 'Anonymisiert',
        phone = null,
        email = null,
        special_requests = null,
        admin_response = null,
        responded_by = null,
        terms_accepted_at = null,
        marketing_email = false,
        marketing_sms = false,
        marketing_email_confirmed_at = null,
        marketing_token = null,
        anonymized_at = now()
    where anonymized_at is null
      and reservation_date < current_date - interval '2 years'
    returning 1
  )
  select count(*)::integer from done;
$$;
revoke all on function private.anonymize_old_reservations() from public, anon, authenticated;

commit;
