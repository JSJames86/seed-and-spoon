import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const category = formData.get('category') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const access_level = formData.get('access_level') as string
  const uploaded_by = formData.get('uploaded_by') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const supabase = serviceClient()
  const fileName = `${category}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('internal-docs')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: doc, error: dbError } = await supabase.from('documents').insert({
    title: title || file.name,
    description,
    category: category || 'general',
    file_path: fileName,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    access_level: access_level || 'staff',
    uploaded_by,
  }).select().single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Log to activity timeline
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'document.uploaded',
        record_type: 'user',
        record_label: title || file.name,
        actor_name: 'Admin',
        metadata: { category, file_name: file.name, file_size: file.size, access_level }
      })
    })
  } catch {}

  return NextResponse.json({ document: doc })
}
