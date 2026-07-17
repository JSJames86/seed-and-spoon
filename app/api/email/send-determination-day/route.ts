import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-service'
import { renderDonationDeterminationEmail } from '@/emails/templates/donation-determination'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// One-time send to every past donor once the 501(c)(3) determination letter arrives.
// Requires an explicit confirm flag — this is a single irreversible mass-send.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  if (body.confirm !== true) {
    return NextResponse.json({ error: 'Pass { confirm: true } to send the determination-day email to all donors' }, { status: 400 })
  }

  const supabase = serviceClient()
  const { data: donations, error } = await supabase
    .from('donations')
    .select('id, donor_name, donor_email, amount, donation_type, transaction_id, payment_method, donated_at, receipt_id')
    .eq('status', 'completed')
    .order('donated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const seen = new Set<string>()
  const unique = (donations ?? []).filter(d => {
    if (!d.donor_email || seen.has(d.donor_email)) return false
    seen.add(d.donor_email)
    return true
  })

  const results: { email: string; success: boolean; error?: string }[] = []

  for (const donation of unique) {
    const firstName = donation.donor_name?.split(' ')[0] || 'Friend'
    const dateStr = donation.donated_at
      ? new Date(donation.donated_at).toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric' })
      : ''
    try {
      const html = await renderDonationDeterminationEmail({
        firstName,
        amount: Number(donation.amount),
        donationType: donation.donation_type === 'monthly' ? 'monthly' : 'one-time',
        date: dateStr,
        transactionId: donation.transaction_id || '',
        receiptId: donation.receipt_id ?? undefined,
        paymentMethod: donation.payment_method === 'stripe' ? 'Card' : donation.payment_method || 'Card',
      })
      const result = await sendEmail({
        to: donation.donor_email as string,
        subject: "It's official — and your gift just became tax-deductible",
        html,
        emailType: 'donation_determination',
      })
      results.push({ email: donation.donor_email as string, success: result.success, error: result.error })
    } catch (err) {
      results.push({ email: donation.donor_email as string, success: false, error: String(err) })
    }
  }

  const sent = results.filter(r => r.success).length
  const failures = results.filter(r => !r.success)

  return NextResponse.json({ sent, failures })
}
