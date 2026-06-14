'use client';

/**
 * SearchBar Component
 *
 * Controlled search input that filters recipes by title.
 *
 * @component
 * @param {Object} props
 * @param {string} props.value - Current search query
 * @param {Function} props.onChange - Called with the new search query
 *
 * @example
 * <SearchBar value={search} onChange={setSearch} />
 */
export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative max-w-xl mx-auto">
      <div
        className="pointer-events-none absolute inset-y-0 left-4 flex items-center"
        aria-hidden="true"
      >
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
          />
        </svg>
      </div>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search recipes by name..."
        className="w-full pl-11 pr-11 py-3 rounded-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-green-primary focus:border-transparent"
        aria-label="Search recipes by title"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-primary rounded-full"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
