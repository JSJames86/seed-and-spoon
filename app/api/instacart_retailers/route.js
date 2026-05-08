import { NextResponse } from 'next/server';

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://connect.instacart.com'
  : 'https://connect.dev.instacart.tools';

export async function GET(request) {
  const apiKey = process.env.INSTACART_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ retailers: [] });
  }

  const { searchParams } = new URL(request.url);
  const postalCode = searchParams.get('zip') || searchParams.get('postal_code');

  if (!postalCode || !/^\d{5}$/.test(postalCode)) {
    return NextResponse.json({ error: 'Valid 5-digit ZIP required' }, { status: 400 });
  }

  let response;
  try {
    response = await fetch(
      `${BASE_URL}/idp/v1/retailers?postal_code=${postalCode}&country_code=US`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept':        'application/json',
        },
        signal: AbortSignal.timeout(8000),
      }
    );
  } catch (err) {
    console.error('[/api/instacart_retailers] fetch error:', err.message);
    return NextResponse.json({ error: 'Could not reach Instacart' }, { status: 502 });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('[/api/instacart_retailers] Instacart error:', response.status, text);
    return NextResponse.json({ retailers: [] });
  }

  let json;
  try {
    json = await response.json();
  } catch {
    return NextResponse.json({ retailers: [] });
  }

  return NextResponse.json(
    { retailers: json?.retailers ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}
