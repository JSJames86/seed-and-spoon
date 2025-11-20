// app/api/foodbanks/route.js
// Proxy route to Django backend - avoids CORS issues

import { NextResponse } from "next/server";

const DJANGO_API_URL = "https://seed-spoon-backend.onrender.com/api/foodbanks/";

export async function GET(request) {
  try {
    console.log('[API Proxy] Fetching food banks from Django backend...');

    // Fetch from Django backend
    const response = await fetch(DJANGO_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      console.error(`[API Proxy] Django API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          error: 'Failed to fetch from Django backend',
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API Proxy] Successfully fetched ${Array.isArray(data) ? data.length : data.results?.length || 0} food banks`);

    // Return the data
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        details: 'Failed to connect to Django backend. The backend may be down or unreachable.'
      },
      { status: 500 }
    );
  }
}
