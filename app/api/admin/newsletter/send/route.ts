import { NextRequest, NextResponse } from 'next/server'
import * as React from 'react'
import { getResend } from '@/lib/resend'
import Newsletter, { Story } from '@/emails/Newsletter'

function authorized(request: NextRequest) {
  const token = process.env.ADMIN_SERVICE_TOKEN
  if (!token) return true // unset -- fine for local dev, set in production
  return request.headers.get('authorization') === `Bearer ${token}`
}

interface NewsletterContent {
  previewText?: string
  headline: string
  intro?: string
  stories?: Story[]
  ctaLabel?: string
  ctaHref?: string
}

interface SendBody {
  subject: string
  name: string
  content: NewsletterContent
  scheduledAt?: string
  draft?: boolean
}

// POST /api/admin/newsletter/send -- creates a Resend Broadcast from
// Newsletter.tsx and, unless `draft` is set, sends it to the synced
// Audience. Run sync-audience first so the Audience reflects the current
// email_subscribers list.
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) {
    return NextResponse.json({ error: 'Missing RESEND_AUDIENCE_ID environment variable' }, { status: 500 })
  }

  const from = process.env.NEWSLETTER_FROM
  if (!from) {
    return NextResponse.json({ error: 'Missing NEWSLETTER_FROM environment variable' }, { status: 500 })
  }

  let body: SendBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { subject, name, content, scheduledAt, draft } = body

  if (!subject || !name || !content?.headline) {
    return NextResponse.json({ error: 'subject, name, and content.headline are required' }, { status: 422 })
  }

  const resend = getResend()

  const { data, error } = await resend.broadcasts.create({
    audienceId,
    name,
    from,
    subject,
    previewText: content.previewText,
    react: React.createElement(Newsletter, {
      previewText: content.previewText,
      headline: content.headline,
      intro: content.intro,
      stories: content.stories,
      ctaLabel: content.ctaLabel,
      ctaHref: content.ctaHref,
    }),
    ...(draft ? { send: false } : { send: true, scheduledAt }),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, broadcastId: data?.id, draft: !!draft })
}
