-- Team notification triggers.
--
-- Fires an internal "heads up" alert to app/api/notify whenever a new
-- volunteer or program signup lands in Supabase. Run this once in the
-- Supabase SQL editor (not part of the numbered migration chain -- it's a
-- one-time wiring step, same as the Dashboard-webhook alternative in the
-- setup notes).
--
-- Donations are intentionally NOT wired here. `donations` already gets a
-- staff alert from app code (app/api/donations/webhook/route.js and
-- app/api/email/donate/route.ts) -- adding this trigger too would send the
-- team two emails per donation.
--
-- Before running: replace the URL and secret below.
--   url    -> your deployed backend's /api/notify endpoint
--   secret -> must match the NOTIFY_SECRET env var on that deployment

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_team_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://REPLACE-WITH-YOUR-DOMAIN.org/api/notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-notify-secret', 'REPLACE-WITH-YOUR-NOTIFY_SECRET'
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', to_jsonb(NEW)
    )
  );
  return NEW;
end;
$$;

-- New volunteer signup (public interest form -- app/api/volunteer)
drop trigger if exists trg_notify_volunteer_signup on public.volunteer_applications;
create trigger trg_notify_volunteer_signup
  after insert on public.volunteer_applications
  for each row execute function public.notify_team_alert();

-- New program signup (5 Loaves intake -- app/api/applications)
drop trigger if exists trg_notify_program_signup on public.applications;
create trigger trg_notify_program_signup
  after insert on public.applications
  for each row execute function public.notify_team_alert();
