// Low-opacity line-illustration garnish (original, small original SVG set —
// spec §3, rule 5) shown behind empty-state copy and section breaks.
function SprigIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true" className="opacity-[0.12]">
      <path d="M60 105V45" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 60c0-16 14-24 24-24-2 14-10 22-24 24Z" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 75c0-14-14-20-24-20 2 12 10 18 24 20Z" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 45c0-14 10-22 20-27-1 14-8 22-20 27Z" stroke="var(--sa-green-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="105" r="4" stroke="var(--sa-green-deep)" strokeWidth="2" />
    </svg>
  );
}

export default function EmptyState({ title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center text-center py-16 px-6 ${className}`}>
      <SprigIllustration />
      <h3 className="mt-2 text-[17px] font-semibold text-[var(--sa-ink)]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-[15px] text-[var(--sa-ink-soft)]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
