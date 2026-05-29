import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-service'
import { renderWelcomeEmail } from '@/emails/templates/welcome'

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role environment variables')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, first_name, segment, source } = body as Record<string, string>

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 422 })
  }

  const supabase = getServiceSupabase()

  const { data: subscriber, error: upsertError } = await supabase
    .from('email_subscribers')
    .upsert(
      {
        email: email.toLowerCase().trim(),
        first_name: first_name ?? null,
        segment: segment ?? 'general',
        source: source ?? 'api',
        status: 'subscribed',
        subscribed_at: new Date().toISOString(),
      },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id, email, first_name, status')
    .single()

  if (upsertError) {
    console.error('[subscribe] upsert error:', upsertError)
    return NextResponse.json({ error: 'Failed to save subscriber' }, { status: 500 })
  }

  try {
    const html = await renderWelcomeEmail({ firstName: subscriber.first_name ?? undefined })
    await sendEmail({
      to: subscriber.email,
      subject: 'Welcome to Seed & Spoon 🌱',
      html,
      subscriberId: subscriber.id,
      emailType: 'welcome',
      metadata: { segment, source },
    })
  } catch (emailError) {
    // Log but don't fail the subscription — subscriber is already saved
    console.error('[subscribe] welcome email error:', emailError)
  }

  return NextResponse.json(
    { success: true, subscriber: { id: subscriber.id, email: subscriber.email, status: subscriber.status } },
    { status: 200 }
  )
}
