import { NextResponse } from 'next/server';
import {
  resolveIngredientPrice,
  getStoresByZip,
  getServiceClient,
} from '@/lib/spoonassist/priceEngine';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const item = (searchParams.get('item') ?? '').trim();
  const zip  = (searchParams.get('zip')  ?? '').trim();

  if (!item) {
    return NextResponse.json(
      { error: 'item query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const stores         = await getStoresByZip(zip);
    const supabaseClient = getServiceClient();

    const settled = await Promise.allSettled(
      stores.map(async (store) => {
        const result = await resolveIngredientPrice(
          item,
          1,
          'each',
          store.priceMultiplier ?? 1.0,
          supabaseClient,
          store.locationId ?? null,
          zip || null
        );
        return {
          vendor: store.name,
          price:  `$${result.price.toFixed(2)}`,
          type:   result.confidence,
        };
      })
    );

    const payload = settled
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .sort((a, b) => parseFloat(a.price.slice(1)) - parseFloat(b.price.slice(1)));

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('[/api/spoonassist/compare] Error:', err.message);
    return NextResponse.json({ error: 'Price comparison failed' }, { status: 500 });
  }
}
