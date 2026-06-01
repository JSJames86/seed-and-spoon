import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET — fetch notifications for a user
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ notifications: [] })
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notifications: data ?? [] })
}

// POST — create a notification
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { user_id, type, title, body: notifBody, href } = body
  if (!user_id || !type || !title) {
    return NextResponse.json({ error: 'user_id, type, title required' }, { status: 400 })
  }
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id, type, title, body: notifBody, href })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notification: data })
}

// PATCH — mark as read
export async function PATCH(request: NextRequest) {
  const { id, userId, markAllRead } = await request.json()
  const supabase = serviceClient()
  if (markAllRead && userId) {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
  } else if (id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }
  return NextResponse.json({ success: true })
}

// DELETE — clear all for user
export async function DELETE(request: NextRequest) {
  const { userId } = await request.json()
  const supabase = serviceClient()
  await supabase.from('notifications').delete().eq('user_id', userId)
  return NextResponse.json({ success: true })
}
