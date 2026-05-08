'use client';

export default function InstacartRetailerSelector({ retailers, selectedKey, onChange, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
        <svg className="animate-spin h-4 w-4 text-[#003D29]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Finding Instacart stores…
      </div>
    );
  }

  if (!retailers || retailers.length === 0) return null;

  return (
    <div className="mt-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Preferred Instacart store
        <span className="ml-1 text-xs text-gray-400 font-normal">(pre-selects store on the Instacart page)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
            !selectedKey
              ? 'bg-[#003D29] text-[#FAF1E5] border-[#003D29]'
              : 'bg-white text-gray-600 border-gray-300 hover:border-[#003D29]'
          }`}
        >
          Any store
        </button>
        {retailers.map(r => (
          <button
            key={r.retailer_key}
            type="button"
            onClick={() => onChange(r.retailer_key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
              selectedKey === r.retailer_key
                ? 'bg-[#003D29] text-[#FAF1E5] border-[#003D29]'
                : 'bg-white text-gray-700 border-gray-300 hover:border-[#003D29]'
            }`}
          >
            {r.retailer_logo_url && (
              <img
                src={r.retailer_logo_url}
                alt=""
                className="h-4 w-4 object-contain rounded-sm"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            {r.name}
          </button>
        ))}
      </div>
    </div>
  );
}
