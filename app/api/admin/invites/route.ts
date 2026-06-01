import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('invites')
    .select('*, channels(name)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invites: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { email, role, default_channel_id } = await request.json()
  if (!email || !role) return NextResponse.json({ error: 'Email and role required' }, { status: 400 })

  const supabase = serviceClient()
  const { data: invite, error } = await supabase
    .from('invites')
    .insert({ email, role, default_channel_id: default_channel_id || null })
    .select('*, channels(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invite?token=${invite.token}`
    const channelName = invite.channels?.name ? ` You'll start in #${invite.channels.name}.` : ''

    await resend.emails.send({
      from: 'Janelle | Seed & Spoon <hello@seedandspoon.org>',
      to: email,
      subject: `You've been invited to join Seed & Spoon 🌱`,
      html: `
        <p>Hi there,</p>
        <p>You've been invited to join the Seed & Spoon platform as a <strong>${role}</strong>.${channelName}</p>
        <p><a href="${inviteUrl}" style="background:#2d5a27;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Accept Invitation</a></p>
        <p>This link expires in 7 days.</p>
        <p>With gratitude,<br/>Janelle<br/>Founder, Seed & Spoon NJ</p>
      `,
    })
  }

  return NextResponse.json({ invite })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const supabase = serviceClient()
  const { error } = await supabase.from('invites').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
