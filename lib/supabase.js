// lib/supabase.js
// Supabase client utilities for API routes and server-side operations

import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for server-side use (API routes)
 * Uses the service role key for admin operations
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Create a Supabase client for client-side use
 * Uses the anon key for public operations
 */
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Handle Supabase errors and return formatted error response
 */
export function handleSupabaseError(error, defaultMessage = 'Database operation failed') {
  console.error('Supabase error:', error);

  return {
    error: error.message || defaultMessage,
    code: error.code || 'UNKNOWN_ERROR',
    details: error.details || null
  };
}
