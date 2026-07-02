import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { consolidateIngredients } from '@/lib/spoonassist/consolidateList';
import { findOrCreateHousehold } from '@/lib/spoonassist/household';

// ---------------------------------------------------------------------------
// POST /api/spoonassist/list/consolidate
//
// The Smart List page already dedupes client-side (same pure
// consolidateIngredients() from lib/spoonassist/consolidateList.js) for the
// instant, session-local UI. This route is the "server-side dedupe" spec §6
// calls for: it re-runs that same pure function over the raw per-recipe
// ingredient lines rather than trusting an already-consolidated client
// payload, then persists the result as a new shopping_lists/
// shopping_list_items row set -- this is what "Save your list" calls.
//
// Body: {
//   mealPlanId?: string,
//   items: [{ recipeId: string, ingredients: { key, name, quantity, unit,
//              canonicalId?, category? }[] }],
// }
// -> { shoppingListId, itemCount }
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

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'items[] is required' }, { status: 400 });
  }

  const supabase = await getSessionClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { items: consolidatedItems } = consolidateIngredients(body.items);
  if (consolidatedItems.length === 0) {
    return NextResponse.json({ error: 'Nothing to consolidate' }, { status: 400 });
  }

  try {
    const householdId = await findOrCreateHousehold(supabase, user.id);

    const { data: shoppingList, error: listErr } = await supabase
      .from('shopping_lists')
      .insert({
        household_id: householdId,
        meal_plan_id: typeof body.mealPlanId === 'string' ? body.mealPlanId : null,
        status: 'active',
      })
      .select('id')
      .single();
    if (listErr) throw listErr;

    // sourceRecipeIds may include the 'manual' sentinel (see
    // PlanProvider.jsx's MANUAL_RECIPE_ID) for manually-added items -- that's
    // not a real recipes.id, so only a UUID-shaped id is written to the FK.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const rows = consolidatedItems.map((item) => ({
      list_id: shoppingList.id,
      canonical_id: item.canonicalId,
      custom_name: item.canonicalId ? null : item.name,
      quantity: item.quantity,
      unit: item.unit,
      source_recipe_id: item.sourceRecipeIds.find((id) => UUID_RE.test(id)) ?? null,
    }));

    const { error: insertErr } = await supabase.from('shopping_list_items').insert(rows);
    if (insertErr) throw insertErr;

    return NextResponse.json({ shoppingListId: shoppingList.id, itemCount: rows.length });
  } catch (err) {
    console.error('[/api/spoonassist/list/consolidate] Error:', err.message);
    return NextResponse.json({ error: 'Failed to save list' }, { status: 500 });
  }
}
