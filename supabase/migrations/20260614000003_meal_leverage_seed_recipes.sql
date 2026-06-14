-- ============================================================================
-- Meal Leverage Engine (MLE) -- Seed Recipe Corpus
-- ============================================================================
-- Per spec v0.1 §8 ("v1 cut"): "Ship the loop against a 30-40 recipe seed
-- corpus of cheap, real, parent-approved staples." This migration adds 25
-- canonical ingredients + 22 recipes (107 recipe_ingredients rows) that all
-- have nutrition IS NOT NULL, so lib/spoonassist/mealLeverageEngine.js picks
-- them up as the MLE corpus (the pre-existing French Onion Soup seed from
-- supabase/seed.sql has nutrition = NULL and stays out of this corpus).
--
-- Ingredient overlap is deliberate: onion, garlic, rice, chicken-thighs,
-- black-beans, and cheddar-cheese each appear in many recipes so the
-- greedy-recompute loop in planBuyList() has real "leverage" to find -- one
-- purchase that unlocks several recipes at once.
--
-- Pricing: every canonical_ingredients.name below was chosen so that
-- normalizeIngredient() (lib/spoonassist/priceEngine.js) resolves it to
-- either an exact/partial USDA_BASELINE match, or one of the 4 new
-- ingredient_mappings rows added here for staples USDA_BASELINE doesn't
-- cover (mixed vegetable, black bean, tortilla, tuna).
--
-- Units: every recipe_ingredients.quantity/unit below is already expressed
-- in the matching canonical_ingredients.standard_unit, per the invariant
-- documented in 20260614000002_meal_leverage_engine.sql -- shortfall()
-- compares these directly against pantry_items.remaining, no conversion hop.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Canonical ingredients (25)
-- ----------------------------------------------------------------------------
INSERT INTO public.canonical_ingredients (id, name, category, standard_unit, nutrition_tags) VALUES
  ('rice',             'Rice',                  'Pantry',  'oz',   ARRAY['starch']),
  ('pasta',            'Pasta',                 'Pantry',  'oz',   ARRAY['starch']),
  ('eggs',             'Eggs',                  'Dairy',   'each', ARRAY['protein','fat']),
  ('chicken-thighs',   'Chicken Thighs',        'Meat',    'oz',   ARRAY['protein','fat']),
  ('ground-beef',      'Ground Beef',           'Meat',    'oz',   ARRAY['protein','fat']),
  ('onion',            'Onion',                 'Produce', 'each', ARRAY['veg']),
  ('garlic',           'Garlic',                'Produce', 'each', ARRAY['veg']),
  ('carrots',          'Carrots',               'Produce', 'oz',   ARRAY['veg','fiber']),
  ('potatoes',         'Potatoes',              'Produce', 'oz',   ARRAY['starch','fiber']),
  ('sweet-potatoes',   'Sweet Potatoes',        'Produce', 'oz',   ARRAY['starch','fiber','veg']),
  ('spinach',          'Spinach',               'Produce', 'oz',   ARRAY['veg','fiber']),
  ('bell-peppers',     'Bell Peppers',          'Produce', 'each', ARRAY['veg','fiber']),
  ('broccoli',         'Broccoli',              'Produce', 'each', ARRAY['veg','fiber']),
  ('zucchini',         'Zucchini',              'Produce', 'oz',   ARRAY['veg']),
  ('cheddar-cheese',   'Cheddar Cheese',        'Dairy',   'oz',   ARRAY['protein','fat']),
  ('milk',             'Milk',                  'Dairy',   'oz',   ARRAY['protein','fat']),
  ('yogurt',           'Yogurt',                'Dairy',   'oz',   ARRAY['protein']),
  ('oats',             'Oats',                  'Pantry',  'oz',   ARRAY['fiber','starch']),
  ('bananas',          'Bananas',               'Produce', 'each', ARRAY['fiber']),
  ('apples',           'Apples',                'Produce', 'each', ARRAY['fiber']),
  ('frozen-mixed-veg', 'Frozen Mixed Vegetables','Frozen', 'oz',   ARRAY['veg','fiber']),
  ('chicken-broth',    'Chicken Broth',         'Pantry',  'oz',   NULL),
  ('black-beans',      'Black Beans',           'Pantry',  'oz',   ARRAY['protein','fiber']),
  ('tortillas',        'Tortillas',             'Pantry',  'each', ARRAY['starch']),
  ('canned-tuna',      'Canned Tuna',           'Pantry',  'oz',   ARRAY['protein'])
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- ingredient_mappings -- 4 cache entries for staples USDA_BASELINE in
-- priceEngine.js has no entry (or no usable partial match) for. Checked
-- (Tier 2) before USDA_BASELINE (Tier 3), so these win outright.
-- ----------------------------------------------------------------------------
INSERT INTO ingredient_mappings (normalized_name, pkg_price, pkg_qty, pkg_unit, confidence) VALUES
  ('mixed vegetable', 2.94, 12.000, 'oz',   'usda'),
  ('black bean',      1.09, 15.500, 'oz',   'usda'),
  ('tortilla',        2.49, 10.000, 'each', 'usda'),
  ('tuna',            1.19,  5.000, 'oz',   'usda')
