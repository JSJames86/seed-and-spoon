-- crm_user_roles has 0 rows -- it's a dead/unused RBAC table. The "staff can
-- manage contacts" policy from the previous migration (using crm_user_roles)
-- and the pre-existing "admin and board can view all donations" policy on
-- donations both reference it, so neither policy can ever match anyone --
-- staff/board currently cannot view all donations, and nobody can manage
-- contacts via RLS. The active RBAC system is role_assignments/roles via
-- has_role()/is_staff(), used throughout households/programs/case_notes/etc.
-- Switch both policies to that system.

drop policy "staff can manage contacts" on public.contacts;
create policy "staff can manage contacts"
  on public.contacts
  for all
  using (is_staff())
  with check (is_staff());

drop policy "admin and board can view all donations" on public.donations;
create policy "admin and board can view all donations"
  on public.donations
  for select
  using (is_staff() or has_role('board_member'));
