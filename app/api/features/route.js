import { NextResponse } from 'next/server';
import { FEATURES } from '@/lib/spoonassist/config';

export async function GET() {
  return NextResponse.json(
    { kroger: FEATURES.kroger, instacart: FEATURES.instacart },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
