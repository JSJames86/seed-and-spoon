'use client';

// A single toggleable filter chip (dietary tags, category filters, etc).
// `active` controls fill; the accent color is never used here — accent is
// reserved for primary actions only (spec §3, rule 1).
export default function ChipToggle({ label, active = false, onClick, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center rounded-[var(--sa-radius-pill)] px-4 py-1.5 text-[13px] font-medium spoon-transition border ${
        active
          ? 'bg-[var(--sa-green)] border-[var(--sa-green)] text-[var(--sa-green-deep)]'
          : 'bg-[var(--sa-surface)] border-[var(--sa-surface-alt)] text-[var(--sa-ink-soft)] hover:bg-[var(--sa-surface-alt)]'
      } ${className}`}
    >
      {label}
    </button>
  );
}
