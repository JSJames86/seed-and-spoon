import { NextResponse } from 'next/server';
import { getAllRecipes } from '@/lib/recipes';

export async function GET() {
  try {
    const { recipes, usingFallback } = await getAllRecipes();

    return NextResponse.json(
      { recipes, usingFallback },
      {
        headers: {
          'Cache-Control': usingFallback
            ? 'public, s-maxage=60'
            : 'public, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (err) {
    console.error('[/api/recipes] Error:', err.message);
    return NextResponse.json({ error: 'Failed to load recipes' }, { status: 500 });
  }
}
