import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function notify(type: string, title: string, body: string, href: string) {
  try {
    const supabase = serviceClient()
    await supabase.from('notifications').insert({
      user_id: '836fc70f-1fd5-4d61-9250-a806cb92593d',
      type, title, body, href
    })
  } catch {}
}

async function logActivity(event_type: string, record_type: string, record_label: string, metadata: Record<string, unknown>) {
  try {
    const supabase = serviceClient()
    await supabase.from('activity_logs').insert({
      event_type, record_type, record_label,
      actor_name: 'Admin', metadata
    })
  } catch {}
}

export async function GET() {
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('grants').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ grants: data ?? [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = serviceClient()
  const { data, error } = await supabase.from('grants').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await logActivity('grant.created', 'grant', data.title, { funder: data.funder, amount: data.amount })
  await notify('grant.created', `Grant added: ${data.title}`, data.funder, '/admin')
  return NextResponse.json({ grant: data })
}

export async function PATCH(request: NextRequest) {
  const { id, ...updates } = await request.json()
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('grants').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (updates.stage && data) {
    const eventType = updates.stage === 'awarded' ? 'grant.awarded' : 'grant.stage_changed'
    await logActivity(eventType, 'grant', data.title, { stage: updates.stage, funder: data.funder, amount: data.amount })
    if (updates.stage === 'awarded') {
      await notify('grant.awarded', `🏆 Grant awarded: ${data.title}`, `$${Number(data.amount || 0).toLocaleString()} from ${data.funder}`, '/admin')
    } else {
      await notify('grant.stage_changed', `Grant updated: ${data.title}`, `Moved to ${updates.stage}`, '/admin')
    }
  }

  return NextResponse.json({ grant: data })
}
