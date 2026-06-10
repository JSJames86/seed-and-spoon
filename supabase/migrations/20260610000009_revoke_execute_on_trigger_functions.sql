-- These functions return `trigger` and are only ever invoked by the trigger
-- mechanism, which doesn't require the triggering role to hold EXECUTE on the
-- function. They have no legitimate use being directly callable, but new
-- functions get an implicit PUBLIC EXECUTE grant plus Supabase's default
-- anon/authenticated grants, which makes them show up as callable RPC
-- endpoints (/rest/v1/rpc/<name>). Revoke EXECUTE so they're no longer listed
-- in the API surface.
--
-- Note: the remaining security_definer_function_executable findings
-- (has_role, has_any_role, is_admin, is_elevated, is_staff, owns_profile) are
-- intentionally left as-is -- they're self-referential boolean checks
-- (auth.uid()-scoped) used inside RLS policies for {public}/anon/authenticated
-- across many tables, so anon/authenticated must retain EXECUTE for those
-- policies to evaluate at all.

revoke execute on function public.audit_role_assignment_changes() from public, anon, authenticated;
revoke execute on function public.audit_trigger_fn() from public, anon, authenticated;
revoke execute on function public.generate_receipt_number() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.notify_channel_members() from public, anon, authenticated;
revoke execute on function public.prevent_privilege_escalation() from public, anon, authenticated;
revoke execute on function public.prevent_profile_role_escalation() from public, anon, authenticated;
