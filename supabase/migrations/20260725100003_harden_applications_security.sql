-- applications is written only via the service-role client in
-- app/api/applications and the (forthcoming) admin decision route --
-- never directly from anon/authenticated Supabase clients. Revoke the
-- default grants so RLS's service-role-only policy is the only path in,
-- matching the pattern in harden_community_partners_security.
REVOKE ALL ON public.applications FROM anon, authenticated;
