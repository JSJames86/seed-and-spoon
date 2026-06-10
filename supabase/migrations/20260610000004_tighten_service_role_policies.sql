-- These policies were named "Service role..." but were scoped to PUBLIC with
-- USING/CHECK(true). anon/authenticated hold full table grants on
-- activity_logs, grants, invites, and notifications, so this let anyone with
-- the public anon key read/write/delete these tables directly via PostgREST,
-- bypassing the server-side API routes entirely. service_role bypasses RLS
-- regardless, so an explicit auth.role() = 'service_role' check is a no-op
-- for it but correctly denies anon/authenticated.

drop policy "Service role can insert activity logs" on public.activity_logs;
create policy "Service role can insert activity logs"
  on public.activity_logs
  for insert
  with check (auth.role() = 'service_role');

drop policy "Service role full access to grants" on public.grants;
create policy "Service role full access to grants"
  on public.grants
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy "Service role full access to invites" on public.invites;
create policy "Service role full access to invites"
  on public.invites
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy "Service role can insert notifications" on public.notifications;
create policy "Service role can insert notifications"
  on public.notifications
  for insert
  with check (auth.role() = 'service_role');

-- donations has no anon/authenticated grants, so these were not directly
-- exploitable, but they're still mislabeled PUBLIC/true policies flagged by
-- the linter and worth tightening for consistency/defense-in-depth.
drop policy "service role can insert donations" on public.donations;
create policy "service role can insert donations"
  on public.donations
  for insert
  with check (auth.role() = 'service_role');

drop policy "service role can update donations" on public.donations;
create policy "service role can update donations"
  on public.donations
  for update
  using (auth.role() = 'service_role');
