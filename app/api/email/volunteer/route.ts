import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-service'
import { renderVolunteerConfirmationEmail } from '@/emails/templates/volunteer'

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

  const { name, email, interests, availability } = body as Record<string, string | string[]>

  if (!name || !email || !interests || !availability) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 422 })
  }

  const supabase = getServiceSupabase()

  const { data: volunteer, error: dbError } = await supabase
    .from('volunteer_applications')
    .insert({
      name,
      email: (email as string).toLowerCase().trim(),
      interests,
      availability,
      status: 'pending',
    })
    .select('id, email')
    .single()

  if (dbError) {
    console.error('[volunteer] db error:', dbError)
    return NextResponse.json({ error: 'Failed to save volunteer' }, { status: 500 })
  }

  const firstName = (name as string).split(' ')[0]

  try {
    const html = await renderVolunteerConfirmationEmail({
      firstName,
      interests: interests as string[],
      availability: availability as string,
    })

    await sendEmail({
      to: volunteer.email,
      subject: "You're in! Welcome to Seed & Spoon Volunteers 🌱",
      html,
      emailType: 'volunteer_confirmation',
      metadata: { volunteer_id: volunteer.id },
    })
  } catch (emailError) {
    console.error('[volunteer] email error:', emailError)
  }

  return NextResponse.json({ success: true, volunteerId: volunteer.id }, { status: 200 })
}
