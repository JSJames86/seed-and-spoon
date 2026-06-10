-- "Users can update own profile" (auth.uid() = id) lets a user update ANY
-- column on their own row, including `role` -- so any authenticated user
-- could grant themselves 'editor' or 'admin' via a direct PostgREST call
-- (e.g. supabase.from('profiles').update({ role: 'admin' }).eq('id', myId)).
--
-- Block role changes from non-service-role connections. The admin role-
-- management endpoint (/api/admin/users PATCH) uses the service role key,
-- which bypasses RLS but not triggers, so legitimate admin role changes
-- still work via auth.role() = 'service_role'.
create or replace function public.prevent_profile_role_escalation()
 returns trigger
 language plpgsql
 set search_path = ''
as $function$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    new.role := old.role;
  end if;
  return new;
end;
$function$;

create trigger trg_prevent_profile_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_role_escalation();
