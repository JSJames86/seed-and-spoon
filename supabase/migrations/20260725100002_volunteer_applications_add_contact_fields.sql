-- Additive, backward compatible: existing rows and the admin
-- approve/status view (app/api/admin/volunteers) keep working off `name`.
-- POST /api/volunteer also populates these discrete fields.
alter table public.volunteer_applications
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text;

-- app/api/email/volunteer (the old route) always supplied `availability`,
-- which suggests it may be NOT NULL. POST /api/volunteer doesn't collect it.
-- Safe either way: a no-op if the column is already nullable.
alter table public.volunteer_applications
  alter column availability drop not null;
