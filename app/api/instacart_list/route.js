import { NextResponse } from 'next/server';

const INSTACART_BASE = 'https://connect.instacart.com';
const CAMPAIGN_ID    = '20313';

function buildAffiliateUrl(rawUrl) {
  const partnerId = process.env.INSTACART_IMPACT_PARTNER_ID;
  if (!partnerId || !rawUrl) return rawUrl;
  const separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}utm_campaign=instacart-idp&utm_medium=affiliate&utm_source=instacart_idp&utm_term=partnertype-mediapartner&utm_content=campaignid-${CAMPAIGN_ID}_partnerid-${partnerId}`;
}

export async function POST(request) {
  const apiKey = process.env.INSTACART_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Instacart integration not configured' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ingredients, recipeTitle } = body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return NextResponse.json({ error: 'ingredients array is required' }, { status: 400 });
  }

  const lineItems = ingredients
    .filter(ing => ing?.name?.trim())
    .map(ing => ({
      name:         ing.name.trim(),
      display_text: [ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ').trim(),
      quantity:     String(ing.quantity ?? 1),
      unit:         ing.unit?.trim() || 'each',
    }));

  if (lineItems.length === 0) {
    return NextResponse.json({ error: 'No valid ingredients provided' }, { status: 400 });
  }

  let response;
  try {
    response = await fetch(`${INSTACART_BASE}/v1/shopping_lists`, {
      method: 'POST',
      headers: {
        'Authorization':  `InstacartClient ${apiKey}`,
        'Content-Type':   'application/json',
        'Accept':         'application/json',
      },
      body: JSON.stringify({
        shopping_list: {
          title:      recipeTitle?.trim() || 'My Recipe',
          line_items: lineItems,
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error('[/api/instacart_list] fetch error:', err.message);
    return NextResponse.json({ error: 'Could not reach Instacart' }, { status: 502 });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('[/api/instacart_list] Instacart error:', response.status, text);
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

  // Response shape: { shopping_list: { id, url } } — affiliate-tag the URL
  const rawUrl = json?.shopping_list?.url ?? json?.url ?? null;
  if (!rawUrl) {
    return NextResponse.json({ error: 'No shopping list URL in Instacart response' }, { status: 502 });
  }

  return NextResponse.json({ url: buildAffiliateUrl(rawUrl) });
}
