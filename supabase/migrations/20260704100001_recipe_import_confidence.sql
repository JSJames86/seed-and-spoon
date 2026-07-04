-- ============================================================================
-- SpoonAssist -- "Share a recipe" import review
-- ============================================================================
-- app/api/recipes/import inserts a draft recipe (is_published = false,
-- author_id = the importing user) extracted from a pasted caption via
-- lib/spoonassist/recipeExtraction.js. import_confidence carries the
-- extractor's own confidence through to the /spoonassist/recipes/[slug]/review
-- page,
-- so a low-confidence import can flag "check this carefully" again after
-- the initial import response is gone.
-- ============================================================================

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS import_confidence text
    CHECK (import_confidence IS NULL OR import_confidence IN ('high', 'medium', 'low'));

COMMENT ON COLUMN public.recipes.import_confidence IS
  'Set only for recipes created via "Share a recipe" (app/api/recipes/import). NULL for editorial/MLE recipes.';

-- "Public read recipes" (USING (true), from 20260614000001) predates any row
-- ever having is_published = false -- every existing recipe is published, so
-- it never mattered. Now that "Share a recipe" creates real unpublished
-- drafts (someone's own pasted recipe, awaiting review), a draft must only be
-- readable by its author until published, while still keeping every existing
-- published recipe openly readable exactly as before.
DROP POLICY IF EXISTS "Public read recipes" ON public.recipes;
CREATE POLICY "Public read published recipes" ON public.recipes
  FOR SELECT USING (is_published = true);
CREATE POLICY "Authors read own recipe drafts" ON public.recipes
  FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Public read recipe_ingredients" ON public.recipe_ingredients;
CREATE POLICY "Public read ingredients of published recipes" ON public.recipe_ingredients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_ingredients.recipe_id AND r.is_published = true)
  );
CREATE POLICY "Authors read own recipe draft ingredients" ON public.recipe_ingredients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_ingredients.recipe_id AND r.author_id = auth.uid())
  );
