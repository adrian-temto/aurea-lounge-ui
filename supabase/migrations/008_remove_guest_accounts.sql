-- ============ Auréa: no more guest accounts ============
-- Only the team signs in (on the admin host); guests book without an account and hear back by
-- email. Removes the link between reservations and user accounts.
-- Run AFTER the app version without /account is deployed: the old version still writes user_id.
begin;

drop policy if exists "Guests read own reservations" on public.reservations;

drop policy "Anyone can request a reservation" on public.reservations;
alter table public.reservations drop column user_id;   -- also drops its index

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
  );

commit;
