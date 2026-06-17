-- Fix: channel_members SELECT policy referenced channel_members in its own
-- subquery, causing infinite recursion (ERROR 42P17). Every RLS-scoped read
-- (including the messages SELECT policy's membership check) silently failed.

-- Drop the recursive policy
DROP POLICY IF EXISTS "members can view channel membership" ON public.channel_members;

-- Users can always see their own membership rows.
CREATE POLICY "users can view own memberships" ON public.channel_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Security-definer helper breaks the recursion cycle: it runs as the
-- function owner (bypassing RLS on channel_members) so the policy
-- below never re-enters itself.
CREATE OR REPLACE FUNCTION public.is_channel_member(p_channel_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members
    WHERE channel_id = p_channel_id
      AND user_id = auth.uid()
  );
$$;

-- Users can see fellow members in channels they belong to.
CREATE POLICY "members can view fellow members" ON public.channel_members
  FOR SELECT TO authenticated
  USING (public.is_channel_member(channel_id));
