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
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ signed: false })
  const supabase = serviceClient()
  const { data } = await supabase
    .from('nda_agreements')
    .select('id, signed_at')
    .eq('user_id', userId)
    .single()
  return NextResponse.json({ signed: !!data, signed_at: data?.signed_at })
}

export async function POST(request: NextRequest) {
  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const supabase = serviceClient()
  const { error } = await supabase.from('nda_agreements').upsert({
    user_id: userId,
    signed_at: new Date().toISOString(),
    ip_address: ip,
    user_agent: userAgent,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
