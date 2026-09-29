-- ============ Auréa: guest email and consents on reservations ============
-- Guests can book without an account, so the request carries an email address. The booking
-- form also records acceptance of the terms and the optional marketing opt-ins.
-- NULL email / terms_accepted_at: requests made before this migration.
-- NOT yet applied to the live project.
begin;

alter table public.reservations
  add column email text check (email is null or char_length(email) between 3 and 254),
  add column terms_accepted_at timestamptz,
  add column marketing_email boolean not null default false,
  add column marketing_sms boolean not null default false;

commit;
