import SpoonAssistMark from './SpoonAssistMark';

// Shared empty state (icon + heading + body + optional CTA) used for every
// "nothing here yet" screen -- plan, list, saved recipes, and search-no-
// results -- so they all read as one consistent pattern instead of a grab
// bag of different illustrations.
export default function EmptyState({ title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center text-center py-16 px-6 ${className}`}>
      <SpoonAssistMark size={96} className="text-[var(--sa-green)] opacity-25" />
      <h3 className="mt-3 text-[17px] font-semibold text-[var(--sa-ink)]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-[15px] text-[var(--sa-ink-soft)]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
