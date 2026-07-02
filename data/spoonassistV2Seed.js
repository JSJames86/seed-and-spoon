/**
 * Static seed data for the SpoonAssist v2 shell (Phase 1).
 *
 * Phase 1 ships the app shell with static/seed data only — the recipes
 * schema migration, discovery grid, and real cost-per-serving/leverage
 * calculations land in Phase 2/3 (see the SpoonAssist v2 spec). Titles and
 * images below are pulled from the existing `data/recipes.js` catalog;
 * cost/time/leverage figures are illustrative placeholders.
 */

export const seedRecipes = [
  {
    slug: 'cranberry-orange-sauce',
    title: 'Cranberry Orange Sauce',
    image: '/images/recipes/cranberry-orange-sauce.jpg',
    costPerServing: 0.62,
    totalMinutes: 20,
    leverage: 6.1,
  },
  {
    slug: 'sausage-apple-stuffing',
    title: 'Sausage and Apple Stuffing',
    image: '/images/recipes/sausage-apple-stuffing.png',
    costPerServing: 1.84,
    totalMinutes: 65,
    leverage: 8.3,
  },
  {
    slug: 'mashed-potatoes',
    title: 'Homemade Mashed Potatoes',
    image: '/images/recipes/mashed-potatoes.jpeg',
    costPerServing: 0.71,
    totalMinutes: 30,
    leverage: 7.4,
  },
  {
    slug: 'janelle-green-beans',
    title: "Janelle's Southern Green Beans",
    image: '/images/recipes/green-beans.jpeg',
    costPerServing: 0.95,
    totalMinutes: 115,
    leverage: 5.9,
  },
  {
    slug: 'moist-jiffy-cornbread',
    title: 'Moist Jiffy Cornbread with Cinnamon Honey Butter',
    image: '/images/recipes/moist-cornbread.png',
    costPerServing: 0.48,
    totalMinutes: 32,
    leverage: 6.8,
  },
  {
    slug: 'cajun-turkey',
    title: 'Cajun Turkey',
    image: '/images/recipes/cajun-turkey.png',
    costPerServing: 2.35,
    totalMinutes: 270,
    leverage: 4.2,
  },
  {
    slug: 'creamy-lemon-chicken-orzo',
    title: 'Creamy Lemon Chicken Orzo',
    image: null,
    costPerServing: 2.1,
    totalMinutes: 40,
    leverage: 7.9,
  },
  {
    slug: 'chicken-broccoli-stir-fry',
    title: 'Chicken and Broccoli Stir-Fry',
    image: null,
    costPerServing: 1.98,
    totalMinutes: 30,
    leverage: 8.6,
  },
];

export const savingsCarousel = seedRecipes.slice(0, 4);
export const highLeverageCarousel = [...seedRecipes].sort((a, b) => b.leverage - a.leverage).slice(0, 4);
export const newarkFavoritesCarousel = [seedRecipes[3], seedRecipes[4], seedRecipes[1], seedRecipes[0]];

export const seedCoverageSnapshot = {
  mealsPlanned: 12,
  mealsTotal: 21,
  estCostCents: 6140,
  leverage: 7.2,
};

export const seedHousehold = {
  size: 4,
  weeklyBudgetCents: 8500,
  dietaryTags: ['vegetarian'],
};

export const dietaryOptions = [
  'Vegetarian',
  'Halal',
  'No pork',
  'Dairy-free',
  'Nut allergy',
];
