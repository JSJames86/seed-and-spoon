'use client';

import PoweredBy from './PoweredBy';

const CONFIDENCE_BADGE = {
  live:      { label: 'Live',      className: 'bg-forest-dark/10 text-forest-dark' },
  cached:    { label: 'Cached',    className: 'bg-gray-100 text-gray-600' },
  community: { label: 'Community', className: 'bg-gray-100 text-gray-600' },
  usda:      { label: 'USDA',      className: 'bg-gray-100 text-gray-600' },
  estimated: { label: 'Est.',      className: 'bg-gray-100 text-gray-500' },
  free:      { label: 'Free',      className: 'bg-gray-100 text-gray-400' },
};

function ConfidenceBadge({ confidence }) {
  const badge = CONFIDENCE_BADGE[confidence] || CONFIDENCE_BADGE.estimated;
  return (
    <span className={`inline-block text-[10px] font-medium px-1 py-0.5 rounded ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function ChevronIcon({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function activeSources(costData) {
  const confidences = new Set(
    costData.flatMap(item => (item.storePrices ?? []).map(sp => sp.confidence))
  );
  const sources = [];
  if (confidences.has('live') || confidences.has('cached')) sources.push('kroger');
  if (confidences.has('community'))                          sources.push('community');
  if (confidences.has('usda') || confidences.has('estimated')) sources.push('usda');
  return sources;
}

export default function CostResultsTable({ costData }) {
  if (!costData || costData.length === 0) {
    return null;
  }

  // Extract unique store names from the cost data
  const storeNames = [...new Set(
    costData.flatMap(item =>
      item.storePrices ? item.storePrices.map(sp => sp.storeName) : []
    )
  )];

  // Calculate totals per store
  const storeTotals = storeNames.reduce((acc, storeName) => {
    const total = costData.reduce((sum, item) => {
      const storePrice = item.storePrices?.find(sp => sp.storeName === storeName);
      return sum + (storePrice?.price || 0);
    }, 0);
    acc[storeName] = total;
    return acc;
  }, {});

  // Find cheapest store overall
  const cheapestStore = Object.entries(storeTotals).reduce((min, [store, total]) => {
    return total < min.total ? { store, total } : min;
  }, { store: null, total: Infinity });

  // Find cheapest price for each ingredient
  const getCheapestForIngredient = (storePrices) => {
    if (!storePrices || storePrices.length === 0) return null;
    return storePrices.reduce((min, sp) => {
      return sp.price < min.price ? sp : min;
    });
  };

  // Sort stores cheapest-first so both the mobile cards and the desktop grid
  // lead with the best overall deal.
  const sortedStoreNames = [...storeNames].sort((a, b) => storeTotals[a] - storeTotals[b]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Comparison Results</h3>

      {/* Mobile: stacked store cards, cheapest first */}
      <div className="md:hidden flex flex-col gap-3">
        {sortedStoreNames.map(storeName => {
          const total = storeTotals[storeName];
          const isCheapest = cheapestStore.store === storeName;

          return (
            <details key={storeName} open={isCheapest} className="group border border-gray-200 rounded-lg bg-white overflow-hidden">
              <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none">
                <div className="flex items-center gap-2 min-w-0">
                  {isCheapest && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-white bg-forest-dark px-1.5 py-0.5 rounded">
                      Best
                    </span>
                  )}
                  <span className="font-semibold text-gray-900 truncate">{storeName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-lg font-bold ${isCheapest ? 'text-forest-dark' : 'text-gray-900'}`}>
                    ${total.toFixed(2)}
                  </span>
                  <ChevronIcon className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
                </div>
              </summary>
              <div className="border-t border-gray-100 divide-y divide-gray-100">
                {costData.map((item, idx) => {
                  const storePrice = item.storePrices?.find(sp => sp.storeName === storeName);
                  const cheapest = getCheapestForIngredient(item.storePrices);
                  const isItemCheapest = !!(cheapest && storePrice && cheapest.storeName === storeName);

                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                      <div className="min-w-0">
                        <div className="text-gray-700 truncate">{item.ingredient}</div>
                        <div className="text-xs text-gray-400">{item.quantity} {item.unit}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {storePrice?.confidence && <ConfidenceBadge confidence={storePrice.confidence} />}
                        {storePrice ? (
                          <span className={isItemCheapest ? 'font-semibold text-forest-dark' : 'text-gray-700'}>
                            ${storePrice.price.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-300">N/A</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>

      {/* Desktop: ingredient x store comparison grid */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sticky left-0 bg-gray-50">
                Ingredient
              </th>
              {sortedStoreNames.map(storeName => (
                <th key={storeName} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 min-w-[120px]">
                  {storeName}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-forest-dark bg-forest-dark/5 min-w-[120px]">
                Best Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {costData.map((item, idx) => {
              const cheapest = getCheapestForIngredient(item.storePrices);

              return (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white">
                    {item.ingredient}
                    <div className="text-xs text-gray-400">{item.quantity} {item.unit}</div>
                  </td>

                  {sortedStoreNames.map(storeName => {
                    const storePrice = item.storePrices?.find(sp => sp.storeName === storeName);
                    const isCheapest = cheapest && storePrice && cheapest.storeName === storeName;

                    return (
                      <td
                        key={storeName}
                        className={`px-4 py-3 text-center ${isCheapest ? 'bg-forest-dark/5' : ''}`}
                      >
                        {storePrice ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={isCheapest ? 'font-semibold text-forest-dark' : 'text-gray-700'}>
                              ${storePrice.price.toFixed(2)}
                            </span>
                            {storePrice.confidence && <ConfidenceBadge confidence={storePrice.confidence} />}
                          </div>
                        ) : (
                          <span className="text-gray-300">N/A</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="px-4 py-3 text-center bg-forest-dark/5">
                    {cheapest ? (
                      <>
                        <span className="font-semibold text-forest-dark">${cheapest.price.toFixed(2)}</span>
                        <div className="text-xs text-gray-500">{cheapest.storeName}</div>
                      </>
                    ) : (
                      <span className="text-gray-300">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
              <td className="px-4 py-3 text-gray-900 sticky left-0 bg-gray-50">
                Total
              </td>
              {sortedStoreNames.map(storeName => {
                const total = storeTotals[storeName];
                const isCheapest = cheapestStore.store === storeName;

                return (
                  <td
                    key={storeName}
                    className={`px-4 py-3 text-center ${isCheapest ? 'bg-forest-dark text-white' : 'text-gray-900'}`}
                  >
                    ${total.toFixed(2)}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-center bg-forest-dark text-white">
                ${cheapestStore.total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          Prices highlighted in <span className="font-semibold text-forest-dark">green</span> are the
          cheapest for each item, and the Total row shows which store offers the best overall price for
          your recipe.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {Object.entries(CONFIDENCE_BADGE).filter(([k]) => k !== 'free').map(([key, { label, className }]) => (
            <span key={key} className={`px-1.5 py-0.5 rounded font-medium ${className}`}>
              {label}
            </span>
          ))}
          <span className="text-gray-400">— price source confidence</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Note: Prices are estimates and may vary. Please verify at checkout.
        </p>
      </div>
      <PoweredBy sources={activeSources(costData)} />
    </div>
  );
}
