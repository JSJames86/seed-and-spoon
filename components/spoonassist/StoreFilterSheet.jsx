'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { RetailerLogo } from './StoreFilterBar';
import SpoonButton from './ui/Button';
import { spoonInputClass } from './ui/Input';

const EASE = [0.2, 0.8, 0.2, 1];

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-spoon-subtext" aria-hidden="true">
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircle({ checked }) {
  if (checked) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-spoon-mint shrink-0" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <span className="h-5 w-5 rounded-full border-2 border-white/80 bg-white/40 shrink-0" aria-hidden="true" />
  );
}

// "All stores" bottom sheet — search + alphabetically grouped, multi-select
// retailer list. Selection state lives in the parent (StoreFilterBar);
// this component is purely presentational + focus/scroll management.
export default function StoreFilterSheet({ open, onClose, retailers, selectedKeys, onToggle }) {
  const [query, setQuery] = useState('');
  const sheetRef = useRef(null);
  const searchRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const focusDelay = prefersReducedMotion ? 0 : 260;
    const timer = setTimeout(() => searchRef.current?.focus(), focusDelay);
    return () => clearTimeout(timer);
  }, [open, prefersReducedMotion]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = sheetRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const groups = useMemo(() => {
    const list = retailers || [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter(r => r.name?.toLowerCase().includes(q))
      : list;

    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

    const map = new Map();
    for (const r of sorted) {
      const letter = /[a-z]/i.test(r.name?.[0] || '') ? r.name[0].toUpperCase() : '#';
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(r);
    }
    return [...map.entries()];
  }, [retailers, query]);

  const selectedCount = selectedKeys.length;
  const sheetTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-spoon-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={sheetTransition}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="store-filter-sheet-title"
            className="fixed inset-x-0 bottom-0 z-50 flex h-[78vh] flex-col rounded-t-[28px] border border-white/85 border-b-0"
            style={{
              background: 'rgba(250, 252, 250, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={sheetTransition}
          >
            <div className="flex justify-center pt-3" aria-hidden="true">
              <div className="h-1.5 w-10 rounded-full bg-spoon-ink/15" />
            </div>

            <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-2">
              <h2 id="store-filter-sheet-title" className="text-lg font-semibold text-spoon-ink">
                All stores
              </h2>
              <SpoonButton variant="primary" size="sm" onClick={onClose}>
                Done{selectedCount > 0 ? ` (${selectedCount})` : ''}
              </SpoonButton>
            </div>

            <div className="px-5 pb-3">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <SearchIcon />
                </span>
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stores"
                  className={`${spoonInputClass} pl-10`}
                  aria-label="Search stores"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-[env(safe-area-inset-bottom)]">
              {groups.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-spoon-subtext">
                  No stores match &ldquo;{query}&rdquo;.
                </p>
              ) : (
                groups.map(([letter, group]) => (
                  <div key={letter}>
                    <div
                      className="sticky top-0 z-10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-spoon-subtext"
                      style={{ background: 'rgba(250, 252, 250, 0.96)' }}
                    >
                      {letter}
                    </div>
                    <ul>
                      {group.map(r => {
                        const checked = selectedKeys.includes(r.retailer_key);
                        return (
                          <li key={r.retailer_key}>
                            <button
                              type="button"
                              onClick={() => onToggle(r.retailer_key)}
                              aria-pressed={checked}
                              className={`spoon-transition flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-spoon-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spoon-mint focus-visible:ring-offset-2 ${
                                checked ? 'bg-spoon-mint-tint' : 'hover:bg-white/60'
                              }`}
                            >
                              <RetailerLogo retailer={r} />
                              <span className="flex-1">{r.name}</span>
                              <CheckCircle checked={checked} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
