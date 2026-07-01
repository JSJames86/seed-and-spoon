'use client';

function formatQuantity(n) {
  if (n == null) return '';
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

// checkbox ("already have it") + scaled quantity/unit + name. Live per-store
// pricing (spec §4.3) lands in Phase 4 once store/price_quotes exist.
export default function IngredientRow({ ingredient, scale = 1, checked = false, onToggle, className = '' }) {
  const { quantity, unit, ingredient_name: name, raw_text: rawText } = ingredient;
  const scaledQuantity = quantity != null ? quantity * scale : null;
  const label = name || rawText;
  const amount = scaledQuantity != null ? `${formatQuantity(scaledQuantity)}${unit && unit !== 'each' ? ` ${unit}` : ''}` : null;

  return (
    <label
      className={`flex items-center gap-3 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] px-4 py-3 spoon-transition ${
        checked ? 'opacity-50' : ''
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 shrink-0 accent-[var(--sa-green)]"
        aria-label={`Already have ${label}`}
      />
      {amount && (
        <span className="w-20 shrink-0 text-[14px] font-semibold text-[var(--sa-ink)]">{amount}</span>
      )}
      <span className={`text-[15px] text-[var(--sa-ink)] ${checked ? 'line-through' : ''}`}>{label}</span>
    </label>
  );
}
