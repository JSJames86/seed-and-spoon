import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function logActivity(event_type: string, record_label: string, metadata: Record<string, unknown>) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type, record_type: 'grant', record_label, actor_name: 'Admin', metadata }),
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
  await logActivity('grant.created', data.title, { funder: data.funder, amount: data.amount })
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
    await logActivity(eventType, data.title, { stage: updates.stage, funder: data.funder, amount: data.amount })
  }
  return NextResponse.json({ grant: data })
}
