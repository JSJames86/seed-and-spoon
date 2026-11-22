import { NextResponse } from 'next/server'
import { requireUser, requireRole, STAFF_ROLES } from '@/lib/api-auth'

// All reads/updates are scoped to the signed-in user. userId values sent by
// the client are ignored.

export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return NextResponse.json({ notifications: [] }, { status: auth.status })
  const { user, supabase } = auth
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return NextResponse.json({ notifications: [] })
  return NextResponse.json({ notifications: data ?? [] })
}

// Creating a notification for someone else is a staff action.
export async function POST(request: Request) {
  const auth = await requireRole(request, STAFF_ROLES)
  if (auth instanceof NextResponse) return auth
  const { user_id, type, title, body: notifBody, href } = await request.json()
  if (!user_id || !type || !title) {
    return NextResponse.json({ error: 'user_id, type, title required' }, { status: 400 })
  }
  const { data, error } = await auth.supabase
    .from('notifications')
    .insert({ user_id, type, title, body: notifBody, href })
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Could not create notification' }, { status: 500 })
  return NextResponse.json({ notification: data })
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth
  const { id, markAllRead } = await request.json().catch(() => ({}))
  if (markAllRead) {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
  } else if (id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user.id)
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return auth
  await auth.supabase.from('notifications').delete().eq('user_id', auth.user.id)
  return NextResponse.json({ success: true })
}
