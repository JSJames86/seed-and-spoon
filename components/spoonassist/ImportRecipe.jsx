'use client';

/**
 * SpoonAssist -- Import Recipe
 *
 * Entry point: "Choose a recipe" (browse the existing library) vs
 * "Share a recipe" (paste a caption/link, extract via Claude, land in
 * review at /spoonassist/recipes/[slug]/review).
 *
 * Styled with the v2 shell's --sa-* tokens (spoonassist-v2.css) and
 * PillButton, same as every other component under components/spoonassist/.
 */

import { useState } from 'react';
import Link from 'next/link';
import PillButton from './PillButton';

const fieldClass =
  'w-full rounded-[var(--sa-radius-card)] border border-[var(--sa-surface-alt)] bg-[var(--sa-surface)] px-3 py-2.5 text-[15px] text-[var(--sa-ink)] placeholder:text-[var(--sa-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--sa-accent)]';

export default function ImportRecipe({ onBrowseLibrary, onImported }) {
  const [mode, setMode] = useState('choose'); // choose | paste | loading | success | error
  const [text, setText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    if (!text.trim()) return;
    setMode('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceUrl: sourceUrl || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'no_recipe_found') {
          setErrorMessage(
            "We couldn't find a recipe in that text. Try pasting the full caption, including the ingredient list."
          );
        } else {
          setErrorMessage('Something went wrong reading that recipe. Try again, or paste it a different way.');
        }
        setMode('error');
        return;
      }

      const imported = { recipeId: data.recipeId, slug: data.slug, confidence: data.confidence };
      setResult(imported);
      setMode('success');
      onImported?.(imported);
    } catch {
      setErrorMessage("Couldn't reach the server. Check your connection and try again.");
      setMode('error');
    }
  }

  function reset() {
    setMode('choose');
    setText('');
    setSourceUrl('');
    setErrorMessage('');
    setResult(null);
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-6 shadow-[var(--sa-shadow-card)]">
      {mode === 'choose' && (
        <div className="flex flex-col gap-3">
          <h2 className="mb-1 text-[19px] font-semibold text-[var(--sa-ink)]">What are we cooking?</h2>
          <p className="mb-3 text-[15px] text-[var(--sa-ink-soft)]">
            Pick a recipe from your library, or bring one in from somewhere else.
          </p>

          <button
            onClick={onBrowseLibrary}
            className="w-full rounded-[var(--sa-radius-card)] border border-[var(--sa-surface-alt)] bg-[var(--sa-surface-alt)] px-4 py-3 text-left font-medium text-[var(--sa-ink)] spoon-transition hover:brightness-95"
          >
            Choose a recipe
            <span className="mt-0.5 block text-[13px] text-[var(--sa-ink-soft)]">Browse your saved recipes</span>
          </button>

          <button
            onClick={() => setMode('paste')}
            className="w-full rounded-[var(--sa-radius-card)] bg-[var(--sa-accent)] px-4 py-3 text-left font-medium text-white spoon-transition hover:brightness-105 active:brightness-95"
          >
            Share a recipe
            <span className="mt-0.5 block text-[13px] text-white/90">
              Paste a caption or link from Instagram, TikTok, or anywhere else
            </span>
          </button>
        </div>
      )}

      {mode === 'paste' && (
        <div className="flex flex-col gap-3">
          <button onClick={reset} className="mb-1 self-start text-[13px] text-[var(--sa-ink-soft)] hover:text-[var(--sa-ink)]">
            &larr; Back
          </button>

          <h2 className="text-[19px] font-semibold text-[var(--sa-ink)]">Share a recipe</h2>
          <p className="text-[15px] text-[var(--sa-ink-soft)]">
            Copy the caption or description from the post -- ingredients and steps included -- and paste it below.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the recipe caption here..."
            rows={8}
            className={`${fieldClass} resize-none`}
          />

          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Link to the post (optional)"
            className={fieldClass}
          />

          <PillButton variant="primary" size="lg" className="w-full" onClick={handleSubmit} disabled={!text.trim()}>
            Find this recipe
          </PillButton>
        </div>
      )}

      {mode === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{ borderColor: 'var(--sa-surface-alt)', borderTopColor: 'var(--sa-accent)' }}
          />
          <p className="text-[15px] text-[var(--sa-ink-soft)]">Reading the recipe...</p>
        </div>
      )}

      {mode === 'success' && result && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <h2 className="text-[19px] font-semibold text-[var(--sa-ink)]">Found it!</h2>
          {result.confidence === 'low' && (
            <p className="rounded-[var(--sa-radius-card)] bg-[var(--sa-surface-alt)] p-3 text-[14px] text-[var(--sa-ink)]">
              A few details were unclear in the original text -- take a look before saving.
            </p>
          )}
          <p className="text-[15px] text-[var(--sa-ink-soft)]">Give it a quick check to make sure everything looks right.</p>
          <PillButton as={Link} href={`/spoonassist/recipes/${result.slug}/review`} variant="primary" size="lg" className="w-full">
            Review recipe
          </PillButton>
          <button onClick={reset} className="text-[13px] text-[var(--sa-ink-soft)] hover:text-[var(--sa-ink)]">
            Share another
          </button>
        </div>
      )}

      {mode === 'error' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <h2 className="text-[19px] font-semibold text-[var(--sa-ink)]">Couldn&rsquo;t read that one</h2>
          <p className="text-[15px] text-[var(--sa-ink-soft)]">{errorMessage}</p>
          <PillButton variant="primary" size="lg" className="w-full" onClick={() => setMode('paste')}>
            Try again
          </PillButton>
          <button onClick={reset} className="text-[13px] text-[var(--sa-ink-soft)] hover:text-[var(--sa-ink)]">
            Back to start
          </button>
        </div>
      )}
    </div>
  );
}
