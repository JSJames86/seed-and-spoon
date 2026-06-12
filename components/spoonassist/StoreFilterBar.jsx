'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Chip from './ui/Chip';
import StoreFilterSheet from './StoreFilterSheet';

const STORAGE_KEY = 'spoonassist_store_filter_v1';
const MAX_NEARBY = 4;

function loadStoredState() {
  if (typeof window === 'undefined') return { selectedKeys: [], usageOrder: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { selectedKeys: [], usageOrder: [] };
    const parsed = JSON.parse(raw);
    return {
      selectedKeys: Array.isArray(parsed.selectedKeys) ? parsed.selectedKeys : [],
      usageOrder: Array.isArray(parsed.usageOrder) ? parsed.usageOrder : [],
    };
  } catch {
    return { selectedKeys: [], usageOrder: [] };
  }
}

function saveStoredState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* storage full or unavailable */ }
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

export function RetailerLogo({ retailer, size = 20 }) {
  if (!retailer?.retailer_logo_url) return null;
  return (
    <img
      src={retailer.retailer_logo_url}
      alt=""
      className="rounded-full object-contain shrink-0"
      style={{ width: size, height: size }}
      onError={e => { e.currentTarget.style.display = 'none'; }}
    />
  );
}

// Compact, always-one-row store filter sourced from the Instacart retailers
// response. "Any store" is active when no retailers are selected. Up to
// MAX_NEARBY nearby/most-used retailers render inline; everything else lives
// in the "All stores" bottom sheet. Selection + most-used order persist to
// localStorage so they survive reload.
export default function StoreFilterBar({ retailers, selectedKeys, onChange, loading }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [usageOrder, setUsageOrder] = useState([]);
  const hydratedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const allStoresBtnRef = useRef(null);

  onChangeRef.current = onChange;

  // Hydrate persisted selection + most-used order on mount.
  useEffect(() => {
    const stored = loadStoredState();
    setUsageOrder(stored.usageOrder);
    if (stored.selectedKeys.length > 0) {
      onChangeRef.current(stored.selectedKeys);
    }
    hydratedRef.current = true;
  }, []);

  // Persist selection + most-used order.
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveStoredState({ selectedKeys, usageOrder });
  }, [selectedKeys, usageOrder]);

  const retailerByKey = useMemo(() => {
    const map = new Map();
    for (const r of retailers || []) map.set(r.retailer_key, r);
    return map;
  }, [retailers]);

  // Order: by distance when the API provides it, otherwise most-recently-used
  // first, falling back to API order.
  const orderedRetailers = useMemo(() => {
    const list = retailers || [];
    const hasDistance = list.some(r => typeof r.distance === 'number');
    if (hasDistance) {
      return [...list].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    if (usageOrder.length > 0) {
      const used = usageOrder.map(k => retailerByKey.get(k)).filter(Boolean);
      const usedKeys = new Set(used.map(r => r.retailer_key));
      const rest = list.filter(r => !usedKeys.has(r.retailer_key));
      return [...used, ...rest];
    }
    return list;
  }, [retailers, usageOrder, retailerByKey]);

  const nearby = orderedRetailers.slice(0, MAX_NEARBY);
  const nearbyKeys = useMemo(() => new Set(nearby.map(r => r.retailer_key)), [nearby]);

  const extraSelected = useMemo(
    () => selectedKeys
      .filter(k => !nearbyKeys.has(k))
      .map(k => retailerByKey.get(k))
      .filter(Boolean),
    [selectedKeys, nearbyKeys, retailerByKey]
  );

  const toggleRetailer = (key) => {
    const isSelected = selectedKeys.includes(key);
    onChange(isSelected ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key]);
    if (!isSelected) {
      setUsageOrder(prev => [key, ...prev.filter(k => k !== key)].slice(0, 12));
    }
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    requestAnimationFrame(() => allStoresBtnRef.current?.focus());
  };

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-spoon-subtext">
        <svg className="animate-spin h-4 w-4 text-spoon-mint" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Finding nearby stores…
      </div>
    );
  }

  if (!retailers || retailers.length === 0) return null;

  const totalCount = retailers.length;
  const selectedCount = selectedKeys.length;

  return (
    <div className="mt-3">
      <p className="text-sm text-spoon-subtext mb-2">
        {selectedCount === 0
          ? `Searching all ${totalCount} stores near you`
          : `Searching ${selectedCount} selected store${selectedCount === 1 ? '' : 's'}`}
      </p>

      {/* Compact filter bar — always one row */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Filter by store"
      >
        <Chip active={selectedCount === 0} onClick={() => onChange([])}>
          Any store
        </Chip>

        {nearby.map(r => (
          <Chip
            key={r.retailer_key}
            active={selectedKeys.includes(r.retailer_key)}
            onClick={() => toggleRetailer(r.retailer_key)}
          >
            <RetailerLogo retailer={r} />
            {r.name}
          </Chip>
        ))}

        <Chip
          ref={allStoresBtnRef}
          active={false}
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
        >
          All stores
          <ChevronDownIcon />
        </Chip>
      </div>

      {/* Selections picked from the sheet that aren't in the nearby row */}
      {extraSelected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {extraSelected.map(r => (
            <button
              key={r.retailer_key}
              type="button"
              onClick={() => toggleRetailer(r.retailer_key)}
              className="inline-flex items-center gap-1.5 rounded-full bg-spoon-mint-tint text-spoon-ink text-sm font-medium pl-2.5 pr-2 py-1.5 spoon-transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spoon-mint focus-visible:ring-offset-2"
            >
              <RetailerLogo retailer={r} size={16} />
              {r.name}
              <span aria-hidden="true">✕</span>
              <span className="sr-only">Remove {r.name}</span>
            </button>
          ))}
        </div>
      )}

      <StoreFilterSheet
        open={sheetOpen}
        onClose={handleCloseSheet}
        retailers={retailers}
        selectedKeys={selectedKeys}
        onToggle={toggleRetailer}
      />
    </div>
  );
}
