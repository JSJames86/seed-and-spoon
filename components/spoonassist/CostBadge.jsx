export default function CostBadge({ perServing, className = '' }) {
  if (perServing == null) return null;
  return (
    <span
      className={`inline-flex items-center rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-2.5 py-1 text-[13px] font-semibold text-[var(--sa-ink)] ${className}`}
    >
      ${perServing.toFixed(2)}/serving
    </span>
  );
}
