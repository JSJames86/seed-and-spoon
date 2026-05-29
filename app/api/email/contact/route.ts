import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'
import { renderContactConfirmationEmail, renderContactInternalEmail } from '@/emails/templates/contact'

const STAFF_EMAIL = process.env.STAFF_EMAIL || 'team@seedandspoon.org'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, email, phone, subject, message } = body as Record<string, string>

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 422 })
  }

  const firstName = name.split(' ')[0]
  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const [confirmationHtml, internalHtml] = await Promise.all([
    renderContactConfirmationEmail({ firstName, subject, message }),
    renderContactInternalEmail({ name, email, phone, subject, message, submittedAt }),
  ])

  const [confirmation, internal] = await Promise.all([
    sendEmail({
      to: email,
      subject: 'We received your message — Seed & Spoon',
      html: confirmationHtml,
      emailType: 'contact_confirmation',
      metadata: { subject },
    }),
    sendEmail({
      to: STAFF_EMAIL,
      subject: `[Contact] ${subject} — from ${name}`,
      html: internalHtml,
      emailType: 'contact_internal',
      metadata: { from_name: name, from_email: email },
    }),
  ])

  if (!confirmation.success) {
    console.error('[contact] confirmation email failed:', confirmation.error)
  }

  if (!internal.success) {
    console.error(`[contact] internal email failed (STAFF_EMAIL=${STAFF_EMAIL}):`, internal.error)
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
