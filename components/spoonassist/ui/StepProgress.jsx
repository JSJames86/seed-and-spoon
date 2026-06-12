export default function StepProgress({ currentStep, totalSteps, label }) {
  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mb-8 spoon-glass-lite rounded-spoon-card px-4 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-spoon-subtext shrink-0">
        Step {currentStep} of {totalSteps}
      </span>
      <div className="flex-1 min-w-[80px] h-1.5 rounded-full bg-white/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-spoon-mint spoon-transition"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-medium text-spoon-ink">{label}</span>
    </div>
  );
}
