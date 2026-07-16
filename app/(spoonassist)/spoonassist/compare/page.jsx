'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePlan } from '@/components/spoonassist/PlanProvider';
import EmptyState from '@/components/spoonassist/EmptyState';
import PillButton from '@/components/spoonassist/PillButton';
import StoreCard from '@/components/spoonassist/StoreCard';
import ShareListButtons from '@/components/spoonassist/ShareListButtons';
import PoweredBy from '@/components/spoonassist/PoweredBy';
import { Skeleton } from '@/components/spoonassist/Skeleton';
import { itemRowKey } from '@/lib/spoonassist/consolidateList';
import { captureEvent } from '@/analytics/posthog';
import { EVENTS } from '@/analytics/events';

// Price comparison across stores (spec §4.6), reusing the pricing engine
// the classic wizard already uses. As of the Phase 1 pricing-provider-
// abstraction refactor, calculateRecipeCost() delegates to the pluggable
// provider registry in lib/pricing/ (see that directory and
// /api/pricing/resolve), so every total here traces to a PriceQuote with
// source/confidence/asOf -- surfaced per-store via the provenance badge on
// each StoreCard (summary.storeProvenance).
//
// Instacart-quarantine (Phase 2): the Instacart CTA does not render on this
// screen. Instacart's compliance rule is that the CTA and multi-retailer
// totals must never share a screen, scroll container, or be one tap apart
// in a way that frames Instacart as the checkout for a comparison result --
// so the handoff moved to the finalized list page (/spoonassist/list),
// which shows no comparative pricing at all. This screen instead offers a
// plain "Shop at [Retailer]" outbound link per store card (data/retailerLinks.js)
// -- no API, no partner approval required.

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Optional split-basket view (spec §4.6, "Phase 4+"): the cheapest
// combination across exactly 2 stores, buying each item from whichever of
// the pair prices it lower. Simple pairwise search (a handful of stores at
// most), not a full N-store optimizer.
function bestTwoStoreSplit(costData, storeNames) {
  let best = null;
  for (let i = 0; i < storeNames.length; i++) {
    for (let j = i + 1; j < storeNames.length; j++) {
      const [a, b] = [storeNames[i], storeNames[j]];
      const total = costData.reduce((sum, item) => {
        const pa = item.storePrices.find((sp) => sp.storeName === a)?.price;
        const pb = item.storePrices.find((sp) => sp.storeName === b)?.price;
        const candidates = [pa, pb].filter((p) => p != null);
        return sum + (candidates.length ? Math.min(...candidates) : 0);
      }, 0);
      if (!best || total < best.total) best = { storeA: a, storeB: b, total: round2(total) };
    }
  }
  return best;
}

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
  const [errorReason, setErrorReason] = useState(null); // 'no-stores' | 'lookup-failed'
  const [stores, setStores] = useState([]);
  const [costData, setCostData] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('/api/features/').then((r) => r.json()).then(setFeatures).catch(() => {});
  }, []);

  const split = useMemo(() => {
    if (!summary || stores.length < 2) return null;
    const best = bestTwoStoreSplit(costData, stores.map((s) => s.name));
    // Only worth surfacing if splitting actually beats the single cheapest store.
    return best && best.total < summary.cheapestTotal ? best : null;
  }, [costData, stores, summary]);

  const activeItems = plan.consolidatedItems.filter((item) => !plan.checkedKeys.includes(itemRowKey(item)));

  if (plan.hydrated && activeItems.length === 0) {
    return (
      <EmptyState
        variant="utensils"
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
      captureEvent(EVENTS.SPOONASSIST_V2_COMPARE_VIEWED, {
        store_count: foundStores.length,
        item_count: activeItems.length,
        cheapest_total: data.summary?.cheapestTotal ?? null,
      });
    } catch (err) {
      console.error('[SpoonAssist compare] price comparison failed:', err.message);
      setErrorReason(err.message === 'no-stores' ? 'no-stores' : 'lookup-failed');
      setStatus('error');
    }
  };

  const handleShopAtClick = ({ chainId, url }, total) => {
    captureEvent(EVENTS.SPOONASSIST_V2_RETAILER_DEEPLINK_CLICKED, {
      chainId,
      // This app has no server-side persisted shopping list -- lists live in
      // PlanProvider's localStorage state, so there's no stable id to send.
      listId: null,
      total,
      url,
    });
  };

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

      {status === 'loading' && (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-5">
          <p className="text-[15px] text-[var(--sa-warning)]">
            {errorReason === 'no-stores'
              ? "We couldn't find any stores in your area yet. Try a nearby ZIP code."
              : "We're having trouble looking up prices right now. Please try again in a bit."}
          </p>
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
                  storeId={store.id}
                  name={store.name}
                  total={total}
                  deltaFromMostExpensive={mostExpensive != null ? mostExpensive - total : null}
                  availableCount={availableCount}
                  itemCount={activeItems.length}
                  isBest={store.name === summary.cheapestStore}
                  onShopAtClick={(link) => handleShopAtClick(link, total)}
                  provenance={summary.storeProvenance?.[store.name] ?? null}
                />
              ))}
          </div>

          {split && (
            <div className="mt-4 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface-alt)] p-4">
              <p className="text-[15px] font-semibold text-[var(--sa-ink)]">
                Split between {split.storeA} &amp; {split.storeB}: ${split.total.toFixed(2)}
              </p>
              <p className="mt-0.5 text-[13px] text-[var(--sa-ink-soft)]">
                Saves ${round2(summary.cheapestTotal - split.total).toFixed(2)} more than one store &mdash; the tradeoff is 2 stops instead of 1.
              </p>
            </div>
          )}

          <PoweredBy
            compact
            sources={[...(features.kroger ? ['kroger'] : []), 'usda']}
          />

          <div className="mt-8">
            <div className="rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-5 shadow-[var(--sa-shadow-card)]">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-[var(--sa-ink)]">Choose where to shop</p>
                  <p className="text-[13px] text-[var(--sa-ink-soft)]">Best total: {summary.cheapestStore} &middot; ${summary.cheapestTotal.toFixed(2)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ShareListButtons
                    ingredients={activeItems.map((i) => ({ name: i.name, amount: i.quantity, unit: i.unit }))}
                    listTitle="My SpoonAssist list"
                  />
                  <PillButton variant="secondary" size="sm" onClick={() => downloadCsv(costData)}>
                    Export CSV
                  </PillButton>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
