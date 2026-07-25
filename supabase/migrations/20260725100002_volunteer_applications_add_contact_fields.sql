-- Additive, backward compatible: existing rows and the admin
-- approve/status view (app/api/admin/volunteers) keep working off `name`.
-- POST /api/volunteer also populates these discrete fields.
-- (phone already exists live; availability is already nullable -- confirmed
-- via live schema introspection, not assumed.)
alter table public.volunteer_applications
  add column if not exists first_name text,
  add column if not exists last_name text;
