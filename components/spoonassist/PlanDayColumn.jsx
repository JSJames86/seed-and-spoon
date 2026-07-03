const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

// One day's column in the weekly plan grid: a slot row per meal, each either
// showing the assigned recipe (with a remove action) or an "Add" affordance.
export default function PlanDayColumn({ dayLabel, isToday, slots, items, onAdd, onRemove, className = '' }) {
  return (
    <div className={`rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-3 shadow-[var(--sa-shadow-card)] ${className}`}>
      <p
        className={`inline-flex text-[13px] font-semibold uppercase tracking-wide ${
          isToday
            ? 'rounded-[var(--sa-radius-pill)] bg-[var(--sa-green-deep)] px-2 py-0.5 text-[var(--sa-on-dark)]'
            : 'text-[var(--sa-ink-soft)]'
        }`}
      >
        {dayLabel}
      </p>

      <div className="mt-2 space-y-2">
        {slots.map((slot) => {
          const item = items.find((i) => i.slot === slot);
          return (
            <div key={slot} className="rounded-[calc(var(--sa-radius-card)-8px)] bg-[var(--sa-surface-alt)] p-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)]">
                {SLOT_LABELS[slot] || slot}
              </p>
              {item ? (
                <div className="mt-1 flex items-start justify-between gap-1">
                  <span className="text-[13px] font-medium leading-snug text-[var(--sa-ink)]">{item.title}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 text-[var(--sa-ink-soft)] hover:text-[var(--sa-warning)]"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onAdd(slot)}
                  className="mt-1 text-[13px] font-semibold text-[var(--sa-ink-soft)] hover:text-[var(--sa-ink)]"
                >
                  + Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
