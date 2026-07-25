-- 5 Loaves application intake: apply -> pending review -> decision.
-- Status starts at 'received' (app/api/applications) and moves to one of
-- the four ApplicationDecision outcomes once an admin reviews it.
create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  first_name      text,
  last_name       text,
  phone           text,
  household_size  integer,
  allergies       text,
  medical_needs   text,
  notes           text,
  status          text not null default 'received'
    check (status in ('received', 'accepted', 'declined_medical', 'declined_capacity', 'waitlist')),
  decided_at      timestamptz,
  decided_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_applications_status on public.applications (status);
create index if not exists idx_applications_email on public.applications (email);

alter table public.applications enable row level security;

create policy "Service role full access"
  on public.applications
  for all
  using (auth.role() = 'service_role');
