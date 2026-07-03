'use client';

import { useEffect, useMemo, useState } from 'react';
import { useHousehold } from '@/components/spoonassist/useHousehold';
import SignedOutPrompt from '@/components/spoonassist/SignedOutPrompt';
import PillButton from '@/components/spoonassist/PillButton';
import EmptyState from '@/components/spoonassist/EmptyState';
import { ListRowSkeleton } from '@/components/spoonassist/Skeleton';

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 5h9M6.5 5V3.5h3V5M6.5 7.5v4M9.5 7.5v4M4.5 5l.6 8a1 1 0 001 .9h3.8a1 1 0 001-.9l.6-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddItemForm({ householdId, onAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2 || selected) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`/api/spoonassist/ingredients/search?q=${encodeURIComponent(query)}`)
        .then((res) => (res.ok ? res.json() : { ingredients: [] }))
        .then((data) => {
          if (!cancelled) setResults(data.ingredients || []);
        })
        .catch(() => {});
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, selected]);

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/spoonassist/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdId,
          items: [{ canonicalId: selected.id, remaining: Number(quantity) || 0 }],
        }),
      });
      if (res.ok) {
        onAdded({ canonicalId: selected.id, name: selected.name, unit: selected.standardUnit, remaining: Number(quantity) || 0 });
        setQuery('');
        setSelected(null);
        setQuantity('1');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-4 shadow-[var(--sa-shadow-card)]">
      <div className="relative">
        <input
          type="text"
          value={selected ? selected.name : query}
          onChange={(e) => {
            setSelected(null);
            setQuery(e.target.value);
          }}
          placeholder="Search ingredients (e.g. rice, eggs)..."
          className="w-full rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-4 py-2.5 text-[15px] text-[var(--sa-ink)] placeholder:text-[var(--sa-ink-soft)] outline-none"
        />
        {results.length > 0 && !selected && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] shadow-[var(--sa-shadow-card)]">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelected(r);
                  setResults([]);
                }}
                className="block w-full px-4 py-2.5 text-left text-[14px] text-[var(--sa-ink)] hover:bg-[var(--sa-surface-alt)]"
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-24 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-3 py-2 text-[14px] text-[var(--sa-ink)] outline-none"
          aria-label="Quantity"
        />
        {selected?.standardUnit && <span className="text-[13px] text-[var(--sa-ink-soft)]">{selected.standardUnit}</span>}
        <PillButton type="submit" size="sm" disabled={!selected || saving} className="ml-auto">
          {saving ? 'Adding…' : '+ Add to pantry'}
        </PillButton>
      </div>
    </form>
  );
}

export default function PantryPage() {
  const { status, householdId } = useHousehold();
  const [items, setItems] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (status !== 'ready' || !householdId) return;
    fetch(`/api/spoonassist/pantry?householdId=${householdId}`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]));
  }, [status, householdId]);

  const handleAdded = (newItem) => {
    setItems((prev) => {
      const existing = prev || [];
      const withoutDup = existing.filter((i) => i.canonicalId !== newItem.canonicalId);
      return [...withoutDup, { ...newItem, expiresInDays: null }];
    });
  };

  const startEdit = (item) => {
    setEditingId(item.canonicalId);
    setEditValue(String(item.remaining ?? ''));
  };

  const saveEdit = async (item) => {
    const remaining = Number(editValue) || 0;
    setEditingId(null);
    setItems((prev) => prev.map((i) => (i.canonicalId === item.canonicalId ? { ...i, remaining } : i)));
    await fetch('/api/spoonassist/pantry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ householdId, items: [{ canonicalId: item.canonicalId, remaining }] }),
    });
  };

  const deleteItem = async (item) => {
    setItems((prev) => prev.filter((i) => i.canonicalId !== item.canonicalId));
    await fetch(`/api/spoonassist/pantry?householdId=${householdId}&canonicalId=${encodeURIComponent(item.canonicalId)}`, {
      method: 'DELETE',
    });
  };

  const sorted = useMemo(() => [...(items || [])].sort((a, b) => a.name.localeCompare(b.name)), [items]);

  if (status === 'signed-out') return <SignedOutPrompt title="Your pantry lives here once you sign up" />;

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">Pantry</h1>
      <p className="mt-1 text-[15px] text-[var(--sa-ink-soft)]">
        What you already have on hand -- SpoonAssist skips these when suggesting recipes.
      </p>

      {status === 'ready' && householdId && (
        <div className="mt-5">
          <AddItemForm householdId={householdId} onAdded={handleAdded} />
        </div>
      )}

      <div className="mt-5 space-y-2">
        {(status === 'loading' || items === null) &&
          Array.from({ length: 4 }).map((_, i) => <ListRowSkeleton key={i} />)}

        {status === 'ready' && items !== null && sorted.length === 0 && (
          <EmptyState title="Your pantry is empty" description="Add a few staples above -- rice, pasta, beans, eggs are a good start." />
        )}

        {sorted.map((item) => (
          <div
            key={item.canonicalId}
            className="flex items-center gap-3 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] px-4 py-3 shadow-[var(--sa-shadow-card)]"
          >
            <span className="flex-1 text-[15px] text-[var(--sa-ink)]">{item.name}</span>
            {editingId === item.canonicalId ? (
              <input
                type="number"
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveEdit(item)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(item)}
                className="w-20 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-2 py-1 text-[14px] text-[var(--sa-ink)] outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="text-[14px] font-semibold text-[var(--sa-ink)] underline-offset-2 hover:underline"
              >
                {item.remaining ?? 0}
                {item.unit ? ` ${item.unit}` : ''}
              </button>
            )}
            <button
              type="button"
              aria-label={`Remove ${item.name}`}
              onClick={() => deleteItem(item)}
              className="shrink-0 text-[var(--sa-ink-soft)] hover:text-[var(--sa-warning)]"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
