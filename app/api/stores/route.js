import { NextResponse } from 'next/server';
import { getStoresByZip } from '@/lib/spoonassist/priceEngine';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip') || '';

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 });
  }

  try {
    const stores = getStoresByZip(zip);
    return NextResponse.json(
      { stores, zip },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
    );
  } catch (err) {
    console.error('[/api/stores] Error:', err.message);
    return NextResponse.json({ error: 'Failed to look up stores' }, { status: 500 });
  }
}
