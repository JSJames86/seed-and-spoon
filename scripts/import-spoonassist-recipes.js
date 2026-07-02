/**
 * SpoonAssist v2 -- Editorial Recipe Catalog Import
 *
 * Upserts data/recipes.js into the `recipes` / `recipe_ingredients` tables
 * (extended by supabase/migrations/20260701100001_spoonassist_v2_recipe_catalog.sql)
 * so the /spoonassist/recipes discovery grid and recipe detail page have
 * real data to read instead of the Phase 1 static seed set.
 *
 * These are editorial catalog recipes, not MLE/coverage-engine corpus
 * recipes (nutrition stays NULL) -- recipe_ingredients keep the recipe's own
 * quantity/unit (e.g. "3/4 cup water"), not a canonical standard_unit
 * conversion. canonical_id is attached via lib/spoonassist/ingredientResolver.js
 * where a match exists (best-effort; unmatched ingredients still import,
 * just without a canonical link).
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   node scripts/import-spoonassist-recipes.js
 *   node scripts/import-spoonassist-recipes.js --dry-run
 */

import { recipes as sourceRecipes } from '../data/recipes.js';
import { getServiceClient, parseIngredientString } from '../lib/spoonassist/priceEngine.js';
import { resolveIngredientLine, buildAliasMap, buildConversionMap } from '../lib/spoonassist/ingredientResolver.js';

const DRY_RUN = process.argv.includes('--dry-run');

function parseTotalMinutes(recipe) {
  const prepMatch = /^(\d+)/.exec(recipe.prepTime || '');
  const prep = prepMatch ? parseInt(prepMatch[1], 10) : 0;
  const cook = Number.isFinite(recipe.cookTimeMinutes) ? recipe.cookTimeMinutes : 0;
  const total = prep + cook;
  return total > 0 ? total : null;
}

function parseBaseServings(recipe) {
  const match = /^(\d+(\.\d+)?)/.exec(recipe.servings || '');
  if (!match) return 4;
  const n = Math.round(parseFloat(match[1]));
  return n > 0 ? n : 4;
}

async function main() {
  const client = getServiceClient();
  if (!client) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -- cannot import.');
    process.exit(1);
  }

  const [{ data: canonicalIngredients, error: ciErr }, { data: aliasRows, error: aliasErr }, { data: conversionRows, error: convErr }] =
    await Promise.all([
      client.from('canonical_ingredients').select('id, name, standard_unit'),
      client.from('ingredient_aliases').select('alias, canonical_id'),
      client.from('ingredient_conversions').select('canonical_id, from_unit, to_unit, multiplier, is_estimate'),
    ]);

  if (ciErr || aliasErr || convErr) {
    console.error('Failed to load resolver context:', ciErr || aliasErr || convErr);
    process.exit(1);
  }

  const aliasMap = buildAliasMap(aliasRows);
  const conversions = buildConversionMap(conversionRows);

  let resolvedCount = 0;
  let unresolvedCount = 0;

  for (const recipe of sourceRecipes) {
    const row = {
      slug: recipe.slug,
      title: recipe.title,
      description: recipe.description || null,
      image_url: recipe.image || null,
      category: recipe.category || null,
      source_url: null,
      servings: parseBaseServings(recipe),
      total_minutes: parseTotalMinutes(recipe),
      dietary_tags: recipe.tags || [],
      is_published: true,
    };

    if (DRY_RUN) {
      console.log(`[dry-run] would upsert recipe "${row.title}" (${row.slug})`);
    } else {
      const { data: upserted, error: upsertErr } = await client
        .from('recipes')
        .upsert(row, { onConflict: 'slug' })
        .select('id')
        .single();

      if (upsertErr) {
        console.error(`Failed to upsert "${row.title}":`, upsertErr.message);
        continue;
      }

      const recipeId = upserted.id;

      const ingredientRows = [];
      for (const raw of recipe.ingredients || []) {
        const parsed = parseIngredientString(raw);
        if (!parsed) continue; // section header line, e.g. "Filling:"

        const resolution = resolveIngredientLine(raw, { canonicalIngredients, aliasMap, conversions });
        if (resolution.resolved) resolvedCount += 1;
        else unresolvedCount += 1;

        ingredientRows.push({
          recipe_id: recipeId,
          canonical_id: resolution.resolved ? resolution.canonicalId : null,
          quantity: parsed.quantity,
          unit: parsed.unit,
          ingredient_name: parsed.name,
          raw_text: raw,
        });
      }

      const { error: deleteErr } = await client.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
      if (deleteErr) {
        console.error(`Failed to clear old ingredients for "${row.title}":`, deleteErr.message);
        continue;
      }

      if (ingredientRows.length > 0) {
        const { error: insertErr } = await client.from('recipe_ingredients').insert(ingredientRows);
        if (insertErr) {
          console.error(`Failed to insert ingredients for "${row.title}":`, insertErr.message);
          continue;
        }
      }

      console.log(`Imported "${row.title}" (${ingredientRows.length} ingredients)`);
    }
  }

  if (!DRY_RUN) {
    console.log(`\nDone. ${sourceRecipes.length} recipes processed. Ingredients: ${resolvedCount} resolved to a canonical ingredient, ${unresolvedCount} raw-text only.`);
  }
}

main();
