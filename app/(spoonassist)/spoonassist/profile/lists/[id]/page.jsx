'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlan } from '@/components/spoonassist/PlanProvider';
import PillButton from '@/components/spoonassist/PillButton';
import EmptyState from '@/components/spoonassist/EmptyState';
import { ListRowSkeleton } from '@/components/spoonassist/Skeleton';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatQuantity(n) {
  if (n == null) return '';
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export default function ListHistoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const plan = usePlan();
  const [status, setStatus] = useState('loading'); // loading | ready | not-found
  const [list, setList] = useState(null);

  useEffect(() => {
    fetch(`/api/spoonassist/list/history/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'not-found' : 'error');
        return res.json();
      })
      .then((data) => {
        setList(data.list);
        setStatus('ready');
      })
      .catch((err) => setStatus(err.message === 'not-found' ? 'not-found' : 'error'));
  }, [id]);

  const reuseList = () => {
    if (!list) return;
    plan.restoreManualItems(list.items);
    router.push('/spoonassist/list');
  };

  if (status === 'loading') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status !== 'ready' || !list) {
    return <EmptyState title="List not found" />;
  }

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">{formatDate(list.createdAt)}</h1>
      <p className="mt-1 text-[15px] text-[var(--sa-ink-soft)]">{list.items.length} item{list.items.length === 1 ? '' : 's'}</p>

      <div className="mt-5 space-y-2">
        {list.items.map((item, i) => {
          const amount = item.quantity != null ? `${formatQuantity(item.quantity)}${item.unit ? ` ${item.unit}` : ''}` : null;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] px-4 py-3 ${item.isChecked ? 'opacity-50' : ''}`}
            >
              {amount && <span className="w-20 shrink-0 text-[14px] font-semibold text-[var(--sa-ink)]">{amount}</span>}
              <span className={`flex-1 text-[15px] text-[var(--sa-ink)] ${item.isChecked ? 'line-through' : ''}`}>{item.name}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <PillButton size="lg" onClick={reuseList}>
          Reuse this list &rarr;
        </PillButton>
      </div>
    </div>
  );
}
