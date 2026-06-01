import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json()
  const supabase = serviceClient()

  const { data, error } = await supabase
    .from('volunteer_applications')
    .update({ status })
    .eq('id', id)
    .select('name, email')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'approved' || status === 'active') {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'volunteer.approved',
          record_type: 'volunteer',
          record_label: data?.name || data?.email || 'Volunteer',
          actor_name: 'Admin',
          metadata: { status, email: data?.email }
        })
      })
    } catch {}
  }

  return NextResponse.json({ success: true })
}
