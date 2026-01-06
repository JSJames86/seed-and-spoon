// app/api/foodbanks/route.js
// API route to fetch food banks from Supabase

import { NextResponse } from "next/server";
import { createClientSupabaseClient, handleSupabaseError } from "@/lib/supabase";

export async function GET(request) {
  try {
    console.log('[API] Fetching food banks from Supabase...');

    const supabase = createClientSupabaseClient();

    // Query all food banks from Supabase
    const { data, error } = await supabase
      .from('foodbanks')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error(`[API] Supabase error:`, error);
      return NextResponse.json(
        handleSupabaseError(error, 'Failed to fetch food banks'),
        { status: 500 }
      );
    }

    console.log(`[API] Successfully fetched ${data?.length || 0} food banks`);

    // Return the data with cache headers
    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        details: 'Failed to connect to database. Please try again later.'
      },
      { status: 500 }
    );
  }
}
