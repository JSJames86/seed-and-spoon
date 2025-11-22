'use client';

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

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Price Comparison Results</h3>

      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100">
                Ingredient
              </th>
              {storeNames.map(storeName => (
                <th key={storeName} className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[120px]">
                  {storeName}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-gray-700 bg-green-100 min-w-[120px]">
                Cheapest
              </th>
            </tr>
          </thead>
          <tbody>
            {costData.map((item, idx) => {
              const cheapest = getCheapestForIngredient(item.storePrices);

              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-inherit">
                    {item.ingredient}
                    <div className="text-xs text-gray-500">
                      {item.quantity} {item.unit}
                    </div>
                  </td>

                  {storeNames.map(storeName => {
                    const storePrice = item.storePrices?.find(sp => sp.storeName === storeName);
                    const price = storePrice?.price;
                    const isCheapest = cheapest && storePrice && cheapest.storeName === storeName;

                    return (
                      <td
                        key={storeName}
                        className={`px-4 py-3 text-center ${
                          isCheapest ? 'bg-green-50 font-semibold text-green-700' : ''
                        }`}
                      >
                        {price !== undefined && price !== null ? (
                          `$${price.toFixed(2)}`
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="px-4 py-3 text-center bg-green-50 font-semibold text-green-700">
                    {cheapest ? `$${cheapest.price.toFixed(2)}` : <span className="text-gray-400">N/A</span>}
                    {cheapest && (
                      <div className="text-xs text-gray-600">{cheapest.storeName}</div>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Totals Row */}
            <tr className="bg-gray-200 font-bold border-t-2 border-gray-400">
              <td className="px-4 py-3 text-gray-900 sticky left-0 bg-gray-200">
                TOTAL
              </td>
              {storeNames.map(storeName => {
                const total = storeTotals[storeName];
                const isCheapest = cheapestStore.store === storeName;

                return (
                  <td
                    key={storeName}
                    className={`px-4 py-3 text-center ${
                      isCheapest ? 'bg-green-200 text-green-800' : 'text-gray-900'
                    }`}
                  >
                    ${total.toFixed(2)}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-center bg-green-200 text-green-800">
                ${cheapestStore.total.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Legend:</strong> Prices highlighted in green are the cheapest for each item.
          The total row shows which store offers the best overall price for your entire recipe.
        </p>
        <p className="text-xs text-blue-600 mt-2">
          Note: Prices are estimates and may vary. Please verify at checkout.
        </p>
      </div>
    </div>
  );
}
