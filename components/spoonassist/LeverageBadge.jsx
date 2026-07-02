// The Meal Leverage Score differentiator badge (spec §1, §5) — shown on
// cards, recipe detail, and the weekly plan. Two display modes:
//   <LeverageBadge score={7.2} />       -> "Leverage 7.2"
//   <LeverageBadge sharedCount={2} />   -> "+2 shared items" (card context,
//                                          only meaningful once a plan exists)
export default function LeverageBadge({ score, sharedCount, className = '' }) {
  if (score == null && sharedCount == null) return null;

  const label = sharedCount != null
    ? `+${sharedCount} shared item${sharedCount === 1 ? '' : 's'}`
    : `Leverage ${score.toFixed(1)}`;

  return (
    <span
      title="Higher = more meals per item you buy."
      className={`inline-flex items-center gap-1 rounded-[var(--sa-radius-pill)] bg-[var(--sa-green)] px-2.5 py-1 text-[13px] font-semibold text-[var(--sa-green-deep)] ${className}`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 1L7.4 4.4L11 5L8.3 7.3L9 11L6 9.1L3 11L3.7 7.3L1 5L4.6 4.4L6 1Z" fill="currentColor" />
      </svg>
      {label}
    </span>
  );
}
