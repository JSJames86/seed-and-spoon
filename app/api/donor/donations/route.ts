import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api-auth'

// Returns donations for the signed-in donor only. The email comes from the
// verified session, never from the query string.
export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth
  if (!user.email) return NextResponse.json({ donations: [] })

  const { data, error } = await supabase
    .from('donations')
    .select('id, donor_name, amount, donation_type, status, donated_at')
    .ilike('donor_email', user.email)
    .order('donated_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: 'Could not load donations' }, { status: 500 })
  return NextResponse.json({ donations: data ?? [] })
}
