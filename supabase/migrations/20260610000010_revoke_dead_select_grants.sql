-- pg_graphql_anon_table_exposed / pg_graphql_authenticated_table_exposed:
-- new tables get an implicit anon/authenticated SELECT grant from Supabase's
-- default privileges, which makes them visible in the PostgREST/GraphQL
-- schema (/rest/v1/<table>, GraphQL introspection) even when RLS denies
-- every row to that role. Revoke the grants that serve no functional
-- purpose, scoped per-role based on what each table's RLS policies actually
-- evaluate to.

-- 1) Tables with NO select/all policy (RLS default-denies everyone) or whose
-- only policy is `auth.role() = 'service_role'` (never true for anon/
-- authenticated PostgREST requests, which present as 'anon'/'authenticated').
-- All access to these is server-side via the service-role key, which
-- bypasses RLS and isn't affected by these grants.
revoke select on public.affiliates from anon, authenticated;
revoke select on public.career_applications from anon, authenticated;
revoke select on public.email_enrollments from anon, authenticated;
revoke select on public.email_logs from anon, authenticated;
revoke select on public.email_sequence_steps from anon, authenticated;
revoke select on public.email_sequences from anon, authenticated;
revoke select on public.email_subscribers from anon, authenticated;
revoke select on public.food_drives from anon, authenticated;
revoke select on public.grants from anon, authenticated;
revoke select on public.impact_donations from anon, authenticated;
revoke select on public.invites from anon, authenticated;
revoke select on public.partners from anon, authenticated;
revoke select on public.referrals from anon, authenticated;
revoke select on public.research_inquiries from anon, authenticated;
revoke select on public.subscribers from anon, authenticated;
revoke select on public.volunteer_applications from anon, authenticated;

-- 2) Tables whose select/all policies are scoped via auth.uid()/is_staff()/
-- is_elevated()/has_role() or `auth.role() = 'authenticated'`: these can
-- never match the anon role (auth.uid() is null and auth.role() is 'anon'
-- for anon-key requests), so the anon grant is dead -- but `authenticated`
-- genuinely needs SELECT for these policies to admit any rows to logged-in
-- users (own rows, channel members, staff, etc).
revoke select on public.activity_logs from anon;
revoke select on public.audit_log from anon;
revoke select on public.case_notes from anon;
revoke select on public.channel_members from anon;
revoke select on public.channels from anon;
revoke select on public.contacts from anon;
revoke select on public.crm_activity_log from anon;
revoke select on public.crm_user_roles from anon;
revoke select on public.documents from anon;
revoke select on public.message_reactions from anon;
revoke select on public.messages from anon;
revoke select on public.nda_agreements from anon;
revoke select on public.notifications from anon;
revoke select on public.program_outcomes from anon;
revoke select on public.push_subscriptions from anon;
revoke select on public.relationships from anon;
revoke select on public.tasks from anon;

-- Left as-is (genuinely public-readable -- both anon and authenticated need
-- SELECT for their unconditional/data-only-scoped policies):
-- campaigns ("Campaigns are publicly readable", using (true))
-- posts ("public_read_published", using (status = 'published'))
-- impact_meals ("public_read_meals", using (is_deleted = false))
-- impact_volunteers ("public_read_active_volunteers", using (active = true))
