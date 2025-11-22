'use client';

import { useState } from 'react';

export default function StoreSelector({ onFindStores, stores, selectedStores, onStoreChange, loading }) {
  const [zip, setZip] = useState('');

  const handleFindStores = () => {
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      onFindStores(zip);
    }
  };

  const handleStoreToggle = (storeId) => {
    const newSelection = selectedStores.includes(storeId)
      ? selectedStores.filter(id => id !== storeId)
      : [...selectedStores, storeId];
    onStoreChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedStores.length === stores.length) {
      onStoreChange([]);
    } else {
      onStoreChange(stores.map(s => s.id));
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Find Local Stores</h3>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label htmlFor="zip-input" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <input
            id="zip-input"
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="e.g., 08081"
            maxLength={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleFindStores}
            disabled={zip.length !== 5 || loading}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? 'Searching...' : 'Find Stores'}
          </button>
        </div>
      </div>

      {stores.length > 0 && (
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800">Available Stores ({stores.length})</h4>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedStores.length === stores.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stores.map(store => (
              <label
                key={store.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedStores.includes(store.id)}
                  onChange={() => handleStoreToggle(store.id)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{store.name}</div>
                  {store.address && (
                    <div className="text-sm text-gray-600">{store.address}</div>
                  )}
                  {store.distance && (
                    <div className="text-xs text-gray-500">{store.distance} miles away</div>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="mt-3 text-sm text-gray-600">
            {selectedStores.length} of {stores.length} stores selected
          </div>
        </div>
      )}

      {stores.length === 0 && !loading && zip.length === 5 && (
        <div className="text-center py-6 text-gray-500">
          No stores found for this ZIP code. Try a different area.
        </div>
      )}
    </div>
  );
}
