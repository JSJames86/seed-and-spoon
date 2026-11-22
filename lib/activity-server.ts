import { createServiceClient } from '@/lib/supabase-server'

// Server-side writers for the activity timeline and notifications. API routes
// use these instead of calling /api/activity or /api/notifications over HTTP,
// since those endpoints now require a signed-in staff session.

type ActivityEntry = {
  event_type: string
  record_type: string
  record_id?: string | null
  record_label?: string | null
  actor_id?: string | null
  actor_name?: string | null
  metadata?: Record<string, unknown>
}

export async function logActivityServer(entry: ActivityEntry): Promise<void> {
  try {
    const supabase = createServiceClient()
    if (!supabase) return
    await supabase.from('activity_logs').insert({ ...entry, metadata: entry.metadata || {} })
  } catch (err) {
    console.error('[activity] failed to log', err)
  }
}

type NotificationEntry = {
  user_id: string
  type: string
  title: string
  body?: string | null
  href?: string | null
}

export async function createNotificationServer(entry: NotificationEntry): Promise<void> {
  try {
    const supabase = createServiceClient()
    if (!supabase) return
    await supabase.from('notifications').insert(entry)
  } catch (err) {
    console.error('[notifications] failed to create', err)
  }
}
