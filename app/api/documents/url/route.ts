import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get('path')
  if (!filePath) return NextResponse.json({ error: 'path required' }, { status: 400 })
  const supabase = serviceClient()
  const { data, error } = await supabase.storage
    .from('internal-docs')
    .createSignedUrl(filePath, 300) // 5 minute expiry
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl })
}
