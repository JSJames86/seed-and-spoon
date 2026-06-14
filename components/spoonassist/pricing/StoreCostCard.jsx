'use client';

import { useState } from 'react';
import { StatusPill, ConfidencePill } from './StatusPill';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const STATUS_REASON = {
  no_price: 'No confirmed price yet at this store',
  no_conversion: 'Missing a unit conversion for this store',
};

function ChevronIcon({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

export default function StoreCostCard({ recipeId, store, cost, isCheapest }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const complete = cost?.is_basket_complete ?? false;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && items === null && !loading) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/spoonassist/pricing-spine/recipes/${recipeId}/ingredient-costs?storeId=${store.id}`
        );
        if (!res.ok) throw new Error('Failed to load ingredient breakdown');
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        setError('Could not load ingredient breakdown.');
        console.error('Ingredient cost fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={`spoon-glass-lite rounded-spoon-card overflow-hidden ${isCheapest ? 'ring-2 ring-spoon-mint' : ''}`}>
      <button
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left spoon-transition hover:bg-white/40"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isCheapest && (
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-white bg-spoon-mint px-1.5 py-0.5 rounded-full">
                Cheapest
              </span>
            )}
            <span className="font-semibold text-spoon-ink truncate">{store.name}</span>
          </div>
          {store.address && <div className="text-xs text-spoon-subtext mt-0.5 truncate">{store.address}</div>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            {complete ? (
              <div className="text-lg font-bold text-spoon-ink">${Number(cost.total_estimated_cost).toFixed(2)}</div>
            ) : (
              <div className="text-sm font-semibold text-spoon-warning">Incomplete</div>
            )}
            <div className="text-xs text-spoon-subtext mt-0.5">
              {cost ? `${cost.items_ok}/${cost.items_total} priced` : 'No data'}
            </div>
          </div>
          <ChevronIcon className="h-4 w-4 text-spoon-subtext spoon-transition shrink-0" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
        </div>
      </button>

      {open && (
        <div className="border-t border-white/60 px-4 py-3">
          {!complete && cost && (
            <p className="text-sm text-spoon-subtext mb-3">
              {cost.items_no_price > 0 &&
                `${cost.items_no_price} ingredient${cost.items_no_price === 1 ? '' : 's'} missing a price. `}
              {cost.items_no_conversion > 0 &&
                `${cost.items_no_conversion} ingredient${cost.items_no_conversion === 1 ? '' : 's'} missing a unit conversion. `}
              We won&apos;t show a total until every ingredient resolves.
            </p>
          )}
          {cost?.has_estimated_items && (
            <p className="text-xs text-spoon-warning mb-3">
              Some items use estimated conversions (e.g. &ldquo;1 onion ≈ 1/3 lb&rdquo;) — the total is an estimate.
            </p>
          )}

          {loading && <p className="text-sm text-spoon-subtext">Loading ingredient breakdown…</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}

          {items && (
            <ul className="divide-y divide-white/60">
              {items.map(item => (
                <li key={item.recipeIngredientId} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="text-spoon-ink truncate">{item.name}</div>
                    <div className="text-xs text-spoon-subtext truncate">
                      {item.quantity} {item.unit}
                      {item.rawText ? ` · ${item.rawText}` : ''}
                    </div>
                    {item.status !== 'ok' && (
                      <div className="text-xs text-spoon-subtext mt-0.5">{STATUS_REASON[item.status]}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    {item.status === 'ok' ? (
                      <span className="font-semibold text-spoon-ink">${Number(item.itemCost).toFixed(2)}</span>
                    ) : (
                      <StatusPill status={item.status} />
                    )}
                    {item.status === 'ok' && <ConfidencePill confidence={item.confidence} />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
