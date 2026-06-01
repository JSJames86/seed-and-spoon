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
  const { token, email, password, firstName, lastName, role } = await request.json()
  const supabase = serviceClient()

  const { data: invite, error: inviteError } = await supabase
    .from('invites').select('*').eq('token', token).single()

  if (inviteError || !invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 400 })
  if (invite.used_at) return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 400 })

  const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })

  await supabase.from('profiles').upsert({
    id: user!.id, first_name: firstName, last_name: lastName,
    role, updated_at: new Date().toISOString(),
  })

  const { data: general } = await supabase.from('channels').select('id').eq('name', 'general').single()
  if (general) await supabase.from('channel_members').upsert({ channel_id: general.id, member_id: user!.id })
  if (invite.default_channel_id && invite.default_channel_id !== general?.id) {
    await supabase.from('channel_members').upsert({ channel_id: invite.default_channel_id, member_id: user!.id })
  }

  await supabase.from('invites').update({ used_at: new Date().toISOString() }).eq('id', invite.id)

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
