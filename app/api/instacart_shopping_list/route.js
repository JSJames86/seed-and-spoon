import { NextResponse } from 'next/server';
import {
  getInstacartBaseUrl,
  requireInstacartApiKey,
  buildAffiliateUrl,
  LINKBACK_URL,
  mapHealthFilters,
  buildLineItem,
} from '@/lib/spoonassist/instacart';

export async function POST(request) {
  const { apiKey, errorResponse } = requireInstacartApiKey();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ingredients, title, dietaryFilters, retailerKey } = body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return NextResponse.json({ error: 'ingredients array is required' }, { status: 400 });
  }

  const healthFilters = mapHealthFilters(dietaryFilters);

  const lineItems = ingredients
    .filter(ing => ing?.name?.trim())
    .map(ing => buildLineItem(ing, healthFilters, 'line_item_measurements'));

  if (lineItems.length === 0) {
    return NextResponse.json({ error: 'No valid ingredients provided' }, { status: 400 });
  }

  const landingConfig = {
    partner_linkback_url: LINKBACK_URL,
    enable_pantry_items:  true,
  };
  if (retailerKey) landingConfig.retailer_key = retailerKey;

  const payload = {
    title:     title?.trim() || 'My Shopping List',
    link_type: 'shopping_list',
    line_items: lineItems,
    landing_page_configuration: landingConfig,
  };

  let response;
  try {
    response = await fetch(`${getInstacartBaseUrl()}/idp/v1/products/products_link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    console.error('[/api/instacart_shopping_list] fetch error:', err.message);
    return NextResponse.json({ error: 'Could not reach Instacart' }, { status: 502 });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('[/api/instacart_shopping_list] Instacart error:', response.status, text);
    return NextResponse.json(
      { error: `Instacart returned ${response.status}` },
      { status: response.status >= 500 ? 502 : response.status }
    );
  }

  let json;
  try {
    json = await response.json();
  } catch {
    return NextResponse.json({ error: 'Invalid response from Instacart' }, { status: 502 });
  }

  const rawUrl = json?.products_link_url ?? null;
  if (!rawUrl) {
    console.error('[/api/instacart_shopping_list] unexpected response shape:', JSON.stringify(json));
    return NextResponse.json({ error: 'No shopping list URL in Instacart response' }, { status: 502 });
  }

  return NextResponse.json({ url: buildAffiliateUrl(rawUrl) });
}
