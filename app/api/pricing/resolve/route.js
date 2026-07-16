import { NextResponse } from 'next/server';
import { getStoresByZip, normalizeIngredient } from '@/lib/spoonassist/priceEngine';
import { resolveAll } from '@/lib/pricing/resolve';

// POST /api/pricing/resolve -- spec Phase 1 §8. Server-side only; every
// provider key (Kroger, future Walmart) stays out of the client bundle.
//
// body: { items: [{ name, quantity?, unit? }], zip }
// (`listId` isn't supported yet -- shopping lists in this app are
// client-side/local-storage only, see components/spoonassist/PlanProvider;
// there's no server-side list to look up by id.)
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { items, zip, listId } = body;

  if (listId && !Array.isArray(items)) {
    return NextResponse.json(
      { error: 'listId lookup is not supported yet -- pass items[] directly' },
      { status: 400 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items array is required' }, { status: 400 });
  }

  if (!/^\d{5}$/.test(zip || '')) {
    return NextResponse.json({ error: 'zip is required (5-digit ZIP code)' }, { status: 400 });
  }

  const cleanItems = items
    .filter((i) => i && typeof i.name === 'string' && i.name.trim())
    .map((i) => {
      const name = i.name.trim();
      const normalized = normalizeIngredient(name);
      return {
        productId: normalized ?? name,
        name,
        quantity: typeof i.quantity === 'number' && isFinite(i.quantity) ? i.quantity : 1,
        unit: typeof i.unit === 'string' ? i.unit.trim() : 'each',
      };
    });

  if (cleanItems.length === 0) {
    return NextResponse.json({ error: 'No valid items provided' }, { status: 400 });
  }

  try {
    const stores = await getStoresByZip(zip);
    if (!stores.length) {
      return NextResponse.json({ error: 'No stores found for this ZIP' }, { status: 404 });
    }

    const resolveStores = stores.map((s) => ({
      id: s.id,
      name: s.name,
      priceMultiplier: s.priceMultiplier ?? 1.0,
      locationId: s.locationId || undefined,
    }));

    const results = await resolveAll(cleanItems, zip, resolveStores);

    return NextResponse.json({ zip, stores: results });
  } catch (err) {
    console.error('[/api/pricing/resolve] Error:', err.message);
    return NextResponse.json({ error: 'Price resolution failed' }, { status: 500 });
  }
}
