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
  applications: (r) => {
    const fullName = [r.first_name, r.last_name].filter(Boolean).join(' ')
    const name = fullName || str(r.email, 'Someone new')
    return {
      subject: `New program signup: ${name}`,
      text: [
        `${name} (${str(r.email, 'no email')}) applied to the 5 Loaves program.`,
        r.phone ? `Phone: ${r.phone}` : null,
        r.household_size ? `Household size: ${r.household_size}` : null,
        r.allergies ? `Allergies: ${r.allergies}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    }
  },
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
