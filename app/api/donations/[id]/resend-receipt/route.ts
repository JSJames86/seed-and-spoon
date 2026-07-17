import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-service'
import { renderDonationReceiptEmail } from '@/emails/templates/donation'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = serviceClient()

  const { data: donation, error } = await supabase
    .from('donations')
    .select('id, donor_name, donor_email, amount, donation_type, transaction_id, payment_method, donated_at, receipt_id, receipt_email_sent_at')
    .eq('id', id)
    .single()

  if (error || !donation) {
    return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
  }
  if (!donation.donor_email) {
    return NextResponse.json({ error: 'Donation has no donor email on file' }, { status: 400 })
  }

  const firstName = donation.donor_name?.split(' ')[0] || 'Friend'
  const dateStr = donation.donated_at
    ? new Date(donation.donated_at).toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const html = await renderDonationReceiptEmail({
    firstName,
    amount: Number(donation.amount),
    donationType: donation.donation_type === 'monthly' ? 'monthly' : 'one-time',
    date: dateStr,
    transactionId: donation.transaction_id || '',
    receiptId: donation.receipt_id ?? undefined,
    paymentMethod: donation.payment_method === 'stripe' ? 'Card' : donation.payment_method || 'Card',
  })

  const result = await sendEmail({
    to: donation.donor_email,
    subject: 'Your Seed & Spoon donation receipt (resend)',
    html,
    emailType: 'donation_receipt_resend',
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error || 'Send failed' }, { status: 502 })
  }

  // Backfill the original send timestamp if this donation predates the automated receipt
  // (e.g. one of the pre-automation donors) — never overwrite a real original send time.
  if (!donation.receipt_email_sent_at) {
    await supabase.from('donations').update({ receipt_email_sent_at: new Date().toISOString() }).eq('id', id)
  }

  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: 'email.sent',
      record_type: 'donor',
      record_id: id,
      record_label: donation.donor_name || donation.donor_email,
      actor_name: 'Admin',
      metadata: { subject: 'Your Seed & Spoon donation receipt (resend)', type: 'donation_receipt_resend', email: donation.donor_email },
    }),
  }).catch(() => {})

  return NextResponse.json({ success: true })
}
