'use client';

const ALLERGEN_LIST = [
  { key: 'milk_dairy', label: 'Milk / Dairy' },
  { key: 'egg', label: 'Egg' },
  { key: 'peanut', label: 'Peanut' },
  { key: 'tree_nuts', label: 'Tree Nuts' },
  { key: 'fish', label: 'Fish' },
  { key: 'shellfish', label: 'Shellfish' },
  { key: 'wheat_gluten', label: 'Wheat / Gluten' },
  { key: 'soy', label: 'Soy' },
  { key: 'sesame', label: 'Sesame' },
  { key: 'other', label: 'Other' },
];

const SEVERITIES = [
  { key: 'I', label: 'I', title: 'Intolerance / sensitivity' },
  { key: 'A', label: 'A', title: 'Allergy (strict avoidance)' },
  { key: 'S', label: 'S', title: 'SEVERE / anaphylaxis' },
];

function getSeverityColor(severity) {
  switch (severity) {
    case 'I': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'A': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'S': return 'bg-red-200 text-red-900 border-red-400 font-bold';
    default: return 'bg-gray-100 text-gray-400 border-gray-200';
  }
}

export default function AllergenMatrix({ childEntries, allergens, onChange }) {
  function getEntry(childLabel, allergenKey) {
    return allergens.find(a => a.child_label === childLabel && a.allergen === allergenKey);
  }

  function toggleSeverity(childLabel, allergenKey, severity) {
    const existing = getEntry(childLabel, allergenKey);

    if (existing && existing.severity === severity) {
      onChange(allergens.filter(a => !(a.child_label === childLabel && a.allergen === allergenKey)));
    } else if (existing) {
      onChange(allergens.map(a =>
        (a.child_label === childLabel && a.allergen === allergenKey)
          ? { ...a, severity }
          : a
      ));
    } else {
      onChange([...allergens, { child_label: childLabel, allergen: allergenKey, severity }]);
    }
  }

  function updateOtherName(childLabel, name) {
    onChange(allergens.map(a =>
      (a.child_label === childLabel && a.allergen === 'other')
        ? { ...a, allergen_other_name: name }
        : a
    ));
  }

  const hasSevere = allergens.some(a => a.severity === 'S');

  return (
    <div className="space-y-6">
      {/* Desktop: table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Allergen</th>
              {childEntries.map(child => (
                <th key={child.label} className="text-center py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                  {child.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALLERGEN_LIST.map(allergen => (
              <tr key={allergen.key} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">{allergen.label}</td>
                {childEntries.map(child => {
                  const entry = getEntry(child.label, allergen.key);
                  return (
                    <td key={child.label} className="py-2 px-2">
                      <div className="flex justify-center gap-1">
                        {SEVERITIES.map(sev => (
                          <button
                            key={sev.key}
                            type="button"
                            title={sev.title}
                            onClick={() => toggleSeverity(child.label, allergen.key, sev.key)}
                            className={`
                              w-8 h-8 rounded border text-xs font-semibold transition-all
                              ${entry?.severity === sev.key
                                ? getSeverityColor(sev.key)
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }
                            `}
                          >
                            {sev.label}
                          </button>
                        ))}
                      </div>
                      {allergen.key === 'other' && entry && (
                        <input
                          type="text"
                          placeholder="Name..."
                          value={entry.allergen_other_name || ''}
                          onChange={e => updateOtherName(child.label, e.target.value)}
                          className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card layout */}
      <div className="sm:hidden space-y-4">
        {childEntries.map(child => (
          <div key={child.label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">{child.label}</h4>
            <div className="space-y-2">
              {ALLERGEN_LIST.map(allergen => {
                const entry = getEntry(child.label, allergen.key);
                return (
                  <div key={allergen.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{allergen.label}</span>
                    <div className="flex gap-1">
                      {SEVERITIES.map(sev => (
                        <button
                          key={sev.key}
                          type="button"
                          title={sev.title}
                          onClick={() => toggleSeverity(child.label, allergen.key, sev.key)}
                          className={`
                            w-8 h-8 rounded border text-xs font-semibold transition-all
                            ${entry?.severity === sev.key
                              ? getSeverityColor(sev.key)
                              : 'bg-white dark:bg-gray-700 text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-600'
                            }
                          `}
                        >
                          {sev.label}
                        </button>
                      ))}
                    </div>
                    {allergen.key === 'other' && entry && (
                      <input
                        type="text"
                        placeholder="Name..."
                        value={entry.allergen_other_name || ''}
                        onChange={e => updateOtherName(child.label, e.target.value)}
                        className="ml-2 flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Severe allergen alert */}
      {hasSevere && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg p-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-200">
            SEVERE ALLERGEN(S) FLAGGED
          </p>
          <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
            {allergens
              .filter(a => a.severity === 'S')
              .map((a, i) => (
                <li key={i}>
                  {a.child_label}: {ALLERGEN_LIST.find(al => al.key === a.allergen)?.label || a.allergen}
                  {a.allergen === 'other' && a.allergen_other_name ? ` (${a.allergen_other_name})` : ''}
                </li>
              ))}
          </ul>
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            This will set a hard allergen flag on the kit label and production sheet for this household.
          </p>
        </div>
      )}
    </div>
  );
}
