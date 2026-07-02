function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One store's basket total in the compare grid. `isBest` renders the green
// "Best total" ribbon (never orange -- accent stays reserved for the
// primary Send-to-Instacart action, spec §3 rule 1 / §4.6).
export default function StoreCard({
  name,
  total,
  deltaFromMostExpensive,
  availableCount,
  itemCount,
  isBest = false,
  className = '',
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-4 shadow-[var(--sa-shadow-card)] ${className}`}
    >
      {isBest && (
        <span className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-[var(--sa-radius-card)] bg-[var(--sa-savings)] px-3 py-1 text-[11px] font-semibold text-white">
          <CheckIcon /> Best total
        </span>
      )}

      <p className="text-[15px] font-semibold text-[var(--sa-ink)]">{name}</p>
      <p className="mt-1 text-[28px] font-semibold text-[var(--sa-ink)]">${total.toFixed(2)}</p>

      {!isBest && deltaFromMostExpensive != null && deltaFromMostExpensive > 0 && (
        <p className="mt-0.5 text-[13px] font-medium text-[var(--sa-savings)]">
          Save ${deltaFromMostExpensive.toFixed(2)} vs. priciest
        </p>
      )}

      {itemCount != null && (
        <p className="mt-2 text-[13px] text-[var(--sa-ink-soft)]">
          {availableCount} of {itemCount} items priced
        </p>
      )}
    </div>
  );
}
