'use client';

import PillButton from './PillButton';
import ChipToggle from './ChipToggle';

const MAX_MINUTES_CEILING = 180;

// Dietary tags are stored lowercase/hyphenated (e.g. "gluten-free") so
// overlap queries against recipes.dietary_tags match exactly -- this only
// prettifies the chip label, the value passed around stays untouched.
function prettifyTag(tag) {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Bottom sheet on mobile, centered panel on desktop -- category + dietary
// chips and a cooking-time ceiling. Accent Apply is the one saturated CTA;
// Clear all is a ghost action (spec §3, rule 1).
export default function FilterSheet({
  open,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  dietaryOptions,
  selectedDietary,
  onDietaryChange,
  maxMinutes,
  onMaxMinutesChange,
  onApply,
  onClear,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--sa-green-deep)]/40"
      />
      <div className="relative w-full max-w-[480px] rounded-t-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-6 shadow-[var(--sa-shadow-card)] lg:rounded-[var(--sa-radius-card)] lg:mb-6">
        <h2 className="text-[17px] font-semibold text-[var(--sa-ink)]">Filters</h2>

        <div className="mt-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)]">Category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <ChipToggle label="All" active={!selectedCategory} onClick={() => onCategoryChange(null)} />
            {categories.map((category) => (
              <ChipToggle
                key={category}
                label={category}
                active={selectedCategory === category}
                onClick={() => onCategoryChange(category)}
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)]">Dietary</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dietaryOptions.map((tag) => (
              <ChipToggle
                key={tag}
                label={prettifyTag(tag)}
                active={selectedDietary.includes(tag)}
                onClick={() =>
                  onDietaryChange(
                    selectedDietary.includes(tag)
                      ? selectedDietary.filter((t) => t !== tag)
                      : [...selectedDietary, tag]
                  )
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)]">Cooking time</p>
            <span className="text-[13px] font-medium text-[var(--sa-ink)]">
              {maxMinutes >= MAX_MINUTES_CEILING ? 'Any' : `Up to ${maxMinutes} min`}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={MAX_MINUTES_CEILING}
            step={10}
            value={maxMinutes}
            onChange={(e) => onMaxMinutesChange(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--sa-accent)]"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <PillButton variant="ghost" onClick={onClear}>
            Clear all
          </PillButton>
          <PillButton variant="primary" onClick={onApply}>
            Apply
          </PillButton>
        </div>
      </div>
    </div>
  );
}

export { MAX_MINUTES_CEILING };
