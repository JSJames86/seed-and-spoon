'use client';

import PoweredBy from './PoweredBy';

const CONFIDENCE_BADGE = {
  live:      { label: 'Live',      className: 'bg-spoon-mint-tint text-spoon-mint' },
  cached:    { label: 'Cached',    className: 'bg-white/60 text-spoon-subtext' },
  community: { label: 'Community', className: 'bg-white/60 text-spoon-subtext' },
  usda:      { label: 'USDA',      className: 'bg-white/60 text-spoon-subtext' },
  estimated: { label: 'Est.',      className: 'bg-white/60 text-spoon-subtext' },
  free:      { label: 'Free',      className: 'bg-white/60 text-spoon-subtext' },
};

function ConfidenceBadge({ confidence }) {
  const badge = CONFIDENCE_BADGE[confidence] || CONFIDENCE_BADGE.estimated;
  return (
    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.className}`}>
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
      <h3 className="text-lg font-semibold text-spoon-ink mb-3">Price Comparison Results</h3>

      {/* Mobile: stacked store cards, cheapest first */}
      <div className="md:hidden flex flex-col gap-3">
        {sortedStoreNames.map(storeName => {
          const total = storeTotals[storeName];
          const isCheapest = cheapestStore.store === storeName;

          return (
            <details key={storeName} open={isCheapest} className="group spoon-glass-lite rounded-spoon-card overflow-hidden">
              <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none">
                <div className="flex items-center gap-2 min-w-0">
                  {isCheapest && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-white bg-spoon-mint px-1.5 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                  <span className="font-semibold text-spoon-ink truncate">{storeName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-lg font-bold ${isCheapest ? 'text-spoon-mint' : 'text-spoon-ink'}`}>
                    ${total.toFixed(2)}
                  </span>
                  <ChevronIcon className="h-4 w-4 text-spoon-subtext spoon-transition group-open:rotate-180" />
                </div>
              </summary>
              <div className="border-t border-white/60 divide-y divide-white/60">
                {costData.map((item, idx) => {
                  const storePrice = item.storePrices?.find(sp => sp.storeName === storeName);
                  const cheapest = getCheapestForIngredient(item.storePrices);
                  const isItemCheapest = !!(cheapest && storePrice && cheapest.storeName === storeName);

                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                      <div className="min-w-0">
                        <div className="text-spoon-ink truncate">{item.ingredient}</div>
                        <div className="text-xs text-spoon-subtext">{item.quantity} {item.unit}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {storePrice?.confidence && <ConfidenceBadge confidence={storePrice.confidence} />}
                        {storePrice ? (
                          <span className={isItemCheapest ? 'font-semibold text-spoon-mint' : 'text-spoon-ink'}>
                            ${storePrice.price.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-spoon-subtext">N/A</span>
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
      <div className="hidden md:block overflow-x-auto spoon-glass-lite rounded-spoon-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-spoon-subtext sticky left-0 bg-white/40">
                Ingredient
              </th>
              {sortedStoreNames.map(storeName => (
                <th key={storeName} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-spoon-subtext min-w-[120px]">
                  {storeName}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-spoon-mint bg-spoon-mint-tint min-w-[120px]">
                Best Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60">
            {costData.map((item, idx) => {
              const cheapest = getCheapestForIngredient(item.storePrices);

              return (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium text-spoon-ink sticky left-0 bg-white/30">
                    {item.ingredient}
                    <div className="text-xs text-spoon-subtext">{item.quantity} {item.unit}</div>
                  </td>

                  {sortedStoreNames.map(storeName => {
                    const storePrice = item.storePrices?.find(sp => sp.storeName === storeName);
                    const isCheapest = cheapest && storePrice && cheapest.storeName === storeName;

                    return (
                      <td
                        key={storeName}
                        className={`px-4 py-3 text-center ${isCheapest ? 'bg-spoon-mint-tint' : ''}`}
                      >
                        {storePrice ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={isCheapest ? 'font-semibold text-spoon-mint' : 'text-spoon-ink'}>
                              ${storePrice.price.toFixed(2)}
                            </span>
                            {storePrice.confidence && <ConfidenceBadge confidence={storePrice.confidence} />}
                          </div>
                        ) : (
                          <span className="text-spoon-subtext">N/A</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="px-4 py-3 text-center bg-spoon-mint-tint">
                    {cheapest ? (
                      <>
                        <span className="font-semibold text-spoon-mint">${cheapest.price.toFixed(2)}</span>
                        <div className="text-xs text-spoon-subtext">{cheapest.storeName}</div>
                      </>
                    ) : (
                      <span className="text-spoon-subtext">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-white/60 bg-white/40 font-bold">
              <td className="px-4 py-3 text-spoon-ink sticky left-0 bg-white/40">
                Total
              </td>
              {sortedStoreNames.map(storeName => {
                const total = storeTotals[storeName];
                const isCheapest = cheapestStore.store === storeName;

                return (
                  <td
                    key={storeName}
                    className={`px-4 py-3 text-center ${isCheapest ? 'bg-spoon-ink text-white' : 'text-spoon-ink'}`}
                  >
                    ${total.toFixed(2)}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-center bg-spoon-ink text-white">
                ${cheapestStore.total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 p-4 spoon-glass-lite rounded-spoon-card">
        <p className="text-sm text-spoon-ink">
          Prices highlighted in <span className="font-semibold text-spoon-mint">mint</span> are the
          cheapest for each item, and the Total row shows which store offers the best overall price for
          your recipe.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {Object.entries(CONFIDENCE_BADGE).filter(([k]) => k !== 'free').map(([key, { label, className }]) => (
            <span key={key} className={`px-1.5 py-0.5 rounded-full font-medium ${className}`}>
              {label}
            </span>
          ))}
          <span className="text-spoon-subtext">— price source confidence</span>
        </div>
        <p className="text-xs text-spoon-subtext mt-2">
          Note: Prices are estimates and may vary. Please verify at checkout.
        </p>
      </div>
      <PoweredBy sources={activeSources(costData)} />
    </div>
  );
}
