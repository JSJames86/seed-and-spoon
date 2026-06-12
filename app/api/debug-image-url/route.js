import { NextResponse } from 'next/server';
import { toAbsoluteImageUrl } from '@/lib/spoonassist/instacart';

// Temporary diagnostic route for the Instacart recipe image_url issue.
// Remove once the broken-image problem is resolved.
export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    SITE_URL: process.env.SITE_URL ?? null,
    VERCEL_ENV: process.env.VERCEL_ENV ?? null,
    sample: {
      input: '/images/recipes/instacart/green-beans.jpg',
      resolved: toAbsoluteImageUrl('/images/recipes/instacart/green-beans.jpg'),
    },
  });
}
