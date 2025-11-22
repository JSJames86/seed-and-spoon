'use client';

export default function CSVExportButton({ costData, ingredients }) {
  const handleExport = () => {
    if (!costData || costData.length === 0) return;

    // Extract unique store names
    const storeNames = [...new Set(
      costData.flatMap(item =>
        item.storePrices ? item.storePrices.map(sp => sp.storeName) : []
      )
    )];

    // Build CSV content
    const headers = ['Ingredient', 'Quantity', 'Unit', ...storeNames, 'Cheapest Store', 'Cheapest Price'];
    const rows = costData.map(item => {
      const storePrices = storeNames.map(storeName => {
        const storePrice = item.storePrices?.find(sp => sp.storeName === storeName);
        return storePrice?.price !== undefined ? `$${storePrice.price.toFixed(2)}` : 'N/A';
      });

      // Find cheapest
      const cheapest = item.storePrices?.reduce((min, sp) => {
        return sp.price < min.price ? sp : min;
      }, { price: Infinity, storeName: '' });

      return [
        item.ingredient,
        item.quantity,
        item.unit,
        ...storePrices,
        cheapest?.storeName || 'N/A',
        cheapest?.price !== undefined && cheapest.price !== Infinity ? `$${cheapest.price.toFixed(2)}` : 'N/A'
      ];
    });

    // Calculate totals row
    const totals = storeNames.map(storeName => {
      const total = costData.reduce((sum, item) => {
        const storePrice = item.storePrices?.find(sp => sp.storeName === storeName);
        return sum + (storePrice?.price || 0);
      }, 0);
      return `$${total.toFixed(2)}`;
    });

    const cheapestTotal = Math.min(...storeNames.map((storeName, idx) => {
      return parseFloat(totals[idx].replace('$', ''));
    }));

    const totalsRow = ['TOTAL', '', '', ...totals, '', `$${cheapestTotal.toFixed(2)}`];

    // Combine headers, rows, and totals
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      totalsRow.map(cell => `"${cell}"`).join(',')
    ].join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    link.setAttribute('href', url);
    link.setAttribute('download', `spoonassist-shopping-list-${date}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasData = costData && costData.length > 0;

  return (
    <button
      onClick={handleExport}
      disabled={!hasData}
      className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
    >
      {hasData ? 'Export to CSV' : 'No Data to Export'}
    </button>
  );
}
