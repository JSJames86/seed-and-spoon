'use client';

import { useState } from 'react';
import SpoonButton from './ui/Button';
import { spoonInputClass, spoonLabelClass } from './ui/Input';

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
      <h3 className="text-lg font-semibold text-spoon-ink mb-3">Find Local Stores</h3>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="zip-input" className={spoonLabelClass}>
            ZIP Code
          </label>
          <input
            id="zip-input"
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="e.g., 08081"
            maxLength={5}
            className={spoonInputClass}
          />
        </div>
        <div className="flex items-end">
          <SpoonButton
            onClick={handleFindStores}
            disabled={zip.length !== 5 || loading}
            variant="primary"
          >
            {loading ? 'Searching...' : 'Find Stores'}
          </SpoonButton>
        </div>
      </div>

      {stores.length > 0 && (
        <div className="spoon-glass-lite rounded-spoon-card p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-spoon-ink">Available Stores ({stores.length})</h4>
            <button
              onClick={handleSelectAll}
              className="text-sm text-spoon-mint font-medium hover:underline"
            >
              {selectedStores.length === stores.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stores.map(store => (
              <label
                key={store.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 cursor-pointer spoon-transition"
              >
                <input
                  type="checkbox"
                  checked={selectedStores.includes(store.id)}
                  onChange={() => handleStoreToggle(store.id)}
                  className="w-4 h-4 text-spoon-mint accent-spoon-mint border-gray-300 rounded focus:ring-spoon-mint"
                />
                <div className="flex-1">
                  <div className="font-medium text-spoon-ink">{store.name}</div>
                  {store.address && (
                    <div className="text-sm text-spoon-subtext">{store.address}</div>
                  )}
                  {store.distance && (
                    <div className="text-xs text-spoon-subtext">{store.distance} miles away</div>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="mt-3 text-sm text-spoon-subtext">
            {selectedStores.length} of {stores.length} stores selected
          </div>
        </div>
      )}

      {stores.length === 0 && !loading && zip.length === 5 && (
        <div className="text-center py-6 text-spoon-subtext">
          No stores found for this ZIP code. Try a different area.
        </div>
      )}
    </div>
  );
}
