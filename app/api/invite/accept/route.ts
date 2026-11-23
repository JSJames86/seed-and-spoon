import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  // Role and email come ONLY from the invite record, never from the request,
  // so an invite can't be used to grant a different role or a different address.
  const { token, password, firstName, lastName } = await request.json()
  if (!token || typeof token !== 'string') return NextResponse.json({ error: 'Invalid invite' }, { status: 400 })
  if (!password || typeof password !== 'string' || password.length < 10) {
    return NextResponse.json({ error: 'Password must be at least 10 characters' }, { status: 400 })
  }
  const supabase = serviceClient()

  // Claim the invite atomically: only one request can flip used_at from null.
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .select('*')
    .maybeSingle()

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Invite is invalid, expired, or already used' }, { status: 400 })
  }
  const email: string = invite.email
  const role: string = invite.role

  const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (createError) {
    // Release the invite so the person can try again.
    await supabase.from('invites').update({ used_at: null }).eq('id', invite.id)
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  await supabase.from('profiles').upsert({
    id: user!.id, first_name: firstName, last_name: lastName,
    role, updated_at: new Date().toISOString(),
  })

  const { data: general } = await supabase.from('channels').select('id').eq('name', 'general').single()
  if (general) await supabase.from('channel_members').upsert({ channel_id: general.id, member_id: user!.id })
  if (invite.default_channel_id && invite.default_channel_id !== general?.id) {
    await supabase.from('channel_members').upsert({ channel_id: invite.default_channel_id, member_id: user!.id })
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    event_type: 'invite.accepted', record_type: 'user',
    record_label: `${firstName} ${lastName}`.trim(),
    actor_name: `${firstName} ${lastName}`.trim(),
    metadata: { email, role }
  })

  // Notify admin directly
  await supabase.from('notifications').insert({
    user_id: '836fc70f-1fd5-4d61-9250-a806cb92593d',
    type: 'invite.accepted',
    title: `${firstName} ${lastName} joined the platform`,
    body: `Role: ${role}`,
    href: '/admin'
  })

  return NextResponse.json({ success: true })
}
