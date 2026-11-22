import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api-auth'

// NDA status and signing are always for the signed-in user only.

export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return NextResponse.json({ signed: false }, { status: auth.status })
  const { data } = await auth.supabase
    .from('nda_agreements')
    .select('id, signed_at')
    .eq('user_id', auth.user.id)
    .maybeSingle()
  return NextResponse.json({ signed: !!data, signed_at: data?.signed_at })
}

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  const { error } = await supabase.from('nda_agreements').upsert({
    user_id: user.id,
    signed_at: new Date().toISOString(),
    ip_address: ip,
    user_agent: userAgent,
  })
  if (error) return NextResponse.json({ error: 'Could not record signature' }, { status: 500 })

  // Log to activity timeline (direct insert; /api/activity is staff-only)
  try {
    await supabase.from('activity_logs').insert({
      event_type: 'nda.signed',
      record_type: 'user',
      record_label: user.email ?? user.id,
      actor_id: user.id,
      actor_name: 'User',
      metadata: { document: 'NDA / Confidentiality Agreement', ip_address: ip },
    })
  } catch {}

  return NextResponse.json({ success: true })
}
