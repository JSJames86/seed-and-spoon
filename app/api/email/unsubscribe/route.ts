import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role environment variables')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const UNSUBSCRIBE_REDIRECT = 'https://seedandspoon.org/unsubscribed'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.redirect(UNSUBSCRIBE_REDIRECT)
  }

  const supabase = getServiceSupabase()

  const { error } = await supabase
    .from('email_subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('email', email.toLowerCase().trim())

  if (error) {
    console.error('[unsubscribe] update error:', error)
  }

  return NextResponse.redirect(UNSUBSCRIBE_REDIRECT)
}
