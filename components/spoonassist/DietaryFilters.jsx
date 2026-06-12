'use client';

import Chip from './ui/Chip';

const DIETARY_OPTIONS = [
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'low-carb', label: 'Low-Carb' },
  { id: 'low-sugar', label: 'Low-Sugar' },
  { id: 'vegan', label: 'Vegan' }
];

export default function DietaryFilters({ selectedFilters, onChange }) {
  const handleToggle = (filterId) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(f => f !== filterId)
      : [...selectedFilters, filterId];
    onChange(newFilters);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-spoon-ink mb-3">Dietary Preferences</h3>
      <div className="flex flex-wrap gap-3">
        {DIETARY_OPTIONS.map(option => {
          const isActive = selectedFilters.includes(option.id);

          return (
            <Chip
              key={option.id}
              active={isActive}
              onClick={() => handleToggle(option.id)}
            >
              {isActive && <span>✓</span>}
              {option.label}
            </Chip>
          );
        })}
      </div>
      {selectedFilters.length > 0 && (
        <p className="mt-3 text-sm text-spoon-subtext">
          Active filters: {selectedFilters.map(f =>
            DIETARY_OPTIONS.find(o => o.id === f)?.label
          ).join(', ')}
        </p>
      )}
      <p className="mt-3 text-xs text-spoon-subtext">
        Dietary preferences are for reference only and do not constitute medical advice.
      </p>
    </div>
  );
}
