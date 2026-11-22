import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireRole, ADMIN_ROLES } from '@/lib/api-auth'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: Request) {
  const auth = await requireRole(request, ADMIN_ROLES)
  if (auth instanceof NextResponse) return auth

  const supabase = serviceClient()

  const [d, v, e] = await Promise.all([
    supabase.from('donations').select('id, donor_name, donor_email, amount, donation_type, status, donated_at, receipt_id, receipt_email_sent_at').order('donated_at', { ascending: false }).limit(20),
    supabase.from('volunteer_applications').select('id, name, email, interests, availability, status, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('email_logs').select('id, recipient_email, subject, email_type, status, sent_at, error_message').order('sent_at', { ascending: false }).limit(20),
  ])

  return NextResponse.json({
    donations: d.data ?? [],
    volunteers: v.data ?? [],
    emailLogs: e.data ?? [],
  })
}
