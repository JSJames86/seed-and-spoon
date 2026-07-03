import Image from 'next/image';
import Link from 'next/link';
import CostBadge from './CostBadge';
import LeverageBadge from './LeverageBadge';
import RecipePlaceholder from './RecipePlaceholder';
import SaveHeartButton from './SaveHeartButton';
import { formatMinutes } from '@/lib/spoonassist/formatTime';

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 3.2V6l2 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Every recipe photo — regardless of source quality or aspect ratio — is
// normalized into a circle over a dark disc (spec §3, rule 3). This is what
// makes wildly inconsistent recipe images (site photos, imported JSON-LD
// images, etc.) read as one visual system.
export default function RecipeCard({ recipe, sharedCount, className = '' }) {
  const { id, slug, title, image, costPerServing, totalMinutes, leverage } = recipe;

  return (
    <Link
      href={`/spoonassist/recipes/${slug}`}
      className={`flex h-full flex-col rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-4 shadow-[var(--sa-shadow-card)] spoon-transition hover:-translate-y-0.5 ${className}`}
    >
      <div className="relative mx-auto mb-3 w-28 h-28">
        <div className="sa-plate h-full w-full">
          {image ? (
            <Image src={image} alt="" fill sizes="112px" className="object-cover" />
          ) : (
            <RecipePlaceholder />
          )}
        </div>
        {id && <SaveHeartButton recipeId={id} className="absolute -right-1.5 -top-1.5 h-8 w-8" />}
      </div>

      <h3 className="min-h-[2.6em] text-[15px] font-semibold text-[var(--sa-ink)] text-center leading-snug line-clamp-2 mb-2">
        {title}
      </h3>

      <div className="mt-auto flex flex-wrap items-center justify-center gap-1.5">
        <CostBadge perServing={costPerServing} />
        {totalMinutes != null && (
          <span className="inline-flex items-center gap-1 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-2.5 py-1 text-[13px] font-semibold text-[var(--sa-ink-soft)]">
            <ClockIcon /> {formatMinutes(totalMinutes)}
          </span>
        )}
        {sharedCount != null ? (
          <LeverageBadge sharedCount={sharedCount} />
        ) : leverage != null ? (
          <LeverageBadge score={leverage} />
        ) : null}
      </div>
    </Link>
  );
}
