import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const supabase = serviceClient()
  const { data: invite, error } = await supabase
    .from('invites')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !invite) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })
  if (invite.used_at) return NextResponse.json({ error: 'This invite has already been used' }, { status: 400 })
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'This invite has expired' }, { status: 400 })

  return NextResponse.json({ invite: { email: invite.email, role: invite.role } })
}
