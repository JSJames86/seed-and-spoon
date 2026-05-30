import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import DonorThankYouEmail from '@/emails/templates/donor-thank-you'
import React from 'react'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = serviceClient()

  // Get all unique donors with $25+ donations
  const { data: donors, error } = await supabase
    .from('donations')
    .select('donor_email, donor_name, amount')
    .gte('amount', 25)
    .eq('status', 'completed')
    .order('donated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Deduplicate by email
  const seen = new Set<string>()
  const unique = (donors ?? []).filter(d => {
    if (!d.donor_email || seen.has(d.donor_email)) return false
    seen.add(d.donor_email)
    return true
  })

  const results: { email: string; success: boolean; error?: string }[] = []

  await Promise.all(
    unique.map(async (donor) => {
      const firstName = donor.donor_name?.split(' ')[0] || 'Friend'
      try {
        const html = await render(React.createElement(DonorThankYouEmail, { firstName }))
        const { error: sendError } = await resend.emails.send({
          from: 'Janelle | Seed & Spoon <hello@seedandspoon.org>',
          to: donor.donor_email,
          subject: 'Thank you for your donation to Seed & Spoon 🌱',
          html,
        })
        if (sendError) {
          results.push({ email: donor.donor_email, success: false, error: sendError.message })
        } else {
          results.push({ email: donor.donor_email, success: true })
        }
      } catch (err) {
        results.push({ email: donor.donor_email, success: false, error: String(err) })
      }
    })
  )

  const sent = results.filter(r => r.success).length
  const failures = results.filter(r => !r.success)

  return NextResponse.json({ sent, failures })
}
