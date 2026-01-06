/**
 * Supabase client configuration
 * Provides both browser and server-side Supabase client instances
 * Uses lazy initialization to avoid build-time errors
 */

import { createClient } from '@supabase/supabase-js';

// Cache for singleton instances
let browserClient = null;
let serviceClient = null;

/**
 * Get browser-side Supabase client (lazy initialized)
 * Uses anon key for client-side operations
 */
export function getSupabase() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, return a mock client to prevent errors
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
    }
    // Return a mock for build time
    return null;
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

/**
 * Browser-side Supabase client (lazy-loaded)
 * Call getSupabase() to get the client instance
 * @example
 * import { getSupabase } from '@/lib/supabase';
 * const supabase = getSupabase();
 */

/**
 * Get server-side Supabase client with service role
 * Only use this in API routes or server components
 * Has elevated permissions - use with caution
 */
export function getServiceSupabase() {
  // Return cached instance if available
  if (serviceClient) {
    return serviceClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // During build time, return null to prevent errors
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      throw new Error('Missing Supabase environment variables');
    }
    // Return null for build time
    return null;
  }

  serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClient;
}
