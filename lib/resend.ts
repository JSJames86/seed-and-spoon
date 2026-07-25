import { Resend } from 'resend'

let resendInstance: Resend | null = null

export function getResend(): Resend {
  if (resendInstance) return resendInstance

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('Missing RESEND_API_KEY environment variable')

  resendInstance = new Resend(apiKey)
  return resendInstance
}

export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    return getResend()[prop as keyof Resend]
  },
})

// The Audience (Resend now calls these "Segments" in the dashboard; the SDK
// keeps the `audiences` alias, so this ID works for both).
export const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID!

// Must be an address on a domain you've verified in Resend, e.g.
// "Seed & Spoon <hello@seedandspoon.org>"
export const NEWSLETTER_FROM = process.env.NEWSLETTER_FROM!
