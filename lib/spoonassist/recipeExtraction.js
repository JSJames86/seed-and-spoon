// ---------------------------------------------------------------------------
// "Share a recipe" import -- turn a pasted social-media caption (Instagram/
// TikTok/anywhere else, often full of hashtags, emoji, and marketing copy)
// into a structured recipe via Claude, for components/spoonassist/ImportRecipe.jsx
// and app/api/recipes/import/route.js.
//
// Uses forced tool-use so the model's response is always well-formed JSON
// instead of prose we'd have to parse. found:false means the model looked
// and there just isn't a recipe in the text (no ingredient list at all).
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';

const RECORD_RECIPE_TOOL = {
  name: 'record_recipe',
  description:
    'Records the recipe extracted from the pasted text, or reports that no recipe was present.',
  input_schema: {
    type: 'object',
    properties: {
      found: {
        type: 'boolean',
        description: 'True only if the text contains an actual recipe: a dish plus at least one ingredient.',
      },
      name: { type: 'string', description: 'The recipe/dish name.' },
      description: {
        type: 'string',
        description: 'A one-sentence teaser describing the dish. Empty string if none is implied by the text.',
      },
      servings: { type: 'integer', description: 'Number of servings. 4 if not stated.' },
      total_minutes: { type: 'integer', description: 'Total prep + cook time in minutes. 0 if unknown.' },
      category: {
        type: 'string',
        description: 'Best-fit category, e.g. "Main Dishes", "Sides", "Breakfast", "Desserts", "Snacks".',
      },
      dietary_tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dietary tags implied by the recipe, e.g. "vegetarian", "gluten-free". Empty array if none.',
      },
      ingredients: {
        type: 'array',
        items: { type: 'string' },
        description: 'One ingredient per entry, as written in the source, e.g. "2 cups flour", "1 tsp salt".',
      },
      instructions: {
        type: 'array',
        items: { type: 'string' },
        description: 'One instruction step per entry, in order.',
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low'],
        description:
          'high: a clear, complete ingredient list and steps were present. medium: some quantities/steps were ' +
          'implied or had to be inferred. low: the ingredient list or steps were incomplete or required substantial guessing.',
      },
    },
    required: ['found', 'name', 'ingredients', 'instructions', 'confidence'],
  },
};

function buildPrompt(text, sourceUrl) {
  const sourceLine = sourceUrl ? `\n\nSource link (context only, do not fetch it): ${sourceUrl}` : '';
  return (
    'The following text was pasted from a social media caption or post. Extract the recipe it describes, ' +
    'if any, by calling record_recipe. Ignore hashtags, emoji, calls-to-action, and unrelated marketing copy. ' +
    'Do not invent ingredients or steps that are not implied by the text.' +
    sourceLine +
    `\n\n---\n${text}\n---`
  );
}

/**
 * @param {string} text pasted caption/description text
 * @param {string} [sourceUrl]
 * @returns {Promise<
 *   {recipe: {name:string, description:string, servings:number, totalMinutes:number,
 *             category:string, dietaryTags:string[], ingredients:string[], instructions:string[]},
 *    confidence:'high'|'medium'|'low'}
 *   | {error: 'not_configured'|'no_recipe_found'|'extraction_failed'}
 * >}
 */
export async function extractRecipeFromText(text, sourceUrl) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: 'not_configured' };

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [RECORD_RECIPE_TOOL],
      tool_choice: { type: 'tool', name: 'record_recipe' },
      messages: [{ role: 'user', content: buildPrompt(text, sourceUrl) }],
    });
  } catch (err) {
    console.error('[recipeExtraction] Claude request failed:', err.message);
    return { error: 'extraction_failed' };
  }

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse) return { error: 'extraction_failed' };

  const data = toolUse.input;
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients.filter(Boolean) : [];
  const instructions = Array.isArray(data.instructions) ? data.instructions.filter(Boolean) : [];

  if (!data.found || !data.name || ingredients.length === 0) {
    return { error: 'no_recipe_found' };
  }

  return {
    recipe: {
      name: data.name,
      description: data.description || '',
      servings: Number.isFinite(data.servings) && data.servings > 0 ? Math.round(data.servings) : 4,
      totalMinutes: Number.isFinite(data.total_minutes) && data.total_minutes > 0 ? Math.round(data.total_minutes) : null,
      category: data.category || null,
      dietaryTags: Array.isArray(data.dietary_tags) ? data.dietary_tags.filter(Boolean) : [],
      ingredients,
      instructions,
    },
    confidence: ['high', 'medium', 'low'].includes(data.confidence) ? data.confidence : 'medium',
  };
}
