create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  first_name  text,
  segment     text not null default 'general',
  source      text not null default 'website',
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz,
  constraint subscribers_email_unique unique (email)
);

alter table public.subscribers enable row level security;

-- Only service role can read/write subscribers
create policy "Service role full access"
  on public.subscribers
  for all
  using (auth.role() = 'service_role');
