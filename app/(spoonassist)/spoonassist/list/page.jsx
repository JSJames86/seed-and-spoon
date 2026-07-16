'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlan } from '@/components/spoonassist/PlanProvider';
import PillButton from '@/components/spoonassist/PillButton';
import LeverageBadge from '@/components/spoonassist/LeverageBadge';
import EmptyState from '@/components/spoonassist/EmptyState';
import InstacartCTA from '@/components/spoonassist/InstacartCTA';
import ShareListButtons from '@/components/spoonassist/ShareListButtons';
import { ListRowSkeleton } from '@/components/spoonassist/Skeleton';
import { itemRowKey } from '@/lib/spoonassist/consolidateList';
import { captureEvent } from '@/analytics/posthog';
import { EVENTS } from '@/analytics/events';

// Finalized shopping list (spec: List tab). Instacart-quarantine (Phase 2):
// this is the ONLY place the Instacart CTA renders -- moved here from the
// price comparison screen so it never shares a screen with multi-retailer
// totals. This page must never render comparative pricing (no per-store
// totals, no savings deltas, no "best total" copy) -- a single "your list"
// context is fine.

function formatQuantity(n) {
  if (n == null) return '';
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function downloadPlainCsv(items) {
  const headers = ['Ingredient', 'Quantity', 'Unit'];
  const rows = items.map((item) => [item.name, item.quantity ?? '', item.unit ?? '']);
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spoonassist-list-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function ListRow({ item, rowKey, checked, onToggle, onDelete }) {
  const amount = item.quantity != null ? `${formatQuantity(item.quantity)}${item.unit ? ` ${item.unit}` : ''}` : null;
  return (
    <div className={`flex items-center gap-3 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] px-4 py-3 spoon-transition ${checked ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(rowKey)}
        className="h-4 w-4 shrink-0 accent-[var(--sa-green)]"
        aria-label={`Already have ${item.name}`}
      />
      {amount && <span className="w-20 shrink-0 text-[14px] font-semibold text-[var(--sa-ink)]">{amount}</span>}
      <span className={`flex-1 text-[15px] text-[var(--sa-ink)] ${checked ? 'line-through' : ''}`}>
        {item.name}
        {item.ambiguousUnit && (
          <span className="ml-1.5 text-[12px] font-medium text-[var(--sa-warning)]">check amount</span>
        )}
      </span>
      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={() => onDelete(rowKey)}
        className="shrink-0 text-[var(--sa-ink-soft)] hover:text-[var(--sa-warning)]"
      >
        &times;
      </button>
    </div>
  );
}

function FulfillmentSection({ activeItems, instacartEnabled }) {
  const [instacart, setInstacart] = useState({ loading: false, error: null, confirmed: false });

  const handleSendToInstacart = async () => {
    captureEvent(EVENTS.SPOONASSIST_V2_HANDOFF_CLICKED, {
      item_count: activeItems.length,
      // listId: this app has no server-side persisted shopping list.
      listId: null,
      source: 'list_page',
    });
    setInstacart({ loading: true, error: null, confirmed: false });
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
      setInstacart({ loading: false, error: null, confirmed: true });
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setInstacart({ loading: false, error: err.message, confirmed: false });
    }
  };

  if (activeItems.length === 0) return null;

  return (
    <div className="mt-8 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-5 shadow-[var(--sa-shadow-card)]">
      {instacart.confirmed ? (
        <p className="text-center text-[15px] font-semibold text-[var(--sa-ink)]">Your list is on its way!</p>
      ) : (
        <>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div>
              <p className="text-[15px] font-semibold text-[var(--sa-ink)]">Ready to shop?</p>
              <p className="text-[13px] text-[var(--sa-ink-soft)]">{activeItems.length} items on your list</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ShareListButtons
                ingredients={activeItems.map((i) => ({ name: i.name, amount: i.quantity, unit: i.unit }))}
                listTitle="My SpoonAssist list"
              />
              <PillButton variant="secondary" size="sm" onClick={() => downloadPlainCsv(activeItems)}>
                Export CSV
              </PillButton>
              {instacartEnabled && (
                <InstacartCTA onClick={handleSendToInstacart} loading={instacart.loading} text="Shop ingredients" />
              )}
            </div>
          </div>
          {instacart.error && (
            <p className="mt-2 text-center text-[13px] text-[var(--sa-warning)]">Could not create Instacart list. Please try again.</p>
          )}
        </>
      )}
    </div>
  );
}

export default function SpoonAssistListPage() {
  const plan = usePlan();
  const [manualName, setManualName] = useState('');
  const [features, setFeatures] = useState({ instacart: false });

  useEffect(() => {
    fetch('/api/features/').then((r) => r.json()).then(setFeatures).catch(() => {});
  }, []);

  const submitManual = (e) => {
    e.preventDefault();
    plan.addManualItem(manualName);
    setManualName('');
  };

  if (!plan.hydrated) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (plan.consolidatedItems.length === 0) {
    return (
      <EmptyState
        variant="basket"
        title="No shopping list yet"
        description="Build a weekly plan first -- SpoonAssist consolidates and dedupes the ingredients into one smart list."
        action={
          <PillButton as={Link} href="/spoonassist/plan">
            Go to your plan
          </PillButton>
        }
      />
    );
  }

  const checkedRowKeys = new Set(plan.checkedKeys);
  const activeGroups = plan.groupedList
    .map((group) => ({ ...group, items: group.items.filter((item) => !checkedRowKeys.has(itemRowKey(item))) }))
    .filter((group) => group.items.length > 0);
  const haveItItems = plan.consolidatedItems.filter((item) => checkedRowKeys.has(itemRowKey(item)));
  const activeItems = plan.consolidatedItems.filter((item) => !checkedRowKeys.has(itemRowKey(item)));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">Smart list</h1>
          <p className="text-[15px] text-[var(--sa-ink-soft)]">
            {activeGroups.reduce((sum, g) => sum + g.items.length, 0)} items to buy
            {haveItItems.length > 0 ? ` · ${haveItItems.length} already have` : ''}
          </p>
        </div>
        <LeverageBadge score={plan.overallLeverage} />
      </div>

      <form onSubmit={submitManual} className="mt-4 flex items-center gap-2 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface)] px-4 py-2 shadow-[var(--sa-shadow-card)]">
        <input
          type="text"
          value={manualName}
          onChange={(e) => setManualName(e.target.value)}
          placeholder="Add an item..."
          className="flex-1 bg-transparent text-[15px] text-[var(--sa-ink)] placeholder:text-[var(--sa-ink-soft)] outline-none"
        />
        <PillButton type="submit" size="sm" disabled={!manualName.trim()}>
          + Add
        </PillButton>
      </form>

      <div className="mt-5 space-y-6">
        {activeGroups.map((group) => (
          <div key={group.category}>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)]">{group.category}</p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <ListRow
                  key={itemRowKey(item)}
                  item={item}
                  rowKey={itemRowKey(item)}
                  checked={false}
                  onToggle={plan.toggleChecked}
                  onDelete={plan.removeConsolidatedItem}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {haveItItems.length > 0 && (
        <details className="mt-6" open>
          <summary className="cursor-pointer text-[13px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)]">
            Have it ({haveItItems.length})
          </summary>
          <div className="mt-2 space-y-2">
            {haveItItems.map((item) => (
              <ListRow
                key={itemRowKey(item)}
                item={item}
                rowKey={itemRowKey(item)}
                checked
                onToggle={plan.toggleChecked}
                onDelete={plan.removeConsolidatedItem}
              />
            ))}
          </div>
        </details>
      )}

      <FulfillmentSection activeItems={activeItems} instacartEnabled={features.instacart} />

      <div className="mt-6 flex flex-col items-center gap-3">
        <PillButton as={Link} href="/spoonassist/compare" size="lg">
          Compare prices &rarr;
        </PillButton>
        <Link href="/spoonassist/receipts/scan" className="text-[13px] font-medium text-[var(--sa-ink-soft)] underline">
          Scan a receipt to help confirm prices
        </Link>
      </div>
    </div>
  );
}
