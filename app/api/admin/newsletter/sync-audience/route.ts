import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend } from '@/lib/resend'

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function authorized(request: NextRequest) {
  const token = process.env.ADMIN_SERVICE_TOKEN
  if (!token) return true // unset -- fine for local dev, set in production
  return request.headers.get('authorization') === `Bearer ${token}`
}

// POST /api/admin/newsletter/sync-audience -- upserts every subscribed row
// from the `email_subscribers` table into the Resend Audience. Resend's
// contacts.create is an upsert keyed on email, so re-running this is always
// safe and existing contacts are simply refreshed, not duplicated.
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) {
    return NextResponse.json({ error: 'Missing RESEND_AUDIENCE_ID environment variable' }, { status: 500 })
  }

  const supabase = serviceClient()
  const { data: subscribers, error } = await supabase
    .from('email_subscribers')
    .select('email, first_name')
    .eq('status', 'subscribed')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const resend = getResend()
  let synced = 0
  const failed: { email: string; error: string }[] = []

  for (const subscriber of subscribers ?? []) {
    const { error: contactError } = await resend.contacts.create({
      audienceId,
      email: subscriber.email,
      firstName: subscriber.first_name ?? undefined,
      unsubscribed: false,
    })

    if (contactError) {
      failed.push({ email: subscriber.email, error: contactError.message })
    } else {
      synced++
    }
  }

  return NextResponse.json({
    success: true,
    total: subscribers?.length ?? 0,
    synced,
    failed,
  })
}
