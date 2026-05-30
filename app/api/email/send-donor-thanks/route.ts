import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

const ELIGIBLE_AMOUNTS = new Set([2500, 5000])

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const resend = new Resend(process.env.RESEND_API_KEY)

  const paymentIntents = await stripe.paymentIntents.list({ limit: 100 })

  const eligible = paymentIntents.data.filter(
    (pi) => pi.status === 'succeeded' && ELIGIBLE_AMOUNTS.has(pi.amount)
  )

  const results: { email: string; success: boolean; error?: string }[] = []

  await Promise.all(
    eligible.map(async (pi) => {
      const email = pi.receipt_email
      if (!email) return

      const name =
        (pi.metadata?.name as string | undefined) ||
        (pi.metadata?.donorName as string | undefined) ||
        'Friend'
      const formattedAmount = (pi.amount / 100).toFixed(2)

      try {
        const { error } = await resend.emails.send({
          from: 'Janelle | Seed & Spoon <hello@seedandspoon.org>',
          to: email,
          subject: 'Thank you for your donation to Seed & Spoon 🌱',
          html: `
            <p>Hi ${name},</p>
            <p>Thank you so much for your generous donation of $${formattedAmount} to Seed & Spoon. Your support means the world to us and to the Newark community we serve.</p>
            <p>Here in Newark, access to fresh, affordable food is something too many families struggle with every day. Your gift goes directly toward changing that — helping us provide real meals, real resources, and real hope.</p>
            <p>Because of people like you, we can keep showing up. Thank you for believing in this mission.</p>
            <p>With gratitude,<br/>Janelle<br/>Founder, Seed & Spoon NJ<br/><a href="https://seedandspoon.org">seedandspoon.org</a></p>
          `,
        })

        if (error) {
          results.push({ email, success: false, error: error.message })
        } else {
          results.push({ email, success: true })
        }
      } catch (err) {
        results.push({ email, success: false, error: String(err) })
      }
    })
  )

  const sent = results.filter((r) => r.success).length
  const failures = results.filter((r) => !r.success)

  return NextResponse.json({ sent, failures })
}
