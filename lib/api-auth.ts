import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Server-side auth guard for API routes.
 *
 * Every route that uses the service-role key bypasses Row Level Security, so
 * the route itself MUST decide who is allowed in. Call one of these at the top
 * of the handler:
 *
 *   const auth = await requireRole(req, ADMIN_ROLES)
 *   if (auth instanceof NextResponse) return auth
 *   const { user, profile, supabase } = auth
 *
 * The browser keeps the Supabase session in localStorage (not cookies), so
 * client code must send `Authorization: Bearer <access_token>`. Use
 * `authFetch` from `lib/auth-fetch.js` for that.
 *
 * Roles come from `profiles.role`. Never trust a role, user id or email sent
 * in the request body or query string. Always use the values returned here.
 */

export const ADMIN_ROLES = ['admin', 'executive_director'] as const
export const STAFF_ROLES = [...ADMIN_ROLES, 'employee', 'staff', 'board'] as const

export type AuthContext = {
  user: User
  profile: { id: string; role: string | null } | null
  supabase: SupabaseClient
}

function unauthorized(message = 'Authentication required') {
  return NextResponse.json({ error: message }, { status: 401 })
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

/** Verifies the caller's Supabase session. Returns 401 if missing/invalid. */
export async function requireUser(req: Request): Promise<AuthContext | NextResponse> {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const token = bearerToken(req)
  if (!token) return unauthorized()

  // getUser() validates the JWT with Supabase Auth (signature + expiry +
  // not revoked). Do not decode the JWT locally instead.
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return unauthorized('Invalid or expired session')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', data.user.id)
    .maybeSingle()

  return { user: data.user, profile: profile ?? null, supabase }
}

/** Verifies the session AND that profiles.role is one of `roles`. */
export async function requireRole(
  req: Request,
  roles: readonly string[]
): Promise<AuthContext | NextResponse> {
  const auth = await requireUser(req)
  if (auth instanceof NextResponse) return auth
  const role = auth.profile?.role ?? ''
  if (!roles.includes(role)) return forbidden()
  return auth
}

/** Constant-time string compare for shared secrets (cron, service tokens). */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  const enc = new TextEncoder()
  const x = enc.encode(a)
  const y = enc.encode(b)
  let diff = x.length ^ y.length
  const len = Math.max(x.length, y.length)
  for (let i = 0; i < len; i++) diff |= (x[i % x.length] ?? 0) ^ (y[i % y.length] ?? 0)
  return diff === 0
}
