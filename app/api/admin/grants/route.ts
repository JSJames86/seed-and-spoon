import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    .from('grants')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ grants: data ?? [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = serviceClient()
  const { data, error } = await supabase.from('grants').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Log stage change to activity timeline
  if (updates.stage && data) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: updates.stage === 'awarded' ? 'grant.awarded' : 'grant.stage_changed',
        record_type: 'grant',
        record_id: id,
        record_label: data.title,
        actor_name: 'Admin',
        metadata: { stage: updates.stage, funder: data.funder, amount: data.amount }
      })
    }).catch(() => {})
  }
  return NextResponse.json({ grant: data })
}

export async function PATCH(request: NextRequest) {
  const { id, ...updates } = await request.json()
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('grants').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Log stage change to activity timeline
  if (updates.stage && data) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: updates.stage === 'awarded' ? 'grant.awarded' : 'grant.stage_changed',
        record_type: 'grant',
        record_id: id,
        record_label: data.title,
        actor_name: 'Admin',
        metadata: { stage: updates.stage, funder: data.funder, amount: data.amount }
      })
    }).catch(() => {})
  }
  return NextResponse.json({ grant: data })
}
