import { createClient } from '@supabase/supabase-js';
import { fetchKrogerPrice, getKrogerStoresNearZip } from './krogerClient.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STRIP_WORDS = new Set([
  'fresh', 'dried', 'frozen', 'canned', 'organic', 'raw',
  'unsalted', 'salted', 'low-sodium', 'reduced-sodium', 'no-salt',
  'large', 'small', 'medium', 'extra-large',
  'whole', 'half', 'ground', 'chopped', 'diced', 'minced', 'sliced',
  'peeled', 'cored', 'trimmed', 'shredded', 'grated', 'crushed', 'crumbled',
  'lightly', 'beaten', 'softened', 'melted', 'cooled',
  'boneless', 'skinless', 'lean',
  'all-purpose', 'self-rising',
  'instant', 'regular',
  'low-fat', 'fat-free', 'full-fat', 'heavy', 'light',
  'italian', 'cajun', 'southern', 'herb-seasoned',
  'extra-virgin', 'virgin', 'pure',
  'packed', 'unpacked',
  'cooked', 'uncooked', 'baked', 'unbaked', 'deep-dish',
  'mashed', 'boiled', 'steamed', 'roasted',
  'optional', 'deveined', 'shelled', 'seedless',
]);

// Compound phrases that must be preserved before single-word stripping
const COMPOUND_KEEP = [
  'hot sauce', 'chicken broth', 'chicken stock', 'beef broth', 'vegetable broth',
  'turkey broth', 'turkey stock',
  'orange juice', 'apple juice', 'lemon juice',
  'corn syrup', 'brown sugar',
  'baking powder', 'baking soda',
  'vanilla extract',
  'olive oil', 'vegetable oil', 'coconut oil', 'canola oil',
  'sour cream', 'cream cheese', 'heavy cream', 'half-and-half',
  'garlic powder', 'onion powder',
  'cayenne pepper', 'black pepper', 'white pepper', 'red pepper',
  'smoked paprika',
  'worcestershire sauce',
  'cajun seasoning', 'all-purpose seasoning',
  'pie crust', 'gravy mix', 'pudding mix', 'cornbread mix', 'stuffing mix',
  'turkey leg', 'turkey neck', 'turkey dripping', 'pan dripping',
  'chicken breast', 'chicken thigh', 'chicken wing',
  'sweet potato', 'green bean', 'green onion',
  'kosher salt', 'sea salt',
];

// Standard brand names to strip
const BRAND_WORDS = [
  'mccormick', 'jiffy', 'louisiana-style', 'louisiana',
  'granny smith', 'russet', 'yukon gold', 'yukon',
  'heinz', 'lea', 'perrins',
];

// Unit normalisation map
const UNIT_NORM = {
  cups: 'cup', tablespoon: 'tbsp', tablespoons: 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp',
  ounce: 'oz', ounces: 'oz',
  pound: 'lb', pounds: 'lb', lbs: 'lb',
  gram: 'g', grams: 'g',
  kilogram: 'kg', kilograms: 'kg',
  packets: 'packet', boxes: 'box', cans: 'can',
  bunches: 'bunch', cloves: 'clove', sticks: 'stick',
};

// Weight/volume to fluid-oz conversion (used for price-per-oz calculations)
const TO_OZ = {
  oz: 1, lb: 16, cup: 8, tbsp: 0.5, tsp: 0.167,
  g: 0.0353, kg: 35.27, ml: 0.0338, l: 33.8,
  pinch: 0.02, dash: 0.02,
};

