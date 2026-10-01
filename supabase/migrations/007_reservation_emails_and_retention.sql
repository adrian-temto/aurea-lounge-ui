-- ============ Auréa: reservation emails, erasure on request, 2-year retention ============
-- Additive only, so it can run before the matching app version is deployed.
--   * locale: the language the guest booked in; their emails go out in it.
--   * response_emailed_at: when the team's answer reached the guest by email (Resend).
--   * erase_guest_data(): deletes every reservation of one guest (GDPR Art. 17 requests).
--   * anonymize_old_reservations(): strips personal data 2 years after the reservation date;
--     pg_cron runs it every night. Date, time, party size and status stay for statistics.
begin;

alter table public.reservations
  add column locale text not null default 'de' check (locale in ('de', 'en')),
  add column response_emailed_at timestamptz,
  add column anonymized_at timestamptz,
  -- Anonymised rows keep no phone number.
  alter column phone drop not null;

-- Guests can't pre-fill the new bookkeeping columns.
drop policy "Anyone can request a reservation" on public.reservations;
create policy "Anyone can request a reservation" on public.reservations
  for insert to anon, authenticated
  with check (
    status = 'new'
    and reservation_date >= current_date
    and admin_response is null
    and responded_at is null
    and responded_by is null
    and response_emailed_at is null
    and anonymized_at is null
    and (user_id is null or user_id = (select auth.uid()))
  );

-- ---------- Erasure on request ----------
-- Phone numbers are compared by their national digits, so "+49 33204 634887",
-- "0049…" and "033204 634887" are the same guest.
create or replace function private.phone_key(phone text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(
    regexp_replace(
      regexp_replace(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), '^(00)?49', ''),
      '^0', ''),
    '');
$$;
revoke all on function private.phone_key(text) from public;
grant execute on function private.phone_key(text) to authenticated;

-- SECURITY INVOKER: the "Staff delete reservations" policy decides who may erase; for anyone
-- else nothing matches and the result is 0. Returns the number of deleted reservations.
create or replace function public.erase_guest_data(p_email text, p_phone text)
returns integer
language sql
security invoker
set search_path = ''
as $$
  with gone as (
    delete from public.reservations r
    where (nullif(btrim(p_email), '') is not null and lower(r.email) = lower(btrim(p_email)))
       or (char_length(coalesce(private.phone_key(p_phone), '')) >= 5
           and private.phone_key(r.phone) = private.phone_key(p_phone))
    returning 1
  )
  select count(*)::integer from gone;
$$;
revoke all on function public.erase_guest_data(text, text) from public, anon;
grant execute on function public.erase_guest_data(text, text) to authenticated;

-- ---------- Retention: anonymise after 2 years ----------
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
        anonymized_at = now()
    where anonymized_at is null
      and reservation_date < current_date - interval '2 years'
    returning 1
  )
  select count(*)::integer from done;
$$;
revoke all on function private.anonymize_old_reservations() from public, anon, authenticated;

create extension if not exists pg_cron;
-- Every night at 03:17 (UTC). Re-running this migration updates the job instead of adding one.
select cron.schedule(
  'anonymize-old-reservations',
  '17 3 * * *',
  $$select private.anonymize_old_reservations()$$
);

commit;
