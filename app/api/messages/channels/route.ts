import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(`Missing env vars: ${!url ? 'SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`.trim())
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET() {
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('channels')
    .select('id, name, description, intro, intro_author')
    .order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ channels: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { name, description, intro, intro_author } = await request.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('channels')
    .insert({ name: name.toLowerCase().replace(/\s+/g, '-'), description, intro, intro_author })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ channel: data })
}

export async function PATCH(request: NextRequest) {
  const { id, name, description, intro, intro_author } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('channels')
    .update({ name, description, intro, intro_author })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ channel: data })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const supabase = serviceClient()
  const { error } = await supabase.from('channels').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
