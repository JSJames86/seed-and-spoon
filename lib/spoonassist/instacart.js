import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Environment / key scoping
//
// Shared by /api/instacart_list, /api/instacart_shopping_list and
// /api/instacart_retailers so all three routes resolve the Connect base URL
// and API key the same way.
// ---------------------------------------------------------------------------

const PROD_BASE_URL = 'https://connect.instacart.com';
const DEV_BASE_URL  = 'https://connect.dev.instacart.tools';

// INSTACART_API_BASE_URL overrides the NODE_ENV-based default, so a
// production deployment can be pointed at the dev/sandbox API (or vice
// versa) during IDP review without changing NODE_ENV.
export function getInstacartBaseUrl() {
  const override = process.env.INSTACART_API_BASE_URL;
  if (override) return override.replace(/\/$/, '');
  return process.env.NODE_ENV === 'production' ? PROD_BASE_URL : DEV_BASE_URL;
}

// Reads the Instacart API key, returning a ready-to-send 503 response when
// it isn't configured so every route reports "not configured" the same way
// instead of failing later with a generic 500.
export function requireInstacartApiKey() {
  const apiKey = process.env.INSTACART_API_KEY;
  if (!apiKey) {
    return {
      apiKey: null,
      errorResponse: NextResponse.json({ error: 'Instacart integration not configured' }, { status: 503 }),
    };
  }
  return { apiKey, errorResponse: null };
}

// ---------------------------------------------------------------------------
// Error parsing — Instacart returns structured JSON error bodies:
//   single:   { error: { message, code }, meta: { key } }
//   multiple: { error: { message, code: 9999, errors: [{ error, meta }] } }
// Falls back to a generic "Instacart returned {status}" if the body doesn't
// match either shape (e.g. an HTML error page from a gateway/proxy).
// ---------------------------------------------------------------------------

export function parseInstacartError(status, bodyText) {
  try {
    const err = JSON.parse(bodyText)?.error;
    if (err?.code === 9999 && Array.isArray(err.errors)) {
      const details = err.errors
        .map(e => `${e?.meta?.key ?? 'field'}: ${e?.error?.message ?? 'invalid'}`)
        .join('; ');
      return `${err.message} (${details})`;
    }
    if (err?.message) return err.message;
  } catch { /* not JSON — fall through */ }
  return `Instacart returned ${status}`;
}

// ---------------------------------------------------------------------------
// Affiliate linkback
// ---------------------------------------------------------------------------

export const LINKBACK_URL = 'https://seedandspoon.org/spoonassist';
export const CAMPAIGN_ID  = '20313';

export function buildAffiliateUrl(rawUrl) {
  const partnerId = process.env.INSTACART_IMPACT_PARTNER_ID;
  if (!partnerId || !rawUrl) return rawUrl;
  const separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}utm_campaign=instacart-idp&utm_medium=affiliate&utm_source=instacart_idp&utm_term=partnertype-mediapartner&utm_content=campaignid-${CAMPAIGN_ID}_partnerid-${partnerId}`;
}

// ---------------------------------------------------------------------------
// Unit normalization — maps recipe shorthand to Instacart's accepted
// measurement units.
// ---------------------------------------------------------------------------

export const UNIT_MAP = {
  tbsp:          'tablespoon',
  tbs:           'tablespoon',
  tblsp:         'tablespoon',
  tablespoons:   'tablespoon',
  tsp:           'teaspoon',
  t:             'teaspoon',
  teaspoons:     'teaspoon',
  pinch:         'each',
  pinches:       'each',
  dash:          'each',
  dashes:        'each',
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

export function normalizeUnit(raw) {
  if (!raw) return 'each';
  const key = raw.trim().toLowerCase();
  return UNIT_MAP[key] ?? key;
}

// ---------------------------------------------------------------------------
// Dietary filter mapping
// ---------------------------------------------------------------------------

export const HEALTH_FILTER_MAP = {
  'gluten-free': 'GLUTEN_FREE',
  'vegan':       'VEGAN',
};

export function mapHealthFilters(dietaryFilters) {
  return (Array.isArray(dietaryFilters) ? dietaryFilters : [])
    .map(f => HEALTH_FILTER_MAP[f])
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Line item builder — shared shape for recipe ingredients and shopping list
// items, which differ only in their measurements key
// ('measurements' vs 'line_item_measurements').
// ---------------------------------------------------------------------------

export function buildLineItem(ing, healthFilters, measurementsKey) {
  const item = {
    name:         ing.name.trim(),
    display_text: [ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ').trim(),
    [measurementsKey]: [{ quantity: Number(ing.quantity) || 1, unit: normalizeUnit(ing.unit) }],
  };
  if (healthFilters.length > 0) {
    item.filters = { health_filters: healthFilters };
  }
  return item;
}

// ---------------------------------------------------------------------------
// Recipe image URL — Instacart requires an absolute URL, so site-relative
// paths are resolved against SITE_URL / NEXT_PUBLIC_SITE_URL.
// ---------------------------------------------------------------------------

export function toAbsoluteImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;
  return `${siteUrl.replace(/\/$/, '')}${imagePath}`;
}
