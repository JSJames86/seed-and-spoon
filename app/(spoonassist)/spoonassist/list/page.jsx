'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlan } from '@/components/spoonassist/PlanProvider';
import PillButton from '@/components/spoonassist/PillButton';
import LeverageBadge from '@/components/spoonassist/LeverageBadge';
import EmptyState from '@/components/spoonassist/EmptyState';
import { ListRowSkeleton } from '@/components/spoonassist/Skeleton';
import { itemRowKey } from '@/lib/spoonassist/consolidateList';

function formatQuantity(n) {
  if (n == null) return '';
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
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

export default function SpoonAssistListPage() {
  const plan = usePlan();
  const [manualName, setManualName] = useState('');

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

      <div className="mt-8 flex justify-center">
        <PillButton as={Link} href="/spoonassist/compare" size="lg">
          Compare prices &rarr;
        </PillButton>
      </div>
    </div>
  );
}
