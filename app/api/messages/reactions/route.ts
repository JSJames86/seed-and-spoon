import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const { message_id, user_id, username, emoji } = await request.json()
  const supabase = serviceClient()
  // Toggle: if exists delete, if not insert
  const { data: existing } = await supabase
    .from('message_reactions')
    .select('id')
    .eq('message_id', message_id)
    .eq('user_id', user_id)
    .eq('emoji', emoji)
    .single()

  if (existing) {
    await supabase.from('message_reactions').delete().eq('id', existing.id)
    return NextResponse.json({ action: 'removed' })
  } else {
    await supabase.from('message_reactions').insert({ message_id, user_id, username, emoji })
    return NextResponse.json({ action: 'added' })
  }
}

export async function GET(request: NextRequest) {
  const channelId = request.nextUrl.searchParams.get('channel_id')
  if (!channelId) return NextResponse.json({ reactions: [] })
  const supabase = serviceClient()
  // Get all message IDs in channel then fetch reactions
  const { data: messages } = await supabase
    .from('messages')
    .select('id')
    .eq('channel_id', channelId)
  const messageIds = (messages ?? []).map((m: {id: string}) => m.id)
  if (!messageIds.length) return NextResponse.json({ reactions: [] })
  const { data } = await supabase
    .from('message_reactions')
    .select('*')
    .in('message_id', messageIds)
  return NextResponse.json({ reactions: data ?? [] })
}
