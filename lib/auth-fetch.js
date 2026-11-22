import { supabase } from '@/lib/supabase'

/**
 * fetch() that attaches the signed-in user's Supabase access token, so API
 * routes guarded by lib/api-auth.ts can identify the caller.
 *
 * Drop-in replacement: authFetch('/api/tasks', { method: 'POST', ... })
 */
export async function authFetch(input, init = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  const headers = new Headers(init.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}
