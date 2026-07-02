import { createClient } from '@supabase/supabase-js'

// Read lazily, inside each function, instead of throwing at module scope.
// A top-level throw here previously crashed `next build` for ANY route that
// so much as imports this file -- Next's "Collecting page data" step
// statically evaluates route modules, so importing was enough to fail the
// build in any environment without these env vars set (e.g. CI, which
// doesn't configure Supabase secrets for the build step). Callers already
// treat a null client as "not configured" / 401, so failing closed here
// instead of throwing is strictly safer, not just build-safe.
function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
}

export function createAuthClient(accessToken: string) {
  const supabaseUrl = getSupabaseUrl()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return null
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function createServiceClient() {
  const supabaseUrl = getSupabaseUrl()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return null
  return createClient(supabaseUrl, serviceKey, {
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