ON CONFLICT (normalized_name) DO NOTHING;


-- ----------------------------------------------------------------------------
-- Recipes (22) -- all nutrition IS NOT NULL, so all are part of the MLE
-- corpus. All snap_eligible = true (default) -- groceries, not hot/prepared
-- food.
-- ----------------------------------------------------------------------------
INSERT INTO public.recipes (id, title, servings, nutrition, cuisine_tags) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Chicken & Rice Skillet',              4, 0.80, ARRAY['american','comfort']),
  ('10000000-0000-4000-8000-000000000002', 'Black Bean & Rice Bowls',             4, 0.85, ARRAY['mexican','vegetarian']),
  ('10000000-0000-4000-8000-000000000003', 'Beef Tacos',                          4, 0.60, ARRAY['mexican']),
  ('10000000-0000-4000-8000-000000000004', 'Baked Chicken Thighs & Sweet Potatoes', 4, 0.90, ARRAY['american']),
  ('10000000-0000-4000-8000-000000000005', 'Veggie Fried Rice',                   4, 0.75, ARRAY['asian','vegetarian']),
  ('10000000-0000-4000-8000-000000000006', 'Tuna Pasta Salad',                    4, 0.65, ARRAY['american']),
  ('10000000-0000-4000-8000-000000000007', 'Spaghetti with Meat Sauce',           4, 0.70, ARRAY['italian']),
  ('10000000-0000-4000-8000-000000000008', 'Loaded Baked Potatoes',               4, 0.55, ARRAY['american','vegetarian']),
  ('10000000-0000-4000-8000-000000000009', 'Chicken & Veggie Stir Fry',           4, 0.85, ARRAY['asian']),
  ('10000000-0000-4000-8000-000000000010', 'Bean & Cheese Quesadillas',           4, 0.60, ARRAY['mexican','vegetarian']),
  ('10000000-0000-4000-8000-000000000011', 'Tuna Salad Wraps',                    4, 0.60, ARRAY['american']),
  ('10000000-0000-4000-8000-000000000012', 'Veggie Omelets',                      4, 0.70, ARRAY['breakfast','vegetarian']),
  ('10000000-0000-4000-8000-000000000013', 'Banana Oat Pancakes',                 4, 0.65, ARRAY['breakfast','vegetarian']),
  ('10000000-0000-4000-8000-000000000014', 'Apple Cinnamon Oatmeal',              4, 0.60, ARRAY['breakfast','vegetarian']),
  ('10000000-0000-4000-8000-000000000015', 'Chicken Broth Veggie Soup',           4, 0.80, ARRAY['american','soup']),
  ('10000000-0000-4000-8000-000000000016', 'Garlic Roasted Broccoli & Rice',      4, 0.75, ARRAY['vegetarian']),
  ('10000000-0000-4000-8000-000000000017', 'Black Bean Tacos',                    4, 0.70, ARRAY['mexican','vegetarian']),
  ('10000000-0000-4000-8000-000000000018', 'Zucchini & Egg Scramble',             4, 0.70, ARRAY['breakfast','vegetarian']),
  ('10000000-0000-4000-8000-000000000019', 'Sweet Potato & Black Bean Hash',      4, 0.85, ARRAY['vegetarian']),
  ('10000000-0000-4000-8000-000000000020', 'Yogurt Parfaits',                     4, 0.55, ARRAY['breakfast','vegetarian']),
  ('10000000-0000-4000-8000-000000000021', 'Chicken Tortilla Soup',               4, 0.85, ARRAY['mexican','soup']),
  ('10000000-0000-4000-8000-000000000022', 'Spinach & Cheese Pasta',              4, 0.75, ARRAY['italian','vegetarian'])
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- Recipe ingredients (107 rows). quantity/unit already in
-- canonical_ingredients.standard_unit -- see header.
-- ----------------------------------------------------------------------------
INSERT INTO public.recipe_ingredients (recipe_id, canonical_id, quantity, unit, optional) VALUES
  -- 0001 Chicken & Rice Skillet
  ('10000000-0000-4000-8000-000000000001', 'chicken-thighs',   24,  'oz',   false),
  ('10000000-0000-4000-8000-000000000001', 'rice',             12,  'oz',   false),
  ('10000000-0000-4000-8000-000000000001', 'onion',             1,  'each', false),
  ('10000000-0000-4000-8000-000000000001', 'garlic',          0.3,  'each', false),
  ('10000000-0000-4000-8000-000000000001', 'chicken-broth',    16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000001', 'frozen-mixed-veg', 10,  'oz',   true),

  -- 0002 Black Bean & Rice Bowls
  ('10000000-0000-4000-8000-000000000002', 'rice',             12,  'oz',   false),
  ('10000000-0000-4000-8000-000000000002', 'black-beans',      31,  'oz',   false),
  ('10000000-0000-4000-8000-000000000002', 'onion',             1,  'each', false),
  ('10000000-0000-4000-8000-000000000002', 'garlic',          0.3,  'each', false),
  ('10000000-0000-4000-8000-000000000002', 'bell-peppers',      2,  'each', false),
  ('10000000-0000-4000-8000-000000000002', 'cheddar-cheese',    4,  'oz',   true),

  -- 0003 Beef Tacos
  ('10000000-0000-4000-8000-000000000003', 'ground-beef',      16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000003', 'tortillas',         8,  'each', false),
  ('10000000-0000-4000-8000-000000000003', 'cheddar-cheese',    4,  'oz',   false),
  ('10000000-0000-4000-8000-000000000003', 'onion',           0.5,  'each', false),
  ('10000000-0000-4000-8000-000000000003', 'black-beans',      15,  'oz',   true),

  -- 0004 Baked Chicken Thighs & Sweet Potatoes
  ('10000000-0000-4000-8000-000000000004', 'chicken-thighs',   32,  'oz',   false),
  ('10000000-0000-4000-8000-000000000004', 'sweet-potatoes',   32,  'oz',   false),
  ('10000000-0000-4000-8000-000000000004', 'broccoli',          2,  'each', false),
  ('10000000-0000-4000-8000-000000000004', 'garlic',          0.2,  'each', false),

  -- 0005 Veggie Fried Rice
  ('10000000-0000-4000-8000-000000000005', 'rice',             16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000005', 'eggs',              3,  'each', false),
  ('10000000-0000-4000-8000-000000000005', 'frozen-mixed-veg', 12,  'oz',   false),
  ('10000000-0000-4000-8000-000000000005', 'onion',             1,  'each', false),
  ('10000000-0000-4000-8000-000000000005', 'garlic',          0.3,  'each', false),

  -- 0006 Tuna Pasta Salad
  ('10000000-0000-4000-8000-000000000006', 'pasta',            12,  'oz',   false),
  ('10000000-0000-4000-8000-000000000006', 'canned-tuna',      10,  'oz',   false),
  ('10000000-0000-4000-8000-000000000006', 'bell-peppers',      1,  'each', false),
  ('10000000-0000-4000-8000-000000000006', 'onion',           0.5,  'each', false),
  ('10000000-0000-4000-8000-000000000006', 'frozen-mixed-veg',  8,  'oz',   true),

  -- 0007 Spaghetti with Meat Sauce
  ('10000000-0000-4000-8000-000000000007', 'pasta',            16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000007', 'ground-beef',      16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000007', 'onion',             1,  'each', false),
  ('10000000-0000-4000-8000-000000000007', 'garlic',          0.3,  'each', false),
  ('10000000-0000-4000-8000-000000000007', 'cheddar-cheese',    4,  'oz',   true),

  -- 0008 Loaded Baked Potatoes
  ('10000000-0000-4000-8000-000000000008', 'potatoes',         64,  'oz',   false),
  ('10000000-0000-4000-8000-000000000008', 'cheddar-cheese',    6,  'oz',   false),
  ('10000000-0000-4000-8000-000000000008', 'broccoli',          1,  'each', true),
  ('10000000-0000-4000-8000-000000000008', 'black-beans',      15,  'oz',   true),

  -- 0009 Chicken & Veggie Stir Fry
  ('10000000-0000-4000-8000-000000000009', 'chicken-thighs',   24,  'oz',   false),
  ('10000000-0000-4000-8000-000000000009', 'broccoli',          2,  'each', false),
  ('10000000-0000-4000-8000-000000000009', 'bell-peppers',      2,  'each', false),
  ('10000000-0000-4000-8000-000000000009', 'zucchini',          8,  'oz',   false),
  ('10000000-0000-4000-8000-000000000009', 'garlic',          0.3,  'each', false),
  ('10000000-0000-4000-8000-000000000009', 'rice',             12,  'oz',   false),
  ('10000000-0000-4000-8000-000000000009', 'carrots',           4,  'oz',   true),

  -- 0010 Bean & Cheese Quesadillas
  ('10000000-0000-4000-8000-000000000010', 'tortillas',         8,  'each', false),
  ('10000000-0000-4000-8000-000000000010', 'black-beans',      15,  'oz',   false),
  ('10000000-0000-4000-8000-000000000010', 'cheddar-cheese',    8,  'oz',   false),
  ('10000000-0000-4000-8000-000000000010', 'onion',           0.5,  'each', true),

  -- 0011 Tuna Salad Wraps
  ('10000000-0000-4000-8000-000000000011', 'canned-tuna',      10,  'oz',   false),
  ('10000000-0000-4000-8000-000000000011', 'tortillas',         4,  'each', false),
  ('10000000-0000-4000-8000-000000000011', 'onion',           0.3,  'each', false),
  ('10000000-0000-4000-8000-000000000011', 'cheddar-cheese',    2,  'oz',   true),
  ('10000000-0000-4000-8000-000000000011', 'bell-peppers',      1,  'each', true),

  -- 0012 Veggie Omelets
  ('10000000-0000-4000-8000-000000000012', 'eggs',              8,  'each', false),
  ('10000000-0000-4000-8000-000000000012', 'spinach',           4,  'oz',   false),
  ('10000000-0000-4000-8000-000000000012', 'bell-peppers',      1,  'each', false),
  ('10000000-0000-4000-8000-000000000012', 'cheddar-cheese',    4,  'oz',   false),
  ('10000000-0000-4000-8000-000000000012', 'onion',           0.3,  'each', true),

  -- 0013 Banana Oat Pancakes
  ('10000000-0000-4000-8000-000000000013', 'oats',             12,  'oz',   false),
  ('10000000-0000-4000-8000-000000000013', 'bananas',           4,  'each', false),
  ('10000000-0000-4000-8000-000000000013', 'eggs',              4,  'each', false),
  ('10000000-0000-4000-8000-000000000013', 'milk',              8,  'oz',   false),

  -- 0014 Apple Cinnamon Oatmeal
  ('10000000-0000-4000-8000-000000000014', 'oats',             16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000014', 'apples',            4,  'each', false),
  ('10000000-0000-4000-8000-000000000014', 'milk',             16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000014', 'yogurt',            8,  'oz',   true),

  -- 0015 Chicken Broth Veggie Soup
  ('10000000-0000-4000-8000-000000000015', 'chicken-broth',    32,  'oz',   false),
  ('10000000-0000-4000-8000-000000000015', 'carrots',           8,  'oz',   false),
  ('10000000-0000-4000-8000-000000000015', 'potatoes',         16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000015', 'onion',             1,  'each', false),
  ('10000000-0000-4000-8000-000000000015', 'chicken-thighs',   16,  'oz',   true),

  -- 0016 Garlic Roasted Broccoli & Rice
  ('10000000-0000-4000-8000-000000000016', 'broccoli',          2,  'each', false),
  ('10000000-0000-4000-8000-000000000016', 'rice',             12,  'oz',   false),
  ('10000000-0000-4000-8000-000000000016', 'garlic',          0.5,  'each', false),
  ('10000000-0000-4000-8000-000000000016', 'cheddar-cheese',    4,  'oz',   true),

  -- 0017 Black Bean Tacos
  ('10000000-0000-4000-8000-000000000017', 'black-beans',      31,  'oz',   false),
  ('10000000-0000-4000-8000-000000000017', 'tortillas',         8,  'each', false),
  ('10000000-0000-4000-8000-000000000017', 'bell-peppers',      1,  'each', false),
  ('10000000-0000-4000-8000-000000000017', 'cheddar-cheese',    4,  'oz',   false),
  ('10000000-0000-4000-8000-000000000017', 'onion',           0.5,  'each', false),

  -- 0018 Zucchini & Egg Scramble
  ('10000000-0000-4000-8000-000000000018', 'eggs',              8,  'each', false),
  ('10000000-0000-4000-8000-000000000018', 'zucchini',         12,  'oz',   false),
  ('10000000-0000-4000-8000-000000000018', 'onion',           0.5,  'each', false),
  ('10000000-0000-4000-8000-000000000018', 'cheddar-cheese',    4,  'oz',   true),

  -- 0019 Sweet Potato & Black Bean Hash
  ('10000000-0000-4000-8000-000000000019', 'sweet-potatoes',   32,  'oz',   false),
  ('10000000-0000-4000-8000-000000000019', 'black-beans',      15,  'oz',   false),
  ('10000000-0000-4000-8000-000000000019', 'onion',             1,  'each', false),
  ('10000000-0000-4000-8000-000000000019', 'bell-peppers',      1,  'each', true),
  ('10000000-0000-4000-8000-000000000019', 'eggs',              4,  'each', true),

  -- 0020 Yogurt Parfaits
  ('10000000-0000-4000-8000-000000000020', 'yogurt',           24,  'oz',   false),
  ('10000000-0000-4000-8000-000000000020', 'bananas',           4,  'each', false),
  ('10000000-0000-4000-8000-000000000020', 'oats',              8,  'oz',   true),
  ('10000000-0000-4000-8000-000000000020', 'apples',            2,  'each', true),

  -- 0021 Chicken Tortilla Soup
  ('10000000-0000-4000-8000-000000000021', 'chicken-thighs',   16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000021', 'chicken-broth',    32,  'oz',   false),
  ('10000000-0000-4000-8000-000000000021', 'black-beans',      15,  'oz',   false),
  ('10000000-0000-4000-8000-000000000021', 'onion',             1,  'each', false),
  ('10000000-0000-4000-8000-000000000021', 'tortillas',         4,  'each', true),
  ('10000000-0000-4000-8000-000000000021', 'bell-peppers',      1,  'each', true),

  -- 0022 Spinach & Cheese Pasta
  ('10000000-0000-4000-8000-000000000022', 'pasta',            16,  'oz',   false),
  ('10000000-0000-4000-8000-000000000022', 'spinach',           6,  'oz',   false),
  ('10000000-0000-4000-8000-000000000022', 'cheddar-cheese',    6,  'oz',   false),
  ('10000000-0000-4000-8000-000000000022', 'garlic',          0.3,  'each', false),
  ('10000000-0000-4000-8000-000000000022', 'milk',              8,  'oz',   true);
