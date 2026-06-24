import { createClient } from '@supabase/supabase-js'

function getRequiredEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars')
  }
  return { url, anonKey }
}

export function createAuthClient(accessToken: string) {
  const { url, anonKey } = getRequiredEnv()
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return null
  const { url } = getRequiredEnv()
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function getSupabaseClient(authHeader: string | null) {
  const service = createServiceClient()
  if (service) return service

  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null

  return createAuthClient(token)
}