// Aliases applied after normalization (post-strip, post-plural)
const ALIASES = {
  'chicken stock': 'chicken broth',
  'turkey stock': 'chicken broth',
  'beef stock': 'chicken broth',
  'vegetable stock': 'chicken broth',
  'stock': 'chicken broth',
  'broth': 'chicken broth',
  'italian sausage': 'sausage',
  'corn muffin mix': 'cornbread mix',
  'vanilla pudding mix': 'pudding mix',
  'turkey gravy mix': 'gravy mix',
  'kosher salt': 'salt',
  'sea salt': 'salt',
  'ground black pepper': 'pepper',
  'black pepper': 'pepper',
  'white pepper': 'pepper',
  'smoked paprika': 'paprika',
  'sweet paprika': 'paprika',
  'buttermilk': 'milk',
  'half and half': 'half-and-half',
  'all-purpose seasoning': 'cajun seasoning',
  // free ingredients (rendered as $0)
  'water': 'water',
  'ice': 'water',
  'pan dripping': null,
  'turkey dripping': null,
  'dripping': null,
  'zest': 'orange',
  'orange zest': 'orange',
  'lemon zest': 'lemon',
};

// ---------------------------------------------------------------------------
// USDA NJ regional baseline prices
// pkg = typical retail price, pkgQty + pkgUnit = package contents
// ---------------------------------------------------------------------------
const USDA_BASELINE = {
  // Produce
  'apple':              { pkg: 1.49, pkgQty: 16,  pkgUnit: 'oz' },
  'orange':             { pkg: 1.29, pkgQty: 1,   pkgUnit: 'each' },
  'orange juice':       { pkg: 3.49, pkgQty: 52,  pkgUnit: 'oz' },
  'lemon':              { pkg: 0.89, pkgQty: 1,   pkgUnit: 'each' },
  'lime':               { pkg: 0.59, pkgQty: 1,   pkgUnit: 'each' },
  'cranberry':          { pkg: 3.49, pkgQty: 12,  pkgUnit: 'oz' },
  'sweet potato':       { pkg: 1.29, pkgQty: 16,  pkgUnit: 'oz' },
  'potato':             { pkg: 3.99, pkgQty: 80,  pkgUnit: 'oz' },
  'green bean':         { pkg: 1.99, pkgQty: 16,  pkgUnit: 'oz' },
  'onion':              { pkg: 0.99, pkgQty: 1,   pkgUnit: 'each' },
  'celery':             { pkg: 1.99, pkgQty: 1,   pkgUnit: 'each' },
  'garlic':             { pkg: 0.89, pkgQty: 1,   pkgUnit: 'each' },
  'tomato':             { pkg: 1.49, pkgQty: 1,   pkgUnit: 'each' },
  'carrot':             { pkg: 1.49, pkgQty: 16,  pkgUnit: 'oz' },
  'banana':             { pkg: 0.29, pkgQty: 1,   pkgUnit: 'each' },
  'avocado':            { pkg: 1.49, pkgQty: 1,   pkgUnit: 'each' },
  'spinach':            { pkg: 3.99, pkgQty: 5,   pkgUnit: 'oz' },
  'mushroom':           { pkg: 2.99, pkgQty: 8,   pkgUnit: 'oz' },
  'bell pepper':        { pkg: 1.29, pkgQty: 1,   pkgUnit: 'each' },
  'zucchini':           { pkg: 1.29, pkgQty: 16,  pkgUnit: 'oz' },
  'broccoli':           { pkg: 1.99, pkgQty: 1,   pkgUnit: 'each' },
  // Dairy
  'butter':             { pkg: 5.99, pkgQty: 16,  pkgUnit: 'oz' },
  'milk':               { pkg: 3.99, pkgQty: 64,  pkgUnit: 'oz' },
  'half-and-half':      { pkg: 3.49, pkgQty: 16,  pkgUnit: 'oz' },
  'sour cream':         { pkg: 2.29, pkgQty: 16,  pkgUnit: 'oz' },
  'cream cheese':       { pkg: 2.49, pkgQty: 8,   pkgUnit: 'oz' },
  'heavy cream':        { pkg: 3.99, pkgQty: 16,  pkgUnit: 'oz' },
  'egg':                { pkg: 3.99, pkgQty: 12,  pkgUnit: 'each' },
  'cheddar cheese':     { pkg: 3.99, pkgQty: 8,   pkgUnit: 'oz' },
  'parmesan':           { pkg: 3.99, pkgQty: 6,   pkgUnit: 'oz' },
  'mozzarella':         { pkg: 3.49, pkgQty: 8,   pkgUnit: 'oz' },
  'yogurt':             { pkg: 1.29, pkgQty: 6,   pkgUnit: 'oz' },
  // Meat & Poultry
  'turkey':             { pkg: 1.49, pkgQty: 16,  pkgUnit: 'oz' },
  'chicken':            { pkg: 5.99, pkgQty: 48,  pkgUnit: 'oz' },
  'chicken breast':     { pkg: 7.99, pkgQty: 48,  pkgUnit: 'oz' },
  'chicken broth':      { pkg: 2.49, pkgQty: 32,  pkgUnit: 'oz' },
  'beef':               { pkg: 5.99, pkgQty: 16,  pkgUnit: 'oz' },
  'ground beef':        { pkg: 5.49, pkgQty: 16,  pkgUnit: 'oz' },
  'pork':               { pkg: 3.99, pkgQty: 16,  pkgUnit: 'oz' },
  'sausage':            { pkg: 4.99, pkgQty: 16,  pkgUnit: 'oz' },
  'bacon':              { pkg: 6.99, pkgQty: 16,  pkgUnit: 'oz' },
  'ham':                { pkg: 4.99, pkgQty: 16,  pkgUnit: 'oz' },
  'shrimp':             { pkg: 8.99, pkgQty: 16,  pkgUnit: 'oz' },
  // Pantry / Dry Goods
  'sugar':              { pkg: 2.99, pkgQty: 32,  pkgUnit: 'oz' },
  'brown sugar':        { pkg: 2.49, pkgQty: 32,  pkgUnit: 'oz' },
  'powdered sugar':     { pkg: 2.49, pkgQty: 32,  pkgUnit: 'oz' },
  'flour':              { pkg: 3.49, pkgQty: 80,  pkgUnit: 'oz' },
  'cornstarch':         { pkg: 1.99, pkgQty: 16,  pkgUnit: 'oz' },
  'corn syrup':         { pkg: 3.49, pkgQty: 16,  pkgUnit: 'oz' },
  'honey':              { pkg: 4.99, pkgQty: 12,  pkgUnit: 'oz' },
  'maple syrup':        { pkg: 7.99, pkgQty: 12,  pkgUnit: 'oz' },
  'olive oil':          { pkg: 6.99, pkgQty: 17,  pkgUnit: 'oz' },
  'vegetable oil':      { pkg: 3.99, pkgQty: 48,  pkgUnit: 'oz' },
  'vinegar':            { pkg: 2.49, pkgQty: 16,  pkgUnit: 'oz' },
  'water':              { pkg: 0.01, pkgQty: 128, pkgUnit: 'oz' },
  // Spices & Seasonings
  'salt':               { pkg: 1.29, pkgQty: 26,  pkgUnit: 'oz' },
  'pepper':             { pkg: 2.99, pkgQty: 3.37,pkgUnit: 'oz' },
  'cinnamon':           { pkg: 2.99, pkgQty: 2.37,pkgUnit: 'oz' },
  'paprika':            { pkg: 2.99, pkgQty: 2.12,pkgUnit: 'oz' },
  'cumin':              { pkg: 2.99, pkgQty: 2.12,pkgUnit: 'oz' },
  'oregano':            { pkg: 2.99, pkgQty: 0.75,pkgUnit: 'oz' },
  'thyme':              { pkg: 2.99, pkgQty: 0.75,pkgUnit: 'oz' },
  'sage':               { pkg: 2.99, pkgQty: 0.75,pkgUnit: 'oz' },
  'rosemary':           { pkg: 2.99, pkgQty: 0.75,pkgUnit: 'oz' },
  'basil':              { pkg: 2.99, pkgQty: 0.5, pkgUnit: 'oz' },
  'cayenne':            { pkg: 2.99, pkgQty: 1.75,pkgUnit: 'oz' },
  'garlic powder':      { pkg: 2.99, pkgQty: 3.12,pkgUnit: 'oz' },
  'onion powder':       { pkg: 2.99, pkgQty: 2.62,pkgUnit: 'oz' },
  'nutmeg':             { pkg: 3.49, pkgQty: 1.1, pkgUnit: 'oz' },
  'vanilla extract':    { pkg: 4.99, pkgQty: 2,   pkgUnit: 'oz' },
  'baking powder':      { pkg: 2.49, pkgQty: 8.1, pkgUnit: 'oz' },
  'baking soda':        { pkg: 1.29, pkgQty: 16,  pkgUnit: 'oz' },
  'cajun seasoning':    { pkg: 2.99, pkgQty: 2,   pkgUnit: 'oz' },
  // Sauces & Condiments
  'worcestershire sauce': { pkg: 2.99, pkgQty: 10, pkgUnit: 'oz' },
  'hot sauce':          { pkg: 3.49, pkgQty: 12,  pkgUnit: 'oz' },
  'soy sauce':          { pkg: 2.99, pkgQty: 10,  pkgUnit: 'oz' },
  'ketchup':            { pkg: 2.99, pkgQty: 20,  pkgUnit: 'oz' },
  'mustard':            { pkg: 1.99, pkgQty: 8,   pkgUnit: 'oz' },
  // Canned / Packaged
  'stuffing':           { pkg: 3.49, pkgQty: 12,  pkgUnit: 'oz' },
  'cornbread mix':      { pkg: 1.19, pkgQty: 8.5, pkgUnit: 'oz' },
  'pudding mix':        { pkg: 1.49, pkgQty: 3.9, pkgUnit: 'oz' },
  'gravy mix':          { pkg: 1.29, pkgQty: 0.87,pkgUnit: 'oz' },
  'pie crust':          { pkg: 3.49, pkgQty: 1,   pkgUnit: 'each' },
  'pasta':              { pkg: 1.49, pkgQty: 16,  pkgUnit: 'oz' },
  'rice':               { pkg: 2.99, pkgQty: 32,  pkgUnit: 'oz' },
  'oats':               { pkg: 3.99, pkgQty: 42,  pkgUnit: 'oz' },
  'breadcrumb':         { pkg: 2.49, pkgQty: 15,  pkgUnit: 'oz' },
  // Nuts
  'pecan':              { pkg: 6.99, pkgQty: 16,  pkgUnit: 'oz' },
  'walnut':             { pkg: 5.99, pkgQty: 16,  pkgUnit: 'oz' },
  'almond':             { pkg: 7.99, pkgQty: 16,  pkgUnit: 'oz' },
  'peanut':             { pkg: 3.99, pkgQty: 16,  pkgUnit: 'oz' },
  'cashew':             { pkg: 8.99, pkgQty: 16,  pkgUnit: 'oz' },
};

