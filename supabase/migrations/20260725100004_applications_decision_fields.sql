-- decided_by is a free-text staff name ("Janelle"), per
-- app/api/admin/applications/decision's own documented body shape --
-- not an auth user id, so uuid was the wrong type. Table has no rows yet
-- (just created this session), so this is a lossless retype.
alter table public.applications
  alter column decided_by type text using decided_by::text;

alter table public.applications
  add column if not exists decision_notes text;
