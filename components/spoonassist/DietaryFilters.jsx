'use client';

const DIETARY_OPTIONS = [
  { id: 'gluten-free', label: 'Gluten-Free', color: 'yellow' },
  { id: 'low-carb', label: 'Low-Carb', color: 'blue' },
  { id: 'diabetic', label: 'Diabetic', color: 'purple' },
  { id: 'vegan', label: 'Vegan', color: 'green' }
];

export default function DietaryFilters({ selectedFilters, onChange }) {
  const handleToggle = (filterId) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(f => f !== filterId)
      : [...selectedFilters, filterId];
    onChange(newFilters);
  };

  const colorClasses = {
    yellow: {
      active: 'bg-yellow-500 text-white border-yellow-600',
      inactive: 'bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50'
    },
    blue: {
      active: 'bg-blue-500 text-white border-blue-600',
      inactive: 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
    },
    purple: {
      active: 'bg-purple-500 text-white border-purple-600',
      inactive: 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
    },
    green: {
      active: 'bg-green-500 text-white border-green-600',
      inactive: 'bg-white text-green-700 border-green-300 hover:bg-green-50'
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Dietary Preferences</h3>
      <div className="flex flex-wrap gap-3">
        {DIETARY_OPTIONS.map(option => {
          const isActive = selectedFilters.includes(option.id);
          const classes = isActive
            ? colorClasses[option.color].active
            : colorClasses[option.color].inactive;

          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors shadow-sm ${classes}`}
            >
              {isActive && <span className="mr-1">✓</span>}
              {option.label}
            </button>
          );
        })}
      </div>
      {selectedFilters.length > 0 && (
        <p className="mt-3 text-sm text-gray-600">
          Active filters: {selectedFilters.map(f =>
            DIETARY_OPTIONS.find(o => o.id === f)?.label
          ).join(', ')}
        </p>
      )}
    </div>
  );
}
