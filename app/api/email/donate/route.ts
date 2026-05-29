import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'
import { renderDonationReceiptEmail, renderDonationInternalEmail } from '@/emails/templates/donation'

const STAFF_EMAIL = process.env.STAFF_EMAIL || 'team@seedandspoon.org'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, email, amount, donationType, date, transactionId } = body as Record<string, string>

  if (!name || !email || !amount || !donationType || !date || !transactionId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 422 })
  }

  const firstName = name.split(' ')[0]
  const parsedAmount = parseFloat(amount)
  const type = donationType as 'one-time' | 'monthly'

  const [receiptHtml, internalHtml] = await Promise.all([
    renderDonationReceiptEmail({ firstName, amount: parsedAmount, donationType: type, date, transactionId }),
    renderDonationInternalEmail({ name, email, amount: parsedAmount, donationType: type, date, transactionId }),
  ])

  const [receipt, internal] = await Promise.all([
    sendEmail({
      to: email,
      subject: 'Your donation receipt — Seed & Spoon',
      html: receiptHtml,
      emailType: 'donation_receipt',
      metadata: { amount, donationType, transactionId },
    }),
    sendEmail({
      to: STAFF_EMAIL,
      subject: `[Donation] $${amount} ${type} from ${name}`,
      html: internalHtml,
      emailType: 'donation_internal',
      metadata: { donor_name: name, donor_email: email, amount, donationType, transactionId },
    }),
  ])

  if (!receipt.success) {
    console.error('[donate] receipt email failed:', receipt.error)
    return NextResponse.json({ error: 'Failed to send receipt' }, { status: 500 })
  }

  if (!internal.success) {
    // Non-fatal — donor receipt succeeded. Check STAFF_EMAIL env var.
    console.error(`[donate] staff notification failed (STAFF_EMAIL=${STAFF_EMAIL}):`, internal.error)
  }

  return NextResponse.json({ success: true, messageId: receipt.messageId }, { status: 200 })
}
