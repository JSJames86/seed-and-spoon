import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ---------------------------------------------------------------------------
// /api/spoonassist/saved-recipes -- the heart-icon favorites list (Profile
// page "Saved recipes" row, RecipeCard/detail heart toggle).
//
// GET  -> { recipeIds: string[] } for the signed-in user (empty, not an
//         error, when signed out -- the heart icon just isn't toggleable yet).
// POST body: { recipeId } -> saves it (idempotent).
// DELETE ?recipeId=... -> unsaves it.
// ---------------------------------------------------------------------------

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

export async function GET() {
  const supabase = await getSessionClient();
  if (!supabase) return NextResponse.json({ recipeIds: [], recipes: [] });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ recipeIds: [], recipes: [] });

  const { data, error } = await supabase
    .from('saved_recipes')
    .select('recipe_id, recipes(id, slug, title, image_url, total_minutes)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to load saved recipes' }, { status: 500 });

  const recipes = (data ?? [])
    .filter((row) => row.recipes)
    .map((row) => ({
      id: row.recipes.id,
      slug: row.recipes.slug,
      title: row.recipes.title,
      image: row.recipes.image_url,
      totalMinutes: row.recipes.total_minutes,
    }));

  return NextResponse.json({ recipeIds: (data ?? []).map((row) => row.recipe_id), recipes });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.recipeId !== 'string') {
    return NextResponse.json({ error: 'recipeId is required' }, { status: 400 });
  }

  const supabase = await getSessionClient();
  if (!supabase) return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('saved_recipes')
    .upsert({ user_id: user.id, recipe_id: body.recipeId }, { onConflict: 'user_id,recipe_id' });

  if (error) return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const recipeId = searchParams.get('recipeId');
  if (!recipeId) return NextResponse.json({ error: 'recipeId query parameter is required' }, { status: 400 });

  const supabase = await getSessionClient();
  if (!supabase) return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId);

  if (error) return NextResponse.json({ error: 'Failed to unsave recipe' }, { status: 500 });

  return NextResponse.json({ success: true });
}
