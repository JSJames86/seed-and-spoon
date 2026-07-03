'use client';

import { useRouter } from 'next/navigation';
import { useSavedRecipes } from './SavedRecipesProvider';

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path
        d="M8 13.5s-5.5-3.3-5.5-7.1C2.5 4.4 3.9 3 5.7 3c1 0 2 .5 2.3 1.3C8.3 3.5 9.3 3 10.3 3c1.8 0 3.2 1.4 3.2 3.4 0 3.8-5.5 7.1-5.5 7.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wired to the shared saved-recipes set (SavedRecipesProvider) so the same
// heart state shows on cards, carousels, and the detail hero. Signed-out
// visitors are sent to sign up rather than getting a no-op tap.
export default function SaveHeartButton({ recipeId, className = '' }) {
  const router = useRouter();
  const { recipeIds, signedIn, toggle } = useSavedRecipes();
  const saved = recipeId ? recipeIds.has(recipeId) : false;

  if (!recipeId) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!signedIn) {
      router.push('/signup');
      return;
    }
    toggle(recipeId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved recipes' : 'Save recipe'}
      aria-pressed={saved}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sa-surface)] text-[var(--sa-warning)] shadow-[var(--sa-shadow-card)] spoon-transition hover:brightness-95 ${className}`}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}
