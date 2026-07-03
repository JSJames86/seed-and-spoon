'use client';

import { useEffect, useState } from 'react';
import { useHousehold } from '@/components/spoonassist/useHousehold';
import SignedOutPrompt from '@/components/spoonassist/SignedOutPrompt';
import PillButton from '@/components/spoonassist/PillButton';
import { Skeleton } from '@/components/spoonassist/Skeleton';

export default function StoresPage() {
  const { status, householdId, household, setHousehold } = useHousehold();
  const [zip, setZip] = useState('');
  const [stores, setStores] = useState([]);
  const [excluded, setExcluded] = useState(new Set());
  const [loadingStores, setLoadingStores] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved

  useEffect(() => {
    if (!household) return;
    setZip(household.zipCode || '');
    setExcluded(new Set(household.excludedStoreIds || []));
    if (household.zipCode) findStores(household.zipCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [household]);

  const findStores = async (z) => {
    if (!/^\d{5}$/.test(z)) return;
    setLoadingStores(true);
    try {
      const res = await fetch(`/api/stores?zip=${z}`);
      const data = await res.json();
      setStores(data.stores || []);
    } catch {
      setStores([]);
    } finally {
      setLoadingStores(false);
    }
  };

  const toggleStore = (id) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaveState('saving');
    try {
      const res = await fetch('/api/spoonassist/household', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode: zip, excludedStoreIds: [...excluded] }),
      });
      if (res.ok) {
        const data = await res.json();
        setHousehold(data.household);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      } else {
        setSaveState('idle');
      }
    } catch {
      setSaveState('idle');
    }
  };

  if (status === 'signed-out') return <SignedOutPrompt title="Set your stores once you sign up" />;

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">Stores & ZIP</h1>
      <p className="mt-1 text-[15px] text-[var(--sa-ink-soft)]">
        Which stores should count when SpoonAssist compares prices.
      </p>

      {status === 'loading' ? (
        <Skeleton className="mt-5 h-12 w-full" />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            findStores(zip);
          }}
          className="mt-5 flex items-center gap-2 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface)] px-4 py-2 shadow-[var(--sa-shadow-card)]"
        >
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
            placeholder="ZIP code"
            className="flex-1 bg-transparent text-[15px] text-[var(--sa-ink)] placeholder:text-[var(--sa-ink-soft)] outline-none"
          />
          <PillButton type="submit" size="sm" disabled={!/^\d{5}$/.test(zip) || loadingStores}>
            {loadingStores ? 'Searching…' : 'Find stores'}
          </PillButton>
        </form>
      )}

      {stores.length > 0 && (
        <div className="mt-5 space-y-2">
          {stores.map((store) => {
            const isExcluded = excluded.has(store.id);
            return (
              <label
                key={store.id}
                className="flex items-center justify-between gap-3 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] px-4 py-3 shadow-[var(--sa-shadow-card)]"
              >
                <span className={`text-[15px] font-medium ${isExcluded ? 'text-[var(--sa-ink-soft)]' : 'text-[var(--sa-ink)]'}`}>
                  {store.name}
                </span>
                <span
                  role="switch"
                  aria-checked={!isExcluded}
                  aria-label={`Include ${store.name} in price comparison`}
                  onClick={() => toggleStore(store.id)}
                  className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-[var(--sa-radius-pill)] p-0.5 spoon-transition ${
                    isExcluded ? 'bg-[var(--sa-surface-alt)]' : 'bg-[var(--sa-green-deep)]'
                  }`}
                >
                  <span className={`h-5 w-5 rounded-full bg-[var(--sa-on-dark)] spoon-transition ${isExcluded ? 'translate-x-0' : 'translate-x-5'}`} />
                </span>
              </label>
            );
          })}
        </div>
      )}

      {stores.length === 0 && !loadingStores && zip.length === 5 && (
        <p className="mt-5 text-[15px] text-[var(--sa-ink-soft)]">No stores found for that ZIP. Try another.</p>
      )}

      {householdId && (
        <div className="mt-6 flex items-center gap-3">
          <PillButton onClick={save} disabled={saveState === 'saving'}>
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : 'Save preferences'}
          </PillButton>
        </div>
      )}
    </div>
  );
}
