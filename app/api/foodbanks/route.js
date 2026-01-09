/**
 * Food Banks API Route
 *
 * Fetches food bank locations from Supabase database
 */

import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request) {
  try {
    console.log('[Food Banks API] Fetching food banks from Supabase...');

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Food Banks API] Supabase not configured, returning empty array');
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query food banks from Supabase
    const { data, error } = await supabase
      .from('foodbanks')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Food Banks API] Supabase error:', error);
      return NextResponse.json(
        {
          error: 'Database error',
          message: error.message,
        },
        { status: 500 }
      );
    }

    console.log(`[Food Banks API] Successfully fetched ${data?.length || 0} food banks`);

    // Return the data as an array
    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('[Food Banks API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
