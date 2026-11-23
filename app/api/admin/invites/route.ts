import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireRole, ADMIN_ROLES } from '@/lib/api-auth'
import { INVITABLE_ROLE_VALUES, roleLabel } from '@/data/accessRoles'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: Request) {
  const auth = await requireRole(request, ADMIN_ROLES)
  if (auth instanceof NextResponse) return auth

  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('invites')
    .select('*, channels(name)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invites: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ADMIN_ROLES)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const role = typeof body.role === 'string' ? body.role : ''
  const default_channel_id = body.default_channel_id
  if (!email || !role) return NextResponse.json({ error: 'Email and role required' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  if (!INVITABLE_ROLE_VALUES.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

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
        <p>You've been invited to join the Seed & Spoon platform as a <strong>${roleLabel(role)}</strong>.${channelName}</p>
        <p><a href="${inviteUrl}" style="background:#2d5a27;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Accept Invitation</a></p>
        <p>This link expires in 7 days.</p>
        <p>With gratitude,<br/>Janelle<br/>Founder, Seed & Spoon</p>
      `,
    })
  }

  return NextResponse.json({ invite })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireRole(request, ADMIN_ROLES)
  if (auth instanceof NextResponse) return auth

  const { id } = await request.json()
  const supabase = serviceClient()
  const { error } = await supabase.from('invites').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
