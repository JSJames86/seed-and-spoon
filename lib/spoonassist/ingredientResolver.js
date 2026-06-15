// ---------------------------------------------------------------------------
// §9 "resolution seam" -- maps raw recipe-ingredient text (from a JSON-LD
// import, lib/spoonassist/recipeImport.js) onto canonical_ingredients, so an
// imported recipe can become a `pinnedRecipe` for
// lib/spoonassist/mealLeverageEngine.js.
//
// Three steps per ingredient line:
//
//   1. parseIngredientString() + normalizeIngredient() (both from
//      lib/spoonassist/priceEngine.js) turn "1 lb boneless chicken thighs"
//      into { quantity: 1, unit: 'lb', name: 'chicken thighs' } and then
//      "chicken thighs".
//   2. Match the normalized phrase to a canonical_ingredients row, first via
//      the ingredient_aliases table (for phrasing with no shared substring,
//      e.g. "scallion" -> "Onion"), then by substring containment against
//      canonical_ingredients.name (e.g. "chicken thigh" <-> "Chicken
//      Thighs").
//   3. Convert the parsed quantity/unit to the canonical's standard_unit
//      ('oz' or 'each') via the ingredient_conversions table -- identity if
//      the units already match.
//
// Lines that fail any step come back unresolved (with a `reason`) instead of
// throwing, so a partial import still produces a usable pinnedRecipe plus a
// short "we couldn't match these" list for the user.
// ---------------------------------------------------------------------------

import { parseIngredientString, normalizeIngredient } from './priceEngine.js';

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function findCanonicalBySubstring(normalized, canonicalIngredients) {
  for (const ci of canonicalIngredients) {
    const name = ci.name.toLowerCase();
    if (name.includes(normalized) || normalized.includes(name)) return ci;
  }
  return null;
}

/**
 * @param {number} quantity
 * @param {string} unit recipe-side unit, already normalized by
 *   parseIngredientString (e.g. 'lb', 'oz', 'cup', 'clove', 'each').
 * @param {{id:string, standard_unit:string}} canonical
 * @param {Map<string, {to_unit:string, multiplier:number, is_estimate:boolean}>} conversions
 *   keyed by `${canonicalId}|${fromUnit}`.
 * @returns {{amount:number, isEstimate:boolean}|null}
 */
function convertToStandardUnit(quantity, unit, canonical, conversions) {
  if (unit === canonical.standard_unit) {
    return { amount: round2(quantity), isEstimate: false };
  }
  const conv = conversions.get(`${canonical.id}|${unit}`);
  if (conv && conv.to_unit === canonical.standard_unit) {
    return { amount: round2(quantity * conv.multiplier), isEstimate: conv.is_estimate };
  }
  return null;
}

/**
 * Resolves a single raw recipe-ingredient line (e.g. "2 cups frozen mixed
 * vegetables") to a canonical_ingredients id + standard-unit quantity.
 *
 * @param {string} raw
 * @param {object} ctx
 * @param {{id:string, name:string, standard_unit:string}[]} ctx.canonicalIngredients
 * @param {Map<string,string>} ctx.aliasMap normalized alias -> canonical_id
 * @param {Map<string, {to_unit:string, multiplier:number, is_estimate:boolean}>} ctx.conversions
 * @returns {object} `{raw, resolved:true, canonicalId, name, amount, unit, isEstimate}`
 *   or `{raw, resolved:false, reason, ...}`.
 */
export function resolveIngredientLine(raw, { canonicalIngredients, aliasMap, conversions }) {
  const parsed = parseIngredientString(raw);
  if (!parsed) {
    return { raw, resolved: false, reason: 'unparsable' };
  }

  const normalized = normalizeIngredient(parsed.name);
  if (!normalized) {
    return { raw, resolved: false, reason: 'free_ingredient', parsed };
  }

  const aliasedId = aliasMap.get(normalized);
  const canonical = aliasedId
    ? canonicalIngredients.find(ci => ci.id === aliasedId)
    : findCanonicalBySubstring(normalized, canonicalIngredients);
  if (!canonical) {
    return { raw, resolved: false, reason: 'no_canonical_match', parsed, normalized };
  }

  const conversion = convertToStandardUnit(parsed.quantity, parsed.unit, canonical, conversions);
  if (!conversion) {
    return { raw, resolved: false, reason: 'no_unit_conversion', parsed, normalized, canonicalId: canonical.id };
  }

  return {
    raw,
    resolved: true,
    canonicalId: canonical.id,
    name: canonical.name,
    amount: conversion.amount,
    unit: canonical.standard_unit,
    isEstimate: conversion.isEstimate,
  };
}

/**
 * Resolves a full recipeIngredient[] list, merging lines that resolve to the
 * same canonical ingredient (e.g. two separate "onion" lines) by summing
 * their standard-unit amounts.
 *
 * @param {string[]} rawLines
 * @param {object} ctx see resolveIngredientLine
 * @returns {{
 *   ingredients: {id:string, name:string, amount:number, unit:string, isEstimate:boolean}[],
 *   unresolved: object[],
 * }}
 */
export function resolveRecipeIngredients(rawLines, ctx) {
  const resolved = new Map();
  const unresolved = [];

  for (const raw of rawLines) {
    const line = resolveIngredientLine(raw, ctx);
    if (!line.resolved) {
      unresolved.push(line);
      continue;
    }

    const existing = resolved.get(line.canonicalId);
    if (existing) {
      existing.amount = round2(existing.amount + line.amount);
      existing.isEstimate = existing.isEstimate || line.isEstimate;
    } else {
      resolved.set(line.canonicalId, {
        id: line.canonicalId,
        name: line.name,
        amount: line.amount,
        unit: line.unit,
        isEstimate: line.isEstimate,
      });
    }
  }

  return { ingredients: [...resolved.values()], unresolved };
}

/**
 * Builds the `Map<string, {to_unit, multiplier, is_estimate}>` resolveIngredientLine
 * expects from raw ingredient_conversions rows.
 * @param {{canonical_id:string, from_unit:string, to_unit:string, multiplier:number, is_estimate:boolean}[]} rows
 */
export function buildConversionMap(rows) {
  return new Map((rows ?? []).map(r => [`${r.canonical_id}|${r.from_unit}`, {
    to_unit: r.to_unit,
    multiplier: r.multiplier,
    is_estimate: r.is_estimate,
  }]));
}

/**
 * Builds the `Map<alias, canonical_id>` resolveIngredientLine expects from
 * raw ingredient_aliases rows.
 * @param {{alias:string, canonical_id:string}[]} rows
 */
export function buildAliasMap(rows) {
  return new Map((rows ?? []).map(r => [r.alias, r.canonical_id]));
}
