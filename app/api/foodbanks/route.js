// app/api/foodbanks/route.js
// API route to fetch food banks from Supabase

import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request) {
  try {
    console.log('[API] Fetching food banks from Supabase...');

    // Fetch from Supabase REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/foodbanks?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      console.error(`[API] Supabase API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          error: 'Failed to fetch from database',
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Successfully fetched ${Array.isArray(data) ? data.length : 0} food banks`);

    // Return the data
    return NextResponse.json(data, {
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
