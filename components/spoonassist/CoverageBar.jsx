// Progress bar for "meals planned / meals needed" and budget-vs-spend
// tracking. `warning` switches the fill to the warning tint (e.g. over
// budget) instead of green.
export default function CoverageBar({ value, max, warning = false, className = '' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div
      className={`h-2.5 w-full rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-[var(--sa-radius-pill)] spoon-transition"
        style={{
          width: `${pct}%`,
          background: warning ? 'var(--sa-warning)' : 'var(--sa-savings)',
        }}
      />
    </div>
  );
}
