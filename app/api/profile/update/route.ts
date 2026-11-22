import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api-auth'

// Columns a user may change on their own profile. Anything else in the body
// (especially `role` or `id`) is ignored, so a user can never promote
// themselves or edit someone else's profile.
const EDITABLE_FIELDS = [
  'username',
  'first_name',
  'last_name',
  'full_name',
  'display_name',
  'avatar_url',
  'bio',
  'phone',
  'pronouns',
  'organization',
  'title',
  'onboarding_completed',
  'email_preferences',
]

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const body = await request.json().catch(() => ({}))
  const updates: Record<string, unknown> = {}
  for (const key of EDITABLE_FIELDS) {
    if (key in body) updates[key] = body[key]
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: 'Could not update profile' }, { status: 500 })
  return NextResponse.json({ success: true })
}
