import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/spoonassist/ingredients/search?q=... -- canonical-ingredient
// autocomplete for the Profile Pantry "add item" flow.
// -> { ingredients: [{ id, name, standardUnit }] }, capped at 15 matches.

async function getSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  if (q.length < 2) return NextResponse.json({ ingredients: [] });

  const supabase = await getSessionClient();
  if (!supabase) return NextResponse.json({ ingredients: [] });

  const { data, error } = await supabase
    .from('canonical_ingredients')
    .select('id, name, standard_unit')
    .ilike('name', `%${q}%`)
    .order('name')
    .limit(15);

  if (error) return NextResponse.json({ error: 'Search failed' }, { status: 500 });

  return NextResponse.json({
    ingredients: (data ?? []).map((row) => ({ id: row.id, name: row.name, standardUnit: row.standard_unit })),
  });
}
