/**
 * Food Banks API Route
 *
 * Fetches pantry locations from Supabase `pantries` table
 */

import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request) {
  try {
    console.log('[Pantries API] Fetching pantries from Supabase...');

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Pantries API] Supabase not configured, returning empty array');
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query pantries from Supabase (only active ones)
    const { data, error } = await supabase
      .from('pantries')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('[Pantries API] Supabase error:', error);
      return NextResponse.json(
        {
          error: 'Database error',
          message: error.message,
        },
        { status: 500 }
      );
    }

    // Transform data to include lat/lng at top level for easier access
    const transformedData = (data || []).map(pantry => ({
      ...pantry,
      // Extract lat/lng from location JSON for backwards compatibility
      latitude: pantry.location?.lat || null,
      longitude: pantry.location?.lng || null,
    }));

    console.log(`[Pantries API] Successfully fetched ${transformedData.length} pantries`);

    // Return the data as an array
    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('[Pantries API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
