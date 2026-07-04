import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { extractRecipeFromText } from '@/lib/spoonassist/recipeExtraction';
import { resolveIngredientLine, buildAliasMap, buildConversionMap } from '@/lib/spoonassist/ingredientResolver';
import { parseIngredientString, getServiceClient } from '@/lib/spoonassist/priceEngine';

// ---------------------------------------------------------------------------
// POST /api/recipes/import
//
// "Share a recipe": a user pastes a caption/description (optionally with a
// source link) copied from Instagram, TikTok, or anywhere else. Unlike
// /api/spoonassist/recipe-import (which pulls schema.org JSON-LD from a URL
// and pins the recipe straight into a household's meal plan), this extracts
// the recipe via Claude (lib/spoonassist/recipeExtraction.js) and lands it in
// the editorial `recipes` table as an unpublished draft the user reviews at
// /spoonassist/recipes/[slug]/review before it appears anywhere else.
//
// No login required -- SpoonAssist has no consumer account system (only an
// internal admin login at /login). Access to the draft is gated by
// review_token (20260704100002), generated here and returned only to the
// caller, instead of auth.uid().
//
// recipe_ingredients here keep the recipe's OWN units (e.g. "3/4 cup water"),
// same as the rest of the editorial catalog -- NOT the coverage-engine's
// standard-unit conversion. canonical_id is attached best-effort via
// ingredientResolver.js for future price-lookup/"pairs well with" use, and
// left null otherwise; an ingredient with no canonical match still imports.
//
// Body: { text: string (required), sourceUrl?: string }
// Response: { recipeId, slug, confidence, reviewToken } | { error }
// ---------------------------------------------------------------------------

const ERROR_STATUS = {
  not_configured: 503,
  no_recipe_found: 422,
  extraction_failed: 502,
};

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(supabase, title) {
  const base = slugify(title) || 'recipe';
  const { data } = await supabase.from('recipes').select('slug').eq('slug', base).maybeSingle();
  return data ? `${base}-${nanoid(6).toLowerCase()}` : base;
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.text !== 'string' || !body.text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  // No login check -- see the module comment. All reads/writes go through
  // the service client since there's no INSERT policy for the anon role and
  // the draft isn't tied to a Postgres session at all.
  const serviceClient = getServiceClient();
  if (!serviceClient) {
    return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });
  }

  const extraction = await extractRecipeFromText(body.text, body.sourceUrl);
  if (extraction.error) {
    return NextResponse.json({ error: extraction.error }, { status: ERROR_STATUS[extraction.error] ?? 500 });
  }

  const { recipe, confidence } = extraction;

  const [{ data: canonicalIngredients }, { data: aliasRows }, { data: conversionRows }] = await Promise.all([
    serviceClient.from('canonical_ingredients').select('id, name, standard_unit'),
    serviceClient.from('ingredient_aliases').select('alias, canonical_id'),
    serviceClient.from('ingredient_conversions').select('canonical_id, from_unit, to_unit, multiplier, is_estimate'),
  ]);

  const aliasMap = buildAliasMap(aliasRows);
  const conversions = buildConversionMap(conversionRows ?? []);
  const canonicalCtx = canonicalIngredients ?? [];

  const slug = await uniqueSlug(serviceClient, recipe.name);
  const reviewToken = nanoid(24);

  const { data: inserted, error: insertError } = await serviceClient
    .from('recipes')
    .insert({
      slug,
      title: recipe.name,
      description: recipe.description || null,
      source_url: body.sourceUrl || null,
      category: recipe.category,
      total_minutes: recipe.totalMinutes,
      servings: recipe.servings,
      dietary_tags: recipe.dietaryTags,
      instructions: recipe.instructions,
      is_published: false,
      review_token: reviewToken,
      import_confidence: confidence,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('[/api/recipes/import] Failed to insert recipe:', insertError.message);
    return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
  }

  const ingredientRows = recipe.ingredients
    .map((raw) => {
      const parsed = parseIngredientString(raw);
      if (!parsed) return null; // section header line, e.g. "Sauce:"

      const resolution = resolveIngredientLine(raw, { canonicalIngredients: canonicalCtx, aliasMap, conversions });
      return {
        recipe_id: inserted.id,
        canonical_id: resolution.resolved ? resolution.canonicalId : null,
        quantity: parsed.quantity,
        unit: parsed.unit,
        ingredient_name: parsed.name,
        raw_text: raw,
      };
    })
    .filter(Boolean);

  if (ingredientRows.length > 0) {
    const { error: ingredientsError } = await serviceClient.from('recipe_ingredients').insert(ingredientRows);
    if (ingredientsError) {
      console.error('[/api/recipes/import] Failed to insert ingredients:', ingredientsError.message);
      await serviceClient.from('recipes').delete().eq('id', inserted.id);
      return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
    }
  }

  return NextResponse.json({ recipeId: inserted.id, slug, confidence, reviewToken });
}
