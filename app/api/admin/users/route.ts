import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const supabase = serviceClient()

  // Get all auth users
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, first_name, last_name, role')

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const combined = users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in: u.last_sign_in_at,
    profile: profileMap.get(u.id) || null,
    role: profileMap.get(u.id)?.role || 'donor',
  }))

  return NextResponse.json({ users: combined })
}

export async function PATCH(request: NextRequest) {
  const { userId, role } = await request.json()
  if (!userId || !role) return NextResponse.json({ error: 'userId and role required' }, { status: 400 })

  const supabase = serviceClient()
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, role, updated_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
