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