// ---------------------------------------------------------------------------
// Universal chain registry — stores available anywhere with estimated prices.
// These supplement Kroger live stores and serve as the full list for regions
// (like NJ) where Kroger has no presence.
// Chain-specific APIs can be wired in here as they become available.
// ---------------------------------------------------------------------------

const UNIVERSAL_CHAINS = [
  { id: 'walmart',     name: 'Walmart',          priceMultiplier: 0.82 },
  { id: 'aldi',        name: 'ALDI',             priceMultiplier: 0.78 },
  { id: 'target',      name: 'Target',           priceMultiplier: 1.05 },
  { id: 'wholefoods',  name: 'Whole Foods',      priceMultiplier: 1.35 },
  { id: 'traderjoes',  name: "Trader Joe's",     priceMultiplier: 0.95 },
];

// NJ-specific chains — primary audience of the Seed & Spoon nonprofit.
// Shown for NJ ZIPs (07x, 08x) when Kroger returns no results.
const NJ_CHAINS = [
  { id: 'shoprite',    name: 'ShopRite',         priceMultiplier: 1.00 },
  { id: 'stopshop',    name: 'Stop & Shop',      priceMultiplier: 1.08 },
  { id: 'wegmans',     name: 'Wegmans',          priceMultiplier: 1.10 },
  { id: 'pricerite',   name: 'Price Rite',       priceMultiplier: 0.80 },
];

