-- "Staff can manage contacts" was scoped to {authenticated} with
-- USING/CHECK(true), giving ANY logged-in user (donor, volunteer, etc.) full
-- CRUD on the contacts table (names, emails, phone numbers, addresses, notes
-- for organizational contacts). Restrict to actual staff, matching the
-- admin/board/staff check already used by donations' "admin and board can
-- view all donations" policy.
drop policy "Staff can manage contacts" on public.contacts;

create policy "staff can manage contacts"
  on public.contacts
  for all
  using (exists (
    select 1 from public.crm_user_roles r
    where r.user_id = auth.uid()
      and r.role = any (array['admin','board','staff']::public.crm_role[])
  ))
  with check (exists (
    select 1 from public.crm_user_roles r
    where r.user_id = auth.uid()
      and r.role = any (array['admin','board','staff']::public.crm_role[])
  ));
