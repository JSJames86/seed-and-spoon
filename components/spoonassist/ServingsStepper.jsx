'use client';

// Controls the recipe detail page's serving count; the caller recalculates
// ingredient quantities from `value / baseServings`.
export default function ServingsStepper({ value, onChange, min = 1, max = 24, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-3 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-3 py-1.5 ${className}`}>
      <button
        type="button"
        aria-label="Fewer servings"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sa-surface)] font-semibold text-[var(--sa-ink)] disabled:opacity-40"
      >
        &minus;
      </button>
      <span className="w-16 text-center text-[15px] font-semibold text-[var(--sa-ink)]">
        {value} serving{value === 1 ? '' : 's'}
      </span>
      <button
        type="button"
        aria-label="More servings"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sa-surface)] font-semibold text-[var(--sa-ink)] disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
