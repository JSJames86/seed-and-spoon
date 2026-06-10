alter table public.volunteer_applications enable row level security;

-- Only the service role (used by server-side API routes) reads/writes this table
create policy "Service role full access"
  on public.volunteer_applications
  for all
  using (auth.role() = 'service_role');
