import { resend } from './resend'

/**
 * Internal "heads up" alerts for the team -- fired via app/api/notify when a
 * DB trigger (see supabase/notifications.sql) sees a new row land in a table
 * we care about. This is separate from donor-facing receipts and from the
 * existing Stripe-webhook staff alert on `donations` (see
 * app/api/donations/webhook/route.js) -- donations are intentionally NOT
 * wired into this system to avoid double-emailing the team on every gift.
 *
 * FORMATTERS is the only place table/column names live. Add an entry here
 * for any other table you wire a trigger to in notifications.sql.
 */

const FROM = process.env.ALERT_FROM || 'Seed & Spoon <alerts@seedandspoon.org>'
const TO = (process.env.ALERT_TO || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

type Record_ = Record<string, unknown>

function str(v: unknown, fallback = 'unknown'): string {
  if (v === null || v === undefined || v === '') return fallback
  return String(v)
}

function joinList(v: unknown): string | null {
  if (!v) return null
  if (Array.isArray(v)) return v.length ? v.join(', ') : null
  return String(v)
}

const FORMATTERS: Record<string, (record: Record_) => { subject: string; text: string }> = {
  volunteer_applications: (r) => {
    const name = str(r.name, str(r.email, 'Someone new'))
    const interests = joinList(r.interests)
    return {
      subject: `New volunteer signup: ${name}`,
      text: [
        `${name} (${str(r.email, 'no email')}) just signed up to volunteer.`,
        r.phone ? `Phone: ${r.phone}` : null,
        interests ? `Interests: ${interests}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    }
  },
  // Kept deliberately thin: email is a less protected place than the database,
  // so allergies, medical needs, addresses and the referral file stay in
  // Supabase. The alert says who applied and how to reach them -- nothing more.
  applications: (r) => {
    const fullName = [r.first_name, r.last_name].filter(Boolean).join(' ')
    const name = fullName || str(r.email, 'Someone new')
    const kids = Array.isArray(r.children) ? r.children.length : null
    return {
      subject: `New 5 Loaves intake: ${name}`,
      text: [
        `${name} just submitted the Get Help intake form.`,
        '',
        `Email: ${str(r.email, 'none')}`,
        r.phone ? `Phone: ${r.phone}` : null,
        r.preferred_contact ? `Prefers: ${r.preferred_contact}` : null,
        kids !== null ? `Children listed: ${kids}` : null,
        r.zip ? `ZIP: ${r.zip}${r.essex_county === false ? ' (not Essex County)' : ''}` : null,
        r.referral_type ? `Referral: ${r.referral_type}` : null,
        '',
        'Full details (allergies, drop-off, referral document) are in the applications table in Supabase.',
      ]
        .filter((l) => l !== null)
        .join('\n'),
    }
  },
}

const STAFF_EMAIL = process.env.STAFF_EMAIL || 'team@seedandspoon.org'

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Staff alert sent straight from an API route, right after a public form saves.
 * Goes to STAFF_EMAIL -- the same inbox the contact form's internal email uses --
 * and is logged to email_logs. Never throws: a failed alert must not fail the
 * family's or volunteer's submission.
 *
 * This replaces relying on the pg_net triggers in supabase/notifications.sql,
 * which were never installed on the live database.
 */
export async function notifyStaff({
  type,
  table,
  record,
  metadata,
}: {
  type: string
  table: string
  record: Record_
  metadata?: Record<string, unknown>
}) {
  const formatter = FORMATTERS[table]
  if (!formatter) {
    console.warn(`[notify] no formatter registered for table "${table}" -- skipping staff alert`)
    return
  }
  const { subject, text } = formatter(record)
  try {
    const { sendEmail } = await import('./email-service')
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;white-space:pre-line">${escapeHtml(text)}</div>`
    const result = await sendEmail({ to: STAFF_EMAIL, subject, html, emailType: type, metadata })
    if (!result.success) {
      console.error(`[notify] staff alert failed (STAFF_EMAIL=${STAFF_EMAIL}):`, result.error)
    }
  } catch (err) {
    console.error(`[notify] staff alert failed (STAFF_EMAIL=${STAFF_EMAIL}):`, err)
  }
}

export async function sendTeamAlert({ table, record }: { table: string; record: Record_ }) {
  const formatter = FORMATTERS[table]
  if (!formatter) {
    console.warn(`[notify] no formatter registered for table "${table}" -- skipping alert`)
    return
  }
  if (TO.length === 0) {
    console.warn('[notify] ALERT_TO is not configured -- skipping alert')
    return
  }

  const { subject, text } = formatter(record)
  const { error } = await resend.emails.send({ from: FROM, to: TO, subject, text })

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`)
  }
}
