-- Family intake (Get Help page) and partner referrals.
--
-- The public Get Help form now posts to /api/applications (this table already
-- backs the admin decision route and the received/decision emails). Before
-- this, the Get Help form posted to /api/intakes, whose insert never matched
-- the live `intakes` table, so nothing was ever saved.
--
-- Privacy model: we do not collect income, Social Security numbers, or
-- immigration status. Eligibility rests on a referral document (SNAP or WIC
-- letter, or a letter from a school administrator, parent advocate, or faith
-- leader). The document lives in the private `intake-referrals` bucket and is
-- deleted automatically after 30 days by /api/applications/cleanup; only the
-- referral type and the deletion timestamp stay on the row.
--
-- All changes are additive. RLS stays service-role only.

-- ── applications: intake fields ────────────────────────────────────────────
-- email stays required: Seed & Spoon documents and communicates with families
-- by email (paperless) and text.
alter table public.applications
  add column if not exists preferred_contact   text,
  add column if not exists preferred_language  text,
  add column if not exists city                text,
  add column if not exists zip                 text,
  add column if not exists essex_county        boolean,
  add column if not exists adults_in_home      integer,
  add column if not exists children            jsonb not null default '[]'::jsonb,
  add column if not exists allergens           jsonb not null default '[]'::jsonb,
  add column if not exists dietary             text[] not null default '{}',
  add column if not exists reheat_access       text,
  add column if not exists dropoff_method      text,
  add column if not exists dropoff_address     text,
  add column if not exists dropoff_unit        text,
  add column if not exists dropoff_school      text,
  add column if not exists referral_type       text,
  add column if not exists referral_doc_path   text,
  add column if not exists referral_doc_deleted_at timestamptz,
  add column if not exists referrer_name       text,
  add column if not exists referrer_org        text,
  add column if not exists referrer_contact    text,
  add column if not exists privacy_acknowledged boolean not null default false,
  add column if not exists social_reshare_consent boolean not null default false,
  add column if not exists signature_name      text,
  add column if not exists signed_at           timestamptz,
  add column if not exists source              text;

comment on column public.applications.children is
  'Array of {label, age_years, age_months, under_one, school, formula_brand, formula_type}. label is the child''s first name.';
comment on column public.applications.allergens is
  'Array of {child_label, allergen, severity (I|A|S), allergen_other_name}. Same keys as allergen_flags.';
comment on column public.applications.dropoff_method is
  'home | school | community. Home uses dropoff_address/unit; school uses dropoff_school (partner schools only); community means staff assign the nearest community location.';
comment on column public.applications.referral_doc_path is
  'Path in the private intake-referrals bucket. Nulled when the cleanup job deletes the file (referral_doc_deleted_at set).';
comment on column public.applications.social_reshare_consent is
  'Optional. Family allows Seed & Spoon to reshare posts the family made publicly about Seed & Spoon. Never required to receive help.';

-- ── family_referrals: referrals sent by a school, advocate, faith leader, etc.
create table if not exists public.family_referrals (
  id                  uuid primary key default gen_random_uuid(),
  referrer_role       text not null,
  referrer_name       text not null,
  referrer_org        text,
  referrer_email      text not null,
  referrer_phone      text,
  family_contact_name text not null,
  family_phone        text,
  children_count      integer,
  letter_path         text,
  letter_deleted_at   timestamptz,
  family_agreed       boolean not null default false,
  notes               text,
  status              text not null default 'new',
  application_id      uuid references public.applications(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.family_referrals enable row level security;

drop policy if exists "Service role full access" on public.family_referrals;
create policy "Service role full access" on public.family_referrals
  for all to service_role using (true) with check (true);

create index if not exists family_referrals_created_at_idx on public.family_referrals (created_at);
create index if not exists applications_referral_doc_idx on public.applications (created_at)
  where referral_doc_path is not null;

-- ── private bucket for referral documents ──────────────────────────────────
-- No storage.objects policies: anon/authenticated are denied by default.
-- Uploads, reads, and deletes go through service-role API routes only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'intake-referrals',
  'intake-referrals',
  false,
  4194304,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
