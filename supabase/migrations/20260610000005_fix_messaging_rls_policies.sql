-- messages: drop leftover PUBLIC/true policies superseded by the channel-
-- membership-scoped "members can read/send messages" policies added later.
-- The old policies were never dropped, and since PERMISSIVE policies for the
-- same command are OR'd together, they fully negated the membership checks --
-- anyone with the anon key could read every message in every channel and
-- insert messages with any sender_id.
drop policy "Anyone can insert messages" on public.messages;
drop policy "Anyone can read messages" on public.messages;

-- message_reactions: same leftover-PUBLIC/true problem, but with no scoped
-- equivalent yet. Replace with channel-membership-scoped policies mirroring
-- messages (the chat UI subscribes to these tables via Supabase Realtime,
-- which is RLS-gated, so a SELECT policy is required for live updates).
drop policy "Anyone can read reactions" on public.message_reactions;
drop policy "Anyone can insert reactions" on public.message_reactions;
drop policy "Anyone can delete reactions" on public.message_reactions;

create policy "members can read reactions"
  on public.message_reactions
  for select
  using (exists (
    select 1 from public.messages m
    join public.channel_members cm on cm.channel_id = m.channel_id
    where m.id = message_reactions.message_id
      and cm.user_id = auth.uid()
  ));

create policy "members can add reactions"
  on public.message_reactions
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.messages m
      join public.channel_members cm on cm.channel_id = m.channel_id
      where m.id = message_reactions.message_id
        and cm.user_id = auth.uid()
    )
  );

create policy "users can delete own reactions"
  on public.message_reactions
  for delete
  using (user_id = auth.uid());

-- channels: "Anyone can read channels" (PUBLIC/true) exposed channel
-- names/descriptions/intros/allowed_roles to anyone with the anon key. Scope
-- to channel members, matching channel_members' own "members can view
-- channel membership" policy.
drop policy "Anyone can read channels" on public.channels;

create policy "members can read channels"
  on public.channels
  for select
  using (exists (
    select 1 from public.channel_members cm
    where cm.channel_id = channels.id and cm.user_id = auth.uid()
  ));
