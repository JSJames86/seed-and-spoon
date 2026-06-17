import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-server'

function getClient(request: NextRequest) {
  const client = getSupabaseClient(request.headers.get('authorization'))
  if (!client) {
    return { client: null, error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }
  return { client, error: null }
}

export async function POST(request: NextRequest) {
  const { message_id, user_id, username, emoji } = await request.json()
  const { client: supabase, error: authError } = getClient(request)
  if (authError) return authError
  const { data: existing } = await supabase!
    .from('message_reactions')
    .select('id')
    .eq('message_id', message_id)
    .eq('user_id', user_id)
    .eq('emoji', emoji)
    .single()

  if (existing) {
    await supabase!.from('message_reactions').delete().eq('id', existing.id)
    return NextResponse.json({ action: 'removed' })
  } else {
    await supabase!.from('message_reactions').insert({ message_id, user_id, username, emoji })
    return NextResponse.json({ action: 'added' })
  }
}

export async function GET(request: NextRequest) {
  const channelId = request.nextUrl.searchParams.get('channel_id')
  if (!channelId) return NextResponse.json({ reactions: [] })
  const { client: supabase, error: authError } = getClient(request)
  if (authError) return authError
  const { data: messages } = await supabase!
    .from('messages')
    .select('id')
    .eq('channel_id', channelId)
  const messageIds = (messages ?? []).map((m: {id: string}) => m.id)
  if (!messageIds.length) return NextResponse.json({ reactions: [] })
  const { data } = await supabase!
    .from('message_reactions')
    .select('*')
    .in('message_id', messageIds)
  return NextResponse.json({ reactions: data ?? [] })
}
