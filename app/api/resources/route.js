import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl        = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Returns pantry locations within the given map viewport bounding box.
// Clients should call this on Leaflet's 'moveend' event to load only what
// fits on screen, avoiding unnecessary data transfer on mobile connections.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const north = parseFloat(searchParams.get('north'));
  const south = parseFloat(searchParams.get('south'));
  const east  = parseFloat(searchParams.get('east'));
  const west  = parseFloat(searchParams.get('west'));

  if ([north, south, east, west].some(v => isNaN(v))) {
    return NextResponse.json(
      { error: 'Map viewport boundaries (north, south, east, west) are required.' },
      { status: 400 }
    );
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('pantries')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('[/api/resources] Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const inBounds = (data ?? [])
      .map(pantry => {
        let latitude = null, longitude = null;
        if (pantry.location?.coordinates) {
          longitude = pantry.location.coordinates[0];
          latitude  = pantry.location.coordinates[1];
        } else if (pantry.location?.lat !== undefined) {
          latitude  = pantry.location.lat;
          longitude = pantry.location.lng;
        }
        return { ...pantry, latitude, longitude };
      })
      .filter(p =>
        p.latitude  !== null &&
        p.longitude !== null &&
        p.latitude  >= south && p.latitude  <= north &&
        p.longitude >= west  && p.longitude <= east
      );

    return NextResponse.json(inBounds, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
    });
  } catch (err) {
    console.error('[/api/resources] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
