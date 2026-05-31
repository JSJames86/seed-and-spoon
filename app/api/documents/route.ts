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
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('category')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ documents: data ?? [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, description, category, file_path, file_name, file_size, mime_type, access_level, uploaded_by } = body
  const supabase = serviceClient()
  const { data, error } = await supabase.from('documents').insert({
    title, description, category, file_path, file_name, file_size, mime_type, access_level, uploaded_by
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ document: data })
}

export async function PATCH(request: NextRequest) {
  const { id, title, description, category, access_level } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const supabase = serviceClient()
  const { data, error } = await supabase
    .from('documents')
    .update({ title, description, category, access_level, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ document: data })
}

export async function DELETE(request: NextRequest) {
  const { id, file_path } = await request.json()
  const supabase = serviceClient()
  await supabase.storage.from('internal-docs').remove([file_path])
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
