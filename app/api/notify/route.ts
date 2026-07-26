import { NextRequest, NextResponse } from 'next/server'
import { sendTeamAlert } from '@/lib/notify'

/**
 * POST /api/notify
 *
 * Called by the DB triggers in supabase/notifications.sql (via pg_net) or by
 * a Supabase Dashboard database webhook whenever a new row lands in a table
 * we alert the team on. Body: { table, record }.
 *
 * Not for browser/public use -- requires the `x-notify-secret` header to
 * match NOTIFY_SECRET.
 */
export async function POST(req: NextRequest) {
  const configuredSecret = process.env.NOTIFY_SECRET
  if (!configuredSecret) {
    console.error('[notify] NOTIFY_SECRET is not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const providedSecret = req.headers.get('x-notify-secret')
  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { table?: string; record?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.table || !body.record) {
    return NextResponse.json({ error: '"table" and "record" are required' }, { status: 400 })
  }

  try {
    await sendTeamAlert({ table: body.table, record: body.record })
  } catch (err) {
    console.error('[notify] failed to send team alert:', err)
    return NextResponse.json({ error: 'Alert send failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
