import { expect, test, describe } from 'bun:test';
import { extractRecipeFromHtml } from '../../lib/spoonassist/recipeImport.js';

function htmlWithJsonLd(...blocks) {
  const scripts = blocks
    .map(b => `<script type="application/ld+json">${b}</script>`)
    .join('\n');
  return `<!DOCTYPE html><html><head>${scripts}</head><body></body></html>`;
}

describe('extractRecipeFromHtml', () => {
  test('extracts a simple schema.org Recipe node', () => {
    const html = htmlWithJsonLd(JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: 'Rice and Beans',
      recipeIngredient: ['1 cup rice', '1 can black beans'],
      recipeYield: '4 servings',
      image: 'https://example.com/rice-and-beans.jpg',
    }));

    expect(extractRecipeFromHtml(html)).toEqual({
      name: 'Rice and Beans',
      recipeIngredient: ['1 cup rice', '1 can black beans'],
      servings: 4,
      image: 'https://example.com/rice-and-beans.jpg',
    });
  });

  test('finds a Recipe node nested inside @graph', () => {
    const html = htmlWithJsonLd(JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: 'Some Recipe Blog' },
        {
          '@type': ['Recipe'],
          name: 'Chicken Thigh Bake',
          recipeIngredient: ['2 lb chicken thighs', '1 onion'],
          recipeYield: 4,
          image: { url: 'https://example.com/chicken.jpg' },
        },
      ],
    }));

    expect(extractRecipeFromHtml(html)).toEqual({
      name: 'Chicken Thigh Bake',
      recipeIngredient: ['2 lb chicken thighs', '1 onion'],
      servings: 4,
      image: 'https://example.com/chicken.jpg',
    });
  });

  test('skips malformed JSON-LD blocks and finds a valid Recipe in a later block', () => {
    const html = htmlWithJsonLd(
      '{ this is not valid json',
      JSON.stringify({ '@type': 'Recipe', name: 'Tuna Casserole', recipeIngredient: ['1 can tuna'] })
    );

    expect(extractRecipeFromHtml(html)).toEqual({
      name: 'Tuna Casserole',
      recipeIngredient: ['1 can tuna'],
      servings: null,
      image: null,
    });
  });

  test('handles an array of top-level JSON-LD nodes', () => {
    const html = htmlWithJsonLd(JSON.stringify([
      { '@type': 'BreadcrumbList', itemListElement: [] },
      { '@type': 'Recipe', name: 'Veggie Stir Fry', recipeIngredient: ['2 cups frozen mixed vegetables'], recipeYield: ['6 servings'] },
    ]));

    expect(extractRecipeFromHtml(html)).toEqual({
      name: 'Veggie Stir Fry',
      recipeIngredient: ['2 cups frozen mixed vegetables'],
      servings: 6,
      image: null,
    });
  });

  test('takes the first image when image is an array', () => {
    const html = htmlWithJsonLd(JSON.stringify({
      '@type': 'Recipe',
      name: 'Apple Oat Bake',
      recipeIngredient: ['2 apples', '1 cup oats'],
      image: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    }));

    const result = extractRecipeFromHtml(html);
    expect(result.image).toBe('https://example.com/a.jpg');
  });

  test('returns null when no @type:Recipe node is present', () => {
    const html = htmlWithJsonLd(JSON.stringify({
      '@type': 'WebPage',
      name: 'Not a recipe',
    }));

    expect(extractRecipeFromHtml(html)).toBeNull();
  });

  test('returns null when recipeIngredient is missing or empty', () => {
    const html = htmlWithJsonLd(JSON.stringify({
      '@type': 'Recipe',
      name: 'Empty Recipe',
      recipeIngredient: [],
    }));

    expect(extractRecipeFromHtml(html)).toBeNull();
  });

  test('returns null for empty or non-string input', () => {
    expect(extractRecipeFromHtml('')).toBeNull();
    expect(extractRecipeFromHtml(null)).toBeNull();
    expect(extractRecipeFromHtml(undefined)).toBeNull();
  });

  test('returns null when the page has no JSON-LD scripts at all', () => {
    expect(extractRecipeFromHtml('<html><body><h1>No recipe here</h1></body></html>')).toBeNull();
  });

  test('trims whitespace from name and filters blank ingredient lines', () => {
    const html = htmlWithJsonLd(JSON.stringify({
      '@type': 'Recipe',
      name: '  Spaced Out Recipe  ',
      recipeIngredient: ['1 cup rice', '   ', '', '1 onion'],
    }));

    expect(extractRecipeFromHtml(html)).toEqual({
      name: 'Spaced Out Recipe',
      recipeIngredient: ['1 cup rice', '1 onion'],
      servings: null,
      image: null,
    });
  });
});
