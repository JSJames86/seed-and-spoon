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
  const record_id = searchParams.get('record_id')
  const record_type = searchParams.get('record_type')
  const limit = parseInt(searchParams.get('limit') || '50')

  const supabase = serviceClient()
  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (record_id) query = query.eq('record_id', record_id)
  if (record_type) query = query.eq('record_type', record_type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs: data ?? [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { event_type, record_type, record_id, record_label, actor_id, actor_name, metadata } = body

  if (!event_type || !record_type) {
    return NextResponse.json({ error: 'event_type and record_type required' }, { status: 400 })
  }

  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({ event_type, record_type, record_id, record_label, actor_id, actor_name, metadata: metadata || {} })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ log: data })
}