// Flat lookup for getStoreById — includes all universal + NJ chains.
// Kroger dynamic stores (id: 'kroger-{locationId}') are handled separately.
const STATIC_STORE_REGISTRY = Object.fromEntries(
  [...UNIVERSAL_CHAINS, ...NJ_CHAINS].map(s => [s.id, s])
);

// ---------------------------------------------------------------------------
// Ingredient parser  (mirrors RecipeTextInput logic for server-side use)
// ---------------------------------------------------------------------------

const PARSE_UNITS = [
  'cups', 'cup', 'tablespoons', 'tablespoon', 'tbsp', 'teaspoons', 'teaspoon', 'tsp',
  'ounces', 'ounce', 'oz', 'pounds', 'pound', 'lbs', 'lb',
  'grams', 'gram', 'g', 'kilograms', 'kilogram', 'kg',
  'packets', 'packet', 'boxes', 'box', 'cans', 'can',
  'bunches', 'bunch', 'cloves', 'clove', 'sticks', 'stick',
  'pinch', 'dash',
];

const UNICODE_FRACTIONS = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667, '⅛': 0.125 };

export function parseIngredientString(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let s = raw.trim();

  // Skip header lines (e.g. "Sweet Potato Filling:")
  if (s.endsWith(':')) return null;

  // Replace unicode fractions
  for (const [frac, val] of Object.entries(UNICODE_FRACTIONS)) {
    s = s.replace(new RegExp(frac, 'g'), ` ${val}`);
  }

  // Parse leading quantity
  let quantity = 1;
  const mixedMatch = s.match(/^(\d+)\s+(\d+)\/(\d+)/);
  const fracMatch  = s.match(/^(\d+)\/(\d+)/);
  const numMatch   = s.match(/^(\d+\.?\d*)/);

  if (mixedMatch) {
    quantity = parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
    s = s.slice(mixedMatch[0].length).trim();
  } else if (fracMatch) {
    quantity = parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
    s = s.slice(fracMatch[0].length).trim();
  } else if (numMatch) {
    quantity = parseFloat(numMatch[1]);
    s = s.slice(numMatch[0].length).trim();
  }

  // Parse unit
  let unit = 'each';
  const unitRe = new RegExp(`^(${PARSE_UNITS.join('|')})\\b`, 'i');
  const unitMatch = s.match(unitRe);
  if (unitMatch) {
    unit = UNIT_NORM[unitMatch[1].toLowerCase()] || unitMatch[1].toLowerCase();
    s = s.slice(unitMatch[0].length).trim();
  }

  // Clean ingredient name
  let name = s
    .split(',')[0]          // strip after comma
    .replace(/\(.*?\)/g, '') // strip parenthetical
    .replace(/\s+/g, ' ')
    .trim();

  if (!name) name = raw.trim();

  return { quantity: parseFloat(quantity.toFixed(3)), unit, name, raw };
}

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

