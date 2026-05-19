'use client';

import { useState, useCallback } from 'react';

export default function PriceCompare() {
  const [query,    setQuery]    = useState('');
  const [zip,      setZip]      = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({ item: query.trim() });
      if (/^\d{5}$/.test(zip.trim())) params.set('zip', zip.trim());

      const res = await fetch(`/api/spoonassist/compare?${params}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not fetch price data. Please try again.');
      console.error('PriceCompare error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, zip]);

  return (
    <div className="w-full">
      <h3 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white mb-1">
        Price Comparison
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Find the lowest local prices for any grocery staple.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g., eggs, milk, bread"
            aria-label="Grocery item to search"
            className="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="ZIP"
            aria-label="ZIP code (optional)"
            inputMode="numeric"
            className="w-20 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full px-4 py-2.5 bg-green-700 text-white rounded-md font-semibold hover:bg-green-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? 'Searching…' : 'Compare Prices'}
        </button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-3">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2" aria-live="polite" aria-label="Price comparison results">
        {results.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center px-3 py-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                {item.vendor}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">
                {item.type}
              </p>
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white shrink-0 ml-3">
              {item.price}
            </span>
          </div>
        ))}

        {!loading && searched && results.length === 0 && !error && (
          <p className="text-sm text-gray-400 text-center py-3">
            No pricing found for &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
