import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-server'

function getClient(request: NextRequest) {
  const client = getSupabaseClient(request.headers.get('authorization'))
  if (!client) {
    return { client: null, error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }
  return { client, error: null }
}

export async function GET(request: NextRequest) {
  const channelId = request.nextUrl.searchParams.get('channel_id')
  if (!channelId) return NextResponse.json({ error: 'channel_id required' }, { status: 400 })
  const { client: supabase, error: authError } = getClient(request)
  if (authError) return authError
  const { data, error } = await supabase!
    .from('messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { channel_id, sender_id, username, content } = await request.json()
  if (!channel_id || !sender_id || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const { client: supabase, error: authError } = getClient(request)
  if (authError) return authError
  const { data, error } = await supabase!
    .from('messages')
    .insert({ channel_id, sender_id, username, content })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data })
}

export async function PATCH(request: NextRequest) {
  const { id, content, is_pinned } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { client: supabase, error: authError } = getClient(request)
  if (authError) return authError
  const updates: Record<string, unknown> = {}
  if (content !== undefined) { updates.content = content; updates.edited_at = new Date().toISOString() }
  if (is_pinned !== undefined) updates.is_pinned = is_pinned
  const { data, error } = await supabase!.from('messages').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const { client: supabase, error: authError } = getClient(request)
  if (authError) return authError
  const { error } = await supabase!.from('messages').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
