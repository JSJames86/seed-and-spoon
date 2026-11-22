import { NextResponse } from 'next/server'
import { requireUser, ADMIN_ROLES } from '@/lib/api-auth'
import { levelTier, roleTier } from '@/lib/document-access'

// Returns a short-lived signed URL as JSON: { url }. Only for a file that is
// registered in `documents` and that the caller's tier may see.
export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return auth
  const { user, profile, supabase } = auth

  const filePath = new URL(request.url).searchParams.get('path')
  if (!filePath) return NextResponse.json({ error: 'path required' }, { status: 400 })

  const { data: doc } = await supabase
    .from('documents').select('access_level').eq('file_path', filePath).maybeSingle()
  if (!doc || roleTier(profile?.role) < levelTier(doc.access_level)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const isAdmin = ADMIN_ROLES.includes((profile?.role ?? '') as (typeof ADMIN_ROLES)[number])
  if (!isAdmin) {
    const { data: nda } = await supabase
      .from('nda_agreements').select('id').eq('user_id', user.id).maybeSingle()
    if (!nda) return NextResponse.json({ error: 'NDA required' }, { status: 403 })
  }

  const { data, error } = await supabase.storage.from('internal-docs').createSignedUrl(filePath, 300)
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 })
  }
  return NextResponse.json({ url: data.signedUrl })
}
