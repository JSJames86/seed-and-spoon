import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { resolveIngredientLine, buildAliasMap, buildConversionMap } from '@/lib/spoonassist/ingredientResolver';
import { parseIngredientString, getServiceClient } from '@/lib/spoonassist/priceEngine';

// ---------------------------------------------------------------------------
// PATCH/DELETE /api/recipes/[id] -- the review step for a "Share a recipe"
// draft (app/api/recipes/import, is_published = false). Only the recipe's
// own author can edit, publish, or discard it.
//
// PATCH body: { title?, description?, category?, servings?, total_minutes?,
//               dietary_tags?, ingredients?: string[] (raw lines, replaces
//               recipe_ingredients entirely), instructions?: string[],
//               publish?: boolean }
// DELETE: removes the draft outright (recipe_ingredients cascade).
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

async function requireOwnedDraft(request, id) {
  const supabase = await getSessionClient();
  if (!supabase) return { error: NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 }) };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const serviceClient = getServiceClient();
  if (!serviceClient) return { error: NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 }) };

  const { data: recipe, error } = await serviceClient
    .from('recipes')
    .select('id, author_id, is_published')
    .eq('id', id)
    .maybeSingle();

  if (error || !recipe) return { error: NextResponse.json({ error: 'Recipe not found' }, { status: 404 }) };
  if (recipe.author_id !== user.id) return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };

  return { serviceClient, recipe };
}

const PATCHABLE_FIELDS = ['title', 'description', 'category', 'servings', 'total_minutes', 'dietary_tags'];

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { serviceClient, error } = await requireOwnedDraft(request, id);
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  const update = {};
  for (const field of PATCHABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  if (Array.isArray(body.instructions)) update.instructions = body.instructions.filter(Boolean);
  if (body.publish === true) update.is_published = true;

  if (Object.keys(update).length > 0) {
    const { error: updateError } = await serviceClient.from('recipes').update(update).eq('id', id);
    if (updateError) {
      console.error('[/api/recipes/[id] PATCH] Failed to update recipe:', updateError.message);
      return NextResponse.json({ error: 'Failed to save changes' }, { status: 500 });
    }
  }

  if (Array.isArray(body.ingredients)) {
    const [{ data: canonicalIngredients }, { data: aliasRows }, { data: conversionRows }] = await Promise.all([
      serviceClient.from('canonical_ingredients').select('id, name, standard_unit'),
      serviceClient.from('ingredient_aliases').select('alias, canonical_id'),
      serviceClient.from('ingredient_conversions').select('canonical_id, from_unit, to_unit, multiplier, is_estimate'),
    ]);
    const aliasMap = buildAliasMap(aliasRows);
    const conversions = buildConversionMap(conversionRows ?? []);
    const canonicalCtx = canonicalIngredients ?? [];

    const rows = body.ingredients
      .map((raw) => {
        const parsed = parseIngredientString(raw);
        if (!parsed) return null;
        const resolution = resolveIngredientLine(raw, { canonicalIngredients: canonicalCtx, aliasMap, conversions });
        return {
          recipe_id: id,
          canonical_id: resolution.resolved ? resolution.canonicalId : null,
          quantity: parsed.quantity,
          unit: parsed.unit,
          ingredient_name: parsed.name,
          raw_text: raw,
        };
      })
      .filter(Boolean);

    const { error: deleteError } = await serviceClient.from('recipe_ingredients').delete().eq('recipe_id', id);
    if (deleteError) {
      console.error('[/api/recipes/[id] PATCH] Failed to clear ingredients:', deleteError.message);
      return NextResponse.json({ error: 'Failed to save changes' }, { status: 500 });
    }
    if (rows.length > 0) {
      const { error: insertError } = await serviceClient.from('recipe_ingredients').insert(rows);
      if (insertError) {
        console.error('[/api/recipes/[id] PATCH] Failed to save ingredients:', insertError.message);
        return NextResponse.json({ error: 'Failed to save changes' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const { serviceClient, error } = await requireOwnedDraft(request, id);
  if (error) return error;

  const { error: deleteError } = await serviceClient.from('recipes').delete().eq('id', id);
  if (deleteError) {
    console.error('[/api/recipes/[id] DELETE] Failed to discard recipe:', deleteError.message);
    return NextResponse.json({ error: 'Failed to discard recipe' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
