// Low-opacity line-illustration garnish (original, small original SVG set —
// spec §3, rule 5) shown behind empty-state copy and section breaks.
// `variant` picks which one fits the context (recipes, plan, list, ...);
// all share the same weight/stroke so they read as one family.

function SprigIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M60 105V45" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 60c0-16 14-24 24-24-2 14-10 22-24 24Z" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 75c0-14-14-20-24-20 2 12 10 18 24 20Z" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 45c0-14 10-22 20-27-1 14-8 22-20 27Z" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="105" r="4" stroke="var(--sa-green-deep)" strokeWidth="2" />
    </svg>
  );
}

function UtensilsIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M46 30v28a6 6 0 006 6h0" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 30v60M56 30v18M66 30v18M46 48h20" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M78 30a10 10 0 0110 10v16a10 10 0 01-10 10v24" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BasketIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M38 54h44l-5 34a6 6 0 01-6 5H49a6 6 0 01-6-5l-5-34Z" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 54h52M50 54c0-14 6-24 10-24s10 10 10 24" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 64v20M60 64v20M70 64v20" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlateIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="30" stroke="var(--sa-green-deep)" strokeWidth="2" />
      <circle cx="60" cy="60" r="18" stroke="var(--sa-green-deep)" strokeWidth="2" />
    </svg>
  );
}

const ILLUSTRATIONS = {
  sprig: SprigIllustration,
  utensils: UtensilsIllustration,
  basket: BasketIllustration,
  plate: PlateIllustration,
};

export default function EmptyState({ title, description, action, variant = 'sprig', className = '' }) {
  const Illustration = ILLUSTRATIONS[variant] || SprigIllustration;

  return (
    <div className={`flex flex-col items-center text-center py-16 px-6 ${className}`}>
      <div className="opacity-[0.12]">
        <Illustration />
      </div>
      <h3 className="mt-2 text-[17px] font-semibold text-[var(--sa-ink)]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-[15px] text-[var(--sa-ink-soft)]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
