'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SignedOutPrompt from '@/components/spoonassist/SignedOutPrompt';
import EmptyState from '@/components/spoonassist/EmptyState';
import { ListRowSkeleton } from '@/components/spoonassist/Skeleton';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5l5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ListHistoryPage() {
  const [signedIn, setSignedIn] = useState(null);
  const [lists, setLists] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  useEffect(() => {
    if (signedIn !== true) return;
    fetch('/api/spoonassist/list/history')
      .then((res) => (res.ok ? res.json() : { lists: [] }))
      .then((data) => setLists(data.lists || []))
      .catch(() => setLists([]));
  }, [signedIn]);

  if (signedIn === false) return <SignedOutPrompt title="Your past shopping lists will live here" />;

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">List history</h1>

      <div className="mt-5 space-y-2">
        {(signedIn === null || lists === null) &&
          Array.from({ length: 4 }).map((_, i) => <ListRowSkeleton key={i} />)}

        {lists !== null && lists.length === 0 && (
          <EmptyState title="No saved lists yet" description="Build a plan and save your list -- it'll show up here." />
        )}

        {lists?.map((list) => (
          <Link
            key={list.id}
            href={`/spoonassist/profile/lists/${list.id}`}
            className="flex items-center justify-between rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] px-4 py-3 shadow-[var(--sa-shadow-card)] spoon-transition hover:-translate-y-0.5"
          >
            <div>
              <p className="text-[15px] font-medium text-[var(--sa-ink)]">{formatDate(list.createdAt)}</p>
              <p className="text-[13px] text-[var(--sa-ink-soft)]">{list.itemCount} item{list.itemCount === 1 ? '' : 's'}</p>
            </div>
            <span className="text-[var(--sa-ink-soft)]">
              <ChevronIcon />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
