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

  // Validate token again
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('*')
    .eq('token', token)
    .single()

  if (inviteError || !invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 400 })
  if (invite.used_at) return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 400 })

  // Create the user
  const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })

  // Create profile with role
  await supabase.from('profiles').upsert({
    id: user!.id,
    first_name: firstName,
    last_name: lastName,
    role,
    updated_at: new Date().toISOString(),
  })

  // Mark invite as used
  await supabase.from('invites').update({ used_at: new Date().toISOString() }).eq('id', invite.id)

  return NextResponse.json({ success: true })
}
