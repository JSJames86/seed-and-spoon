'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlan } from '@/components/spoonassist/PlanProvider';
import EmptyState from '@/components/spoonassist/EmptyState';
import PillButton from '@/components/spoonassist/PillButton';
import StoreCard from '@/components/spoonassist/StoreCard';
import InstacartCTA from '@/components/spoonassist/InstacartCTA';
import PoweredBy from '@/components/spoonassist/PoweredBy';
import { itemRowKey } from '@/lib/spoonassist/consolidateList';

// Price comparison across stores (spec §4.6) + the Instacart handoff
// (§4.7), reusing the pricing engine and Instacart integration the classic
// wizard already uses (lib/spoonassist/priceEngine.js's calculateRecipeCost,
// /api/instacart_shopping_list's server-side affiliate attribution) rather
// than standing up a competing price_quotes table -- stores/store_skus/
// price_snapshots/confirmed_prices (20260614000001) already cover that.

function downloadCsv(costData) {
  const storeNames = [...new Set(costData.flatMap((item) => item.storePrices.map((sp) => sp.storeName)))];
  const headers = ['Ingredient', 'Quantity', 'Unit', ...storeNames];
  const rows = costData.map((item) => [
    item.ingredient,
    item.quantity,
    item.unit,
    ...storeNames.map((s) => {
      const sp = item.storePrices.find((p) => p.storeName === s);
      return sp ? `$${sp.price.toFixed(2)}` : 'N/A';
    }),
  ]);
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spoonassist-list-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SpoonAssistComparePage() {
  const plan = usePlan();
  const [zip, setZip] = useState('');
  const [features, setFeatures] = useState({ kroger: false, instacart: false });
  const [status, setStatus] = useState('zip'); // zip | loading | results | error
  const [stores, setStores] = useState([]);
  const [costData, setCostData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [instacart, setInstacart] = useState({ loading: false, url: null, error: null, confirmed: false });

  useEffect(() => {
    fetch('/api/features/').then((r) => r.json()).then(setFeatures).catch(() => {});
  }, []);

  const activeItems = plan.consolidatedItems.filter((item) => !plan.checkedKeys.includes(itemRowKey(item)));

  if (plan.hydrated && activeItems.length === 0) {
    return (
      <EmptyState
        title="Nothing to compare yet"
        description="Build a shopping list first, then come back here to compare store prices."
        action={
          <PillButton as={Link} href="/spoonassist/list">
            Back to list
          </PillButton>
        }
      />
    );
  }

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) return;
    setStatus('loading');

    try {
      const storesRes = await fetch(`/api/stores?zip=${zip}`);
      if (!storesRes.ok) throw new Error('stores');
      const { stores: foundStores } = await storesRes.json();
      if (!foundStores?.length) throw new Error('no-stores');

      const costRes = await fetch('/api/calc_recipe_cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: activeItems.map((i) => ({ name: i.name, quantity: i.quantity ?? 1, unit: i.unit ?? 'each' })),
          storeIds: foundStores.map((s) => s.id),
          zipCode: zip,
        }),
      });
      if (!costRes.ok) throw new Error('cost');
      const data = await costRes.json();

      setStores(foundStores);
      setCostData(data.costData);
      setSummary(data.summary);
      setStatus('results');
    } catch {
      setStatus('error');
    }
  };

  const handleSendToInstacart = async () => {
    setInstacart({ loading: true, url: null, error: null, confirmed: false });
    try {
      const res = await fetch('/api/instacart_shopping_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'My SpoonAssist list',
          ingredients: activeItems.map((i) => ({ name: i.name, quantity: i.quantity ?? 1, unit: i.unit ?? 'each' })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setInstacart({ loading: false, url: data.url, error: null, confirmed: true });
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setInstacart({ loading: false, url: null, error: err.message, confirmed: false });
    }
  };

  const handleCopyList = () => {
    const text = activeItems.map((i) => `${i.quantity ? `${i.quantity} ` : ''}${i.unit ? `${i.unit} ` : ''}${i.name}`).join('\n');
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  const sharedItemCount = plan.consolidatedItems.filter((i) => i.sourceRecipeIds.length > 1).length;
  const mostExpensive = summary ? Math.max(...Object.values(summary.storeTotals)) : null;

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">Compare prices</h1>
      <p className="text-[15px] text-[var(--sa-ink-soft)]">{activeItems.length} items on your list</p>

      {status === 'zip' && (
        <form onSubmit={handleCompare} className="mt-5 flex items-center gap-2 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface)] px-4 py-2 shadow-[var(--sa-shadow-card)]">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
            placeholder="ZIP code"
            className="flex-1 bg-transparent text-[15px] text-[var(--sa-ink)] placeholder:text-[var(--sa-ink-soft)] outline-none"
          />
          <PillButton type="submit" disabled={!/^\d{5}$/.test(zip)}>
            Find prices
          </PillButton>
        </form>
      )}

      {status === 'loading' && <p className="mt-5 text-[15px] text-[var(--sa-ink-soft)]">Comparing prices...</p>}

      {status === 'error' && (
        <div className="mt-5">
          <p className="text-[15px] text-[var(--sa-warning)]">Couldn&rsquo;t compare prices for that ZIP. Try another.</p>
          <PillButton variant="secondary" className="mt-3" onClick={() => setStatus('zip')}>
            Try again
          </PillButton>
        </div>
      )}

      {status === 'results' && summary && (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stores
              .map((store) => ({
                store,
                total: summary.storeTotals[store.name] ?? 0,
                availableCount: costData.filter((item) =>
                  item.storePrices.some((sp) => sp.storeName === store.name && sp.confidence !== 'estimated')
                ).length,
              }))
              .sort((a, b) => a.total - b.total)
              .map(({ store, total, availableCount }) => (
                <StoreCard
                  key={store.id}
                  name={store.name}
                  total={total}
                  deltaFromMostExpensive={mostExpensive != null ? mostExpensive - total : null}
                  availableCount={availableCount}
                  itemCount={activeItems.length}
                  isBest={store.name === summary.cheapestStore}
                />
              ))}
          </div>

          <PoweredBy
            compact
            sources={[...(features.kroger ? ['kroger'] : []), 'usda']}
          />

          <div className="mt-8 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-5 shadow-[var(--sa-shadow-card)]">
            {instacart.confirmed ? (
              <div className="text-center">
                <p className="text-[17px] font-semibold text-[var(--sa-ink)]">Your list is on its way!</p>
                <p className="mt-1 text-[15px] text-[var(--sa-ink-soft)]">
                  Here&rsquo;s what you saved this week: <strong className="text-[var(--sa-savings)]">${(mostExpensive - summary.cheapestTotal).toFixed(2)}</strong>{' '}
                  and <strong className="text-[var(--sa-savings)]">{sharedItemCount}</strong> duplicate item{sharedItemCount === 1 ? '' : 's'} avoided.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-[var(--sa-ink)]">Ready to shop?</p>
                  <p className="text-[13px] text-[var(--sa-ink-soft)]">Best total: {summary.cheapestStore} &middot; ${summary.cheapestTotal.toFixed(2)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PillButton variant="secondary" size="sm" onClick={handleCopyList}>
                    Copy list
                  </PillButton>
                  <PillButton variant="secondary" size="sm" onClick={() => downloadCsv(costData)}>
                    Export CSV
                  </PillButton>
                  {features.instacart && (
                    <InstacartCTA onClick={handleSendToInstacart} loading={instacart.loading} text="Send to Instacart" />
                  )}
                </div>
              </div>
            )}
            {instacart.error && (
              <p className="mt-2 text-center text-[13px] text-[var(--sa-warning)]">Could not create Instacart list. Please try again.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
