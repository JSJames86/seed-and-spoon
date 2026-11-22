import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api-auth'

// Returns the CALLER's own profile. The old ?userId= parameter is ignored so
// nobody can read another user's profile by changing the id.
export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return NextResponse.json({ profile: null }, { status: auth.status })
  const { user, supabase } = auth

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, role, first_name, last_name, phone, updated_at')
    .eq('id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ profile: null })
  return NextResponse.json({ profile: data })
}
