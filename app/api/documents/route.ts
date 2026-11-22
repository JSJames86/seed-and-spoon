import { NextResponse } from 'next/server'
import { requireUser, requireRole, ADMIN_ROLES } from '@/lib/api-auth'
import { allowedLevels, roleTier } from '@/lib/document-access'

// GET: signed-in users see only documents at or below their tier, and
// non-admins must have signed the NDA first.
export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth instanceof NextResponse) return auth
  const { user, profile, supabase } = auth
  const role = profile?.role ?? null

  if (roleTier(role) === 0) return NextResponse.json({ documents: [] })

  if (!ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
    const { data: nda } = await supabase
      .from('nda_agreements').select('id').eq('user_id', user.id).maybeSingle()
    if (!nda) return NextResponse.json({ error: 'NDA required' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .in('access_level', allowedLevels(role))
    .order('category')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Could not load documents' }, { status: 500 })
  return NextResponse.json({ documents: data ?? [] })
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ADMIN_ROLES)
  if (auth instanceof NextResponse) return auth
  const { title, description, category, file_path, file_name, file_size, mime_type, access_level } =
    await request.json()
  const { data, error } = await auth.supabase.from('documents').insert({
    title, description, category, file_path, file_name, file_size, mime_type, access_level,
    uploaded_by: auth.user.id,
  }).select().single()
  if (error) return NextResponse.json({ error: 'Could not save document' }, { status: 500 })
  return NextResponse.json({ document: data })
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, ADMIN_ROLES)
  if (auth instanceof NextResponse) return auth
  const { id, title, description, category, access_level } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { data, error } = await auth.supabase
    .from('documents')
    .update({ title, description, category, access_level, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Could not update document' }, { status: 500 })
  return NextResponse.json({ document: data })
}

export async function DELETE(request: Request) {
  const auth = await requireRole(request, ADMIN_ROLES)
  if (auth instanceof NextResponse) return auth
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  // Look up the stored path rather than trusting one from the client, so a
  // request can't delete arbitrary files from the bucket.
  const { data: doc } = await auth.supabase.from('documents').select('file_path').eq('id', id).maybeSingle()
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.file_path) await auth.supabase.storage.from('internal-docs').remove([doc.file_path])
  const { error } = await auth.supabase.from('documents').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Could not delete document' }, { status: 500 })
  return NextResponse.json({ success: true })
}
