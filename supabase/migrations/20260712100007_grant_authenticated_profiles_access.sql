-- profiles has RLS policies for authenticated users ("Users can read own
-- profile", "Users can update own profile") but the authenticated role was
-- never actually GRANTed SELECT/UPDATE on the table itself — RLS restricts
-- *which rows* a role can see, but the role still needs the base table
-- privilege first. Without it, every client-side query against profiles
-- (including the subquery inside posts' editor_read_all/editor_insert/
-- editor_update_own policies) fails with "permission denied for table
-- profiles", which callers were silently swallowing as empty results.
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
