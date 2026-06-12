import { NextResponse } from 'next/server';
import {
  getInstacartBaseUrl,
  requireInstacartApiKey,
  LINKBACK_URL,
  buildLineItem,
  toAbsoluteImageUrl,
} from '@/lib/spoonassist/instacart';

// Temporary diagnostic route for the Instacart recipe image_url issue.
// Remove once the broken-image problem is resolved.
export async function GET() {
  const resolvedImageUrl = toAbsoluteImageUrl('/images/recipes/instacart/sausage-apple-stuffing.jpg');

  const result = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    SITE_URL: process.env.SITE_URL ?? null,
    VERCEL_ENV: process.env.VERCEL_ENV ?? null,
    sample: {
      input: '/images/recipes/instacart/sausage-apple-stuffing.jpg',
      resolved: resolvedImageUrl,
    },
  };

  const { apiKey, errorResponse } = requireInstacartApiKey();
  if (errorResponse) {
    result.instacart = { error: 'INSTACART_API_KEY not configured' };
    return NextResponse.json(result);
  }

  const payload = {
    title: 'Debug Image Test',
    ingredients: [buildLineItem({ name: 'sage', quantity: '1', unit: 'tbsp' }, [], 'measurements')],
    landing_page_configuration: {
      partner_linkback_url: LINKBACK_URL,
      enable_pantry_items: true,
    },
    image_url: resolvedImageUrl,
  };

  const baseUrl = getInstacartBaseUrl();
  result.instacart = { baseUrl, sentPayload: payload };

  let response;
  try {
    response = await fetch(`${baseUrl}/idp/v1/products/recipe`, {
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
    result.instacart.fetchError = err.message;
    return NextResponse.json(result);
  }

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  result.instacart.status = response.status;
  result.instacart.response = json;

  return NextResponse.json(result);
}
