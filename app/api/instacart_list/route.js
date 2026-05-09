import { NextResponse } from 'next/server';

const BASE_URL = process.env.INSTACART_BASE_URL || 'https://connect.dev.instacart.tools';

const LINKBACK_URL = 'https://seedandspoon.org/spoonassist';
const CAMPAIGN_ID  = '20313';

function buildAffiliateUrl(rawUrl) {
  const partnerId = process.env.INSTACART_IMPACT_PARTNER_ID;
  if (!partnerId || !rawUrl) return rawUrl;
  const separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}utm_campaign=instacart-idp&utm_medium=affiliate&utm_source=instacart_idp&utm_term=partnertype-mediapartner&utm_content=campaignid-${CAMPAIGN_ID}_partnerid-${partnerId}`;
}

// Maps common recipe shorthand to Instacart's accepted unit strings.
const UNIT_MAP = {
  tbsp:          'tablespoon',
  tbs:           'tablespoon',
  t:             'tablespoon',
  tablespoons:   'tablespoon',
  teaspoons:     'teaspoon',
  fl_oz:         'fl oz ounce',
  'fl.oz':       'fl oz ounce',
  floz:          'fl oz ounce',
  'fluid oz':    'fl oz ounce',
  'fluid ounce': 'fl oz ounce',
  'fluid ounces':'fl oz ounce',
  pkg:           'package',
  pkgs:          'packages',
  pkt:           'packet',
  gal:           'gallon',
  gals:          'gallon',
  gallons:       'gallon',
  milliliters:   'ml',
  millilitres:   'ml',
  milliliter:    'ml',
  millilitre:    'ml',
  mls:           'ml',
  liters:        'liter',
  litres:        'liter',
  litre:         'liter',
  kilograms:     'kilogram',
  kilos:         'kilogram',
  kilo:          'kilogram',
  kgs:           'kilogram',
  grams:         'gram',
  ounces:        'ounce',
  pounds:        'pound',
  pints:         'pint',
  pts:           'pint',
  quarts:        'quart',
  qts:           'quart',
  bunches:       'bunch',
  cans:          'can',
  heads:         'head',
  packages:      'package',
  lrg:           'large',
  lge:           'large',
  lg:            'large',
  med:           'medium',
  md:            'medium',
  sm:            'small',
};

function normalizeUnit(raw) {
  if (!raw) return 'each';
  const key = raw.trim().toLowerCase();
  return UNIT_MAP[key] ?? key;
}

function toAbsoluteImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;
  return `${siteUrl.replace(/\/$/, '')}${imagePath}`;
}

const HEALTH_FILTER_MAP = {
  'gluten-free': 'GLUTEN_FREE',
  'vegan':       'VEGAN',
};

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

  const {
    ingredients,
    recipeTitle,
    imageUrl,
    instructions,
    dietaryFilters,
    recipeId,
    retailerKey,
  } = body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return NextResponse.json({ error: 'ingredients array is required' }, { status: 400 });
  }

  const healthFilters = (Array.isArray(dietaryFilters) ? dietaryFilters : [])
    .map(f => HEALTH_FILTER_MAP[f])
    .filter(Boolean);

  const mappedIngredients = ingredients
    .filter(ing => ing?.name?.trim())
    .map(ing => {
      const item = {
        name:         ing.name.trim(),
        display_text: [ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ').trim(),
        measurements: [{ quantity: Number(ing.quantity) || 1, unit: normalizeUnit(ing.unit) }],
      };
      if (healthFilters.length > 0) {
        item.filters = { health_filters: healthFilters };
      }
      return item;
    });

  if (mappedIngredients.length === 0) {
    return NextResponse.json({ error: 'No valid ingredients provided' }, { status: 400 });
  }

  const landingConfig = {
    partner_linkback_url: LINKBACK_URL,
    enable_pantry_items:  true,
  };
  if (retailerKey) landingConfig.retailer_key = retailerKey;

  const payload = {
    title:       recipeTitle?.trim() || 'My Recipe',
    ingredients: mappedIngredients,
    landing_page_configuration: landingConfig,
  };

  const absoluteImage = toAbsoluteImageUrl(imageUrl);
  if (absoluteImage) payload.image_url = absoluteImage;

  if (Array.isArray(instructions) && instructions.length > 0) {
    payload.instructions = instructions.map(String);
  }

  if (recipeId != null) {
    payload.external_reference_id = String(recipeId);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}/idp/v1/products/recipe`, {
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

  const rawUrl = json?.products_link_url ?? null;
  if (!rawUrl) {
    console.error('[/api/instacart_list] unexpected response shape:', JSON.stringify(json));
    return NextResponse.json({ error: 'No recipe URL in Instacart response' }, { status: 502 });
  }

  return NextResponse.json({ url: buildAffiliateUrl(rawUrl) });
}
