import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL
  || 'https://clsepfwqnphjjmnosqff.supabase.co'

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc2VwZndxbnBoamptbm9zcWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MTE3NzYsImV4cCI6MjA4Mjk4Nzc3Nn0.uc3bbBw_moprc2FXO-eo0wIuGO7xJqF4MNm2vKmc4SQ'

export function createAuthClient(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return null
  return createClient(SUPABASE_URL, serviceKey, {
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
