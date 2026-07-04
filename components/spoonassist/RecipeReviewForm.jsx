'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PillButton from './PillButton';

const fieldClass =
  'w-full rounded-[var(--sa-radius-card)] border border-[var(--sa-surface-alt)] bg-[var(--sa-surface)] px-3 py-2.5 text-[15px] text-[var(--sa-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sa-accent)]';
const labelClass = 'block text-[13px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)] mb-1.5';

// Review step for a "Share a recipe" import -- lets the author check/edit
// what Claude extracted before it joins the public catalog. Ingredients and
// instructions edit as one-per-line text, same convention as
// components/spoonassist/RecipeTextInput.jsx and the editorial import
// script, instead of a per-row editor.
export default function RecipeReviewForm({ recipe, token, ingredientLines }) {
  const router = useRouter();
  const [title, setTitle] = useState(recipe.title || '');
  const [description, setDescription] = useState(recipe.description || '');
  const [category, setCategory] = useState(recipe.category || '');
  const [servings, setServings] = useState(recipe.servings ?? 4);
  const [totalMinutes, setTotalMinutes] = useState(recipe.total_minutes ?? '');
  const [ingredientsText, setIngredientsText] = useState(ingredientLines.join('\n'));
  const [instructionsText, setInstructionsText] = useState((recipe.instructions || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handlePublish() {
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/recipes/${recipe.id}?token=${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          servings: Number(servings) || 4,
          total_minutes: totalMinutes === '' ? null : Number(totalMinutes),
          ingredients: ingredientsText.split('\n').map((line) => line.trim()).filter(Boolean),
          instructions: instructionsText.split('\n').map((line) => line.trim()).filter(Boolean),
          publish: true,
        }),
      });

      if (!res.ok) {
        setErrorMessage('Something went wrong saving those changes. Try again.');
        setSaving(false);
        return;
      }

      router.push(`/spoonassist/recipes/${recipe.slug}`);
    } catch {
      setErrorMessage("Couldn't reach the server. Check your connection and try again.");
      setSaving(false);
    }
  }

  async function handleDiscard() {
    setDiscarding(true);
    try {
      await fetch(`/api/recipes/${recipe.id}?token=${encodeURIComponent(token)}`, { method: 'DELETE' });
    } finally {
      router.push('/spoonassist/recipes');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">Review your recipe</h1>
        <p className="mt-1 text-[15px] text-[var(--sa-ink-soft)]">
          Make sure everything looks right before it&rsquo;s added to your recipes.
        </p>
      </div>

      {recipe.import_confidence === 'low' && (
        <p className="rounded-[var(--sa-radius-card)] bg-[var(--sa-surface-alt)] p-3 text-[14px] text-[var(--sa-ink)]">
          A few details were unclear in the original text — double check the ingredients and steps below.
        </p>
      )}

      <div>
        <label className={labelClass} htmlFor="review-title">Title</label>
        <input id="review-title" className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className={labelClass} htmlFor="review-description">Description</label>
        <textarea
          id="review-description"
          rows={2}
          className={`${fieldClass} resize-none`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass} htmlFor="review-category">Category</label>
          <input id="review-category" className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="review-servings">Servings</label>
          <input
            id="review-servings"
            type="number"
            min={1}
            className={fieldClass}
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="review-minutes">Total minutes</label>
          <input
            id="review-minutes"
            type="number"
            min={0}
            className={fieldClass}
            value={totalMinutes}
            onChange={(e) => setTotalMinutes(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="review-ingredients">Ingredients (one per line)</label>
        <textarea
          id="review-ingredients"
          rows={8}
          className={`${fieldClass} resize-y`}
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="review-instructions">Instructions (one step per line)</label>
        <textarea
          id="review-instructions"
          rows={8}
          className={`${fieldClass} resize-y`}
          value={instructionsText}
          onChange={(e) => setInstructionsText(e.target.value)}
        />
      </div>

      {errorMessage && <p className="text-[14px] text-[var(--sa-warning)]">{errorMessage}</p>}

      <div className="flex gap-3">
        <PillButton variant="secondary" className="flex-1" onClick={handleDiscard} disabled={saving || discarding}>
          {discarding ? 'Discarding...' : 'Discard'}
        </PillButton>
        <PillButton variant="primary" className="flex-1" onClick={handlePublish} disabled={saving || discarding || !title.trim()}>
          {saving ? 'Saving...' : 'Looks good, save'}
        </PillButton>
      </div>
    </div>
  );
}
