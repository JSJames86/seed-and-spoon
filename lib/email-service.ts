import { createClient } from '@supabase/supabase-js'
import { getResend } from './resend'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  subscriberId?: string
  emailType?: string
  sequenceId?: string
  metadata?: Record<string, unknown>
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role environment variables')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, subscriberId, emailType = 'transactional', sequenceId, metadata } = options

  const from = `${process.env.RESEND_FROM_NAME || 'Seed & Spoon'} <${process.env.RESEND_FROM_EMAIL || 'hello@seedandspoon.org'}>`
  const recipients = Array.isArray(to) ? to : [to]

  const resend = getResend()
  const { data, error } = await resend.emails.send({ from, to, subject, html })

  // Log the send attempt — isolated try/catch so a DB failure never kills the send result
  try {
    const supabase = getServiceSupabase()
    await supabase.from('email_logs').insert({
      recipient_email: recipients[0],
      subject,
      email_type: emailType,
      status: error ? 'failed' : 'sent',
      resend_message_id: data?.id ?? null,
      subscriber_id: subscriberId ?? null,
      sequence_id: sequenceId ?? null,
      error_message: error?.message ?? null,
      metadata: metadata ?? null,
      sent_at: error ? null : new Date().toISOString(),
    })
  } catch (logError) {
    console.error('[email-service] Failed to write email_log (non-fatal):', logError)
  }

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, messageId: data?.id }
}
