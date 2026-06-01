import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const assigned_to = searchParams.get('assigned_to')

  const supabase = serviceClient()
  let query = supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)
  if (assigned_to) query = query.eq('assigned_to', assigned_to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tasks: data ?? [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log to activity timeline
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'task.created',
        record_type: body.related_type || 'general',
        record_label: body.title,
        actor_name: body.created_by_name || 'Admin',
        metadata: { priority: body.priority, due_date: body.due_date, assigned_to: body.assigned_name }
      })
    })
  } catch {}

  return NextResponse.json({ task: data })
}

export async function PATCH(request: NextRequest) {
  const { id, ...updates } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (updates.status === 'done') {
    updates.completed_at = new Date().toISOString()
  }
  updates.updated_at = new Date().toISOString()

  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (updates.status === 'done') {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'task.completed',
          record_type: 'general',
          record_label: data.title,
          actor_name: 'Admin',
          metadata: {}
        })
      })
    } catch {}
  }

  return NextResponse.json({ task: data })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const supabase = serviceClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
