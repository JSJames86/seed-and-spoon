-- Fix: channel_members was empty, so all RLS checks on messages failed.
-- Realtime subscriptions (which run as the authenticated user, not service role)
-- could never pass the SELECT policy, so new messages never arrived in real time.

-- 1. Populate channel_members for ALL existing auth users x ALL existing channels.
INSERT INTO public.channel_members (id, channel_id, user_id, created_at)
SELECT
  gen_random_uuid(),
  c.id,
  u.id,
  now()
FROM auth.users u
CROSS JOIN public.channels c
ON CONFLICT DO NOTHING;

-- 2. Auto-add a newly-signed-up user to every channel.
CREATE OR REPLACE FUNCTION public.auto_add_channel_members()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.channel_members (id, channel_id, user_id, created_at)
  SELECT gen_random_uuid(), c.id, NEW.id, now()
  FROM public.channels c
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_add_channels ON auth.users;
CREATE TRIGGER on_auth_user_created_add_channels
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_channel_members();

-- 3. Auto-add every existing user when a NEW channel is created.
CREATE OR REPLACE FUNCTION public.auto_add_members_to_new_channel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.channel_members (id, channel_id, user_id, created_at)
  SELECT gen_random_uuid(), NEW.id, u.id, now()
  FROM auth.users u
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_channel_created_add_members ON public.channels;
CREATE TRIGGER on_channel_created_add_members
  AFTER INSERT ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_members_to_new_channel();

-- 4. Add missing DELETE policy on messages.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages' AND policyname = 'senders can delete own messages'
  ) THEN
    CREATE POLICY "senders can delete own messages" ON public.messages
      FOR DELETE TO authenticated
      USING (sender_id = auth.uid());
  END IF;
END;
$$;
