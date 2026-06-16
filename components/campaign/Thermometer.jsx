export function Thermometer({ cashCents, goalCents }) {
  const pct = goalCents > 0 ? Math.min(100, Math.round((cashCents / goalCents) * 100)) : 0;
  const formatDollars = (cents) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);

  return (
    <div>
      <div className="relative h-5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-soil to-gradient-green transition-all duration-700"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between text-sm">
        <span className="font-bold text-charcoal text-base">
          {formatDollars(cashCents)} raised
        </span>
        <span className="text-gray-500">
          {pct}% of {formatDollars(goalCents)} goal
        </span>
      </div>
    </div>
  );
}