export function normalizeIngredient(raw) {
  if (!raw || typeof raw !== 'string') return null;

  let name = raw.toLowerCase().trim();

  // Strip after comma
  name = name.split(',')[0].trim();

  // Handle "X or Y" — keep first option
  name = name.split(' or ')[0].trim();

  // Strip brand words
  for (const brand of BRAND_WORDS) {
    name = name.replace(new RegExp(`\\b${brand}\\b`, 'g'), '').trim();
  }

  // Preserve compound phrases
  for (const compound of COMPOUND_KEEP) {
    if (name.includes(compound)) return compound;
  }

  // Strip adjective words
  name = name.split(/\s+/).filter(w => !STRIP_WORDS.has(w)).join(' ').trim();

  // Plural → singular
  if (name.endsWith('ies') && name.length > 4) {
    name = name.slice(0, -3) + 'y';              // berries → berry
  } else if (name.endsWith('oes') && name.length > 4) {
    name = name.slice(0, -1);                     // potatoes → potato
  } else if (name.endsWith('s') && name.length > 3 && !name.endsWith('ss')) {
    name = name.slice(0, -1);                     // beans → bean, eggs → egg
  }

  // Apply aliases
  if (Object.prototype.hasOwnProperty.call(ALIASES, name)) {
    return ALIASES[name]; // may be null (free ingredient)
  }

  return name || null;
}

