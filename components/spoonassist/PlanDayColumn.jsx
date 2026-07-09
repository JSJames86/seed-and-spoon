const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

// One day's column in the weekly plan grid: a slot row per meal, each
// listing every recipe assigned to it (with its own remove action) plus an
// "Add" affordance to append another.
export default function PlanDayColumn({ dayLabel, isToday, slots, items, onAdd, onRemove, className = '' }) {
  return (
    <div className={`rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-3 shadow-[var(--sa-shadow-card)] ${className}`}>
      <p className={`text-[13px] font-semibold uppercase tracking-wide ${isToday ? 'text-[var(--sa-accent)]' : 'text-[var(--sa-ink-soft)]'}`}>
        {dayLabel}
      </p>

      <div className="mt-2 space-y-2">
        {slots.map((slot) => {
          const slotItems = items.filter((i) => i.slot === slot);
          return (
            <div key={slot} className="rounded-[calc(var(--sa-radius-card)-8px)] bg-[var(--sa-surface-alt)] p-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)]">
                {SLOT_LABELS[slot] || slot}
              </p>
              {slotItems.map((item) => (
                <div key={item.id} className="mt-1 flex items-start justify-between gap-1">
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
              ))}
              <button
                type="button"
                onClick={() => onAdd(slot)}
                className="mt-1 text-[13px] font-semibold text-[var(--sa-ink-soft)] hover:text-[var(--sa-ink)]"
              >
                + Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