// ---------------------------------------------------------------------------
// Unit helpers
// ---------------------------------------------------------------------------

function toOz(qty, unit) {
  const u = (unit || '').toLowerCase();
  const factor = TO_OZ[u];
  if (!factor) return null;
  return qty * factor;
}

function priceFromPackage({ pkg, pkgQty, pkgUnit }, recipeQty, recipeUnit) {
  const ru = (recipeUnit || '').toLowerCase();

  // Both units are "each"
  if (pkgUnit === 'each' && (ru === 'each' || !ru)) {
    return recipeQty * pkg;
  }

  // Package sold per-each but recipe uses volume — just return one package price
  if (pkgUnit === 'each') return pkg;

  // Recipe uses "each" but package sold by weight — return base package price
  if (ru === 'each' || !ru) return pkg;

  const recipeOz = toOz(recipeQty, ru);
  const pkgOz    = toOz(pkgQty, pkgUnit);

  if (!recipeOz || !pkgOz) return pkg;

  // Linear: (fraction of package needed) × package price
  // Capped at 0 minimum; could exceed 1× if recipe calls for >1 package
  return Math.max((recipeOz / pkgOz) * pkg, 0);
}

// ---------------------------------------------------------------------------
// Baseline lookup (exact → partial)
// ---------------------------------------------------------------------------

function findBaseline(normalized) {
  if (!normalized) return null;
  if (USDA_BASELINE[normalized]) return USDA_BASELINE[normalized];

  for (const [key, value] of Object.entries(USDA_BASELINE)) {
    if (normalized.includes(key) || key.includes(normalized)) return value;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public: resolve price for a single ingredient
// ---------------------------------------------------------------------------

export async function resolveIngredientPrice(ingredientName, quantity, unit, storeMultiplier = 1.0, supabaseClient = null, locationId = null, zipCode = null) {
  const normalized = normalizeIngredient(ingredientName);

  if (normalized === null) {
    return { price: 0, confidence: 'free', normalized: ingredientName };
  }

  // Tier 1: Kroger live prices (uses locationId when available, ZIP as fallback)
  if (locationId || (process.env.KROGER_CLIENT_ID && process.env.KROGER_CLIENT_SECRET)) {
    try {
      const livePrice = await fetchKrogerPrice(normalized, quantity, unit, locationId, zipCode);
      if (livePrice !== null) {
        return { price: parseFloat((livePrice * storeMultiplier).toFixed(2)), confidence: 'live', normalized };
      }
    } catch { /* fall through */ }
  }

  // Tier 2: Supabase ingredient_mappings cache
  if (supabaseClient) {
    try {
      const { data } = await supabaseClient
        .from('ingredient_mappings')
        .select('pkg_price, pkg_qty, pkg_unit')
        .ilike('normalized_name', normalized)
        .maybeSingle();
      if (data) {
        const price = priceFromPackage(
          { pkg: data.pkg_price, pkgQty: data.pkg_qty, pkgUnit: data.pkg_unit },
          quantity, unit
        ) * storeMultiplier;
        return { price: parseFloat(price.toFixed(2)), confidence: 'cached', normalized };
      }
    } catch { /* fall through */ }
  }

  // Tier 3: Supabase community price_points
  if (supabaseClient) {
    try {
      const { data } = await supabaseClient
        .from('price_points')
        .select('price_cents, pkg_qty, pkg_unit')
        .ilike('ingredient', normalized)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data && data.length > 0) {
        const avgPricePerOz = data.reduce((sum, r) => {
          const pkgOz = toOz(r.pkg_qty, r.pkg_unit) || 1;
          return sum + (r.price_cents / 100) / pkgOz;
        }, 0) / data.length;
        const recipeOz = toOz(quantity, unit) || 1;
        const price = avgPricePerOz * recipeOz * storeMultiplier;
        return { price: parseFloat(price.toFixed(2)), confidence: 'community', normalized };
      }
    } catch { /* fall through */ }
  }

  // Tier 3: USDA NJ baseline
  const baseline = findBaseline(normalized);
  if (baseline) {
    const price = priceFromPackage(baseline, quantity, unit) * storeMultiplier;
    return { price: parseFloat(price.toFixed(2)), confidence: 'usda', normalized };
  }

  // Tier 4: Generic estimate ($2.99 per serving)
  return { price: parseFloat((2.99 * storeMultiplier).toFixed(2)), confidence: 'estimated', normalized };
}

// ---------------------------------------------------------------------------
// Public: store helpers
// ---------------------------------------------------------------------------

export async function getStoresByZip(zip) {
  if (!zip || zip.length < 5) return UNIVERSAL_CHAINS.slice(0, 5);

  const isNJ = zip.startsWith('07') || zip.startsWith('08');

  // Fetch Kroger-family stores near this ZIP (live API, cached per ZIP)
  const krogerStores = (process.env.KROGER_CLIENT_ID && process.env.KROGER_CLIENT_SECRET)
    ? await getKrogerStoresNearZip(zip, 3).catch(() => [])
    : [];

  // Supplemental chains: avoid duplicating any Kroger chain already returned
  const krogerNames  = new Set(krogerStores.map(s => s.name.toLowerCase()));
  const supplements  = (isNJ && krogerStores.length === 0 ? NJ_CHAINS : [])
    .concat(UNIVERSAL_CHAINS)
    .filter(s => !krogerNames.has(s.name.toLowerCase()));

  return [...krogerStores, ...supplements].slice(0, 5);
}

export function getStoreById(id) {
  // Dynamic Kroger store — parse locationId from 'kroger-{locationId}'
  if (id?.startsWith('kroger-')) {
    const locationId = id.slice(7);
    return { id, name: 'Kroger', priceMultiplier: 1.0, locationId };
  }
  return STATIC_STORE_REGISTRY[id] ?? { id, name: id, priceMultiplier: 1.0 };
}

// ---------------------------------------------------------------------------
// Public: calculate full recipe cost
// ---------------------------------------------------------------------------

export async function calculateRecipeCost(ingredients, stores, supabaseClient = null, zipCode = null) {
  const results = await Promise.allSettled(
    ingredients.map(async (ing) => {
      const storePriceResults = await Promise.allSettled(
        stores.map(async (store) => {
          const result = await resolveIngredientPrice(
            ing.name,
            ing.quantity ?? 1,
            ing.unit ?? 'each',
            store.priceMultiplier ?? 1.0,
            supabaseClient,
            store.locationId ?? null,
            zipCode
          );
          return {
            storeId:    store.id,
            storeName:  store.name,
            price:      result.price,
            confidence: result.confidence,
          };
        })
      );

      return {
        ingredient:  ing.name,
        quantity:    ing.quantity ?? 1,
        unit:        ing.unit ?? 'each',
        storePrices: storePriceResults
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value),
      };
    })
  );

  const costData = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  // Build per-store totals for the summary
  const storeNames = [...new Set(costData.flatMap(item => item.storePrices.map(sp => sp.storeName)))];
  const storeTotals = {};
  for (const sName of storeNames) {
    storeTotals[sName] = parseFloat(
      costData.reduce((sum, item) => {
        const sp = item.storePrices.find(p => p.storeName === sName);
        return sum + (sp?.price ?? 0);
      }, 0).toFixed(2)
    );
  }

  const cheapestEntry = Object.entries(storeTotals).sort((a, b) => a[1] - b[1])[0];

  return {
    costData,
    summary: {
      cheapestStore: cheapestEntry?.[0] ?? null,
      cheapestTotal: cheapestEntry ? parseFloat(cheapestEntry[1].toFixed(2)) : 0,
      storeTotals,
      storeCount:      stores.length,
      ingredientCount: ingredients.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Supabase service-role client (for cache writes)
// ---------------------------------------------------------------------------

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
