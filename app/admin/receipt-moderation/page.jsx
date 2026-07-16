'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'janelle.shanise@gmail.com';

// Simple admin view (spec Phase 3 §3): receipt-derived prices that failed
// the sanity-bounds check (>3x or <0.33x the reference price) land here
// instead of price_quotes automatically. Approve writes them anyway
// (a human override); reject leaves them out.
export default function ReceiptModerationPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'admin';

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (!isAdmin && profile !== null) { router.push('/dashboard'); return; }
    if (isAdmin) fetchFlagged();
  }, [authLoading, user, profile, isAdmin]); // eslint-disable-line

  async function authHeader() {
    const { data: { session } } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${session?.access_token || ''}` };
  }

  async function fetchFlagged() {
    setLoading(true);
    try {
      const res = await fetch('/api/receipts/moderation', { headers: await authHeader() });
      const data = await res.json();
      setFlagged(data.flagged || []);
    } catch (err) {
      console.error('Failed to load flagged receipt prices:', err);
    }
    setLoading(false);
  }

  async function handleAction(lineItemId, action) {
    setBusyId(lineItemId);
    setMsg('');
    try {
      const res = await fetch('/api/receipts/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
        body: JSON.stringify({ lineItemId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setFlagged((prev) => prev.filter((f) => f.id !== lineItemId));
      setMsg(action === 'approve' ? 'Price written.' : 'Price rejected.');
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
    setBusyId(null);
  }

  if (authLoading || loading) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (!isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Receipt price moderation</h1>
      <p className="mt-1 text-sm text-gray-500">
        {flagged.length} price{flagged.length === 1 ? '' : 's'} flagged by the sanity-bounds check, awaiting review.
      </p>
      {msg && <p className="mt-2 text-sm">{msg}</p>}

      <div className="mt-6 space-y-3">
        {flagged.map((line) => (
          <div key={line.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{line.raw_text}</p>
                <p className="text-sm text-gray-500">
                  {line.normalized_name ?? '(unmatched)'} &middot; {line.quantity} {line.unit} &middot; $
                  {(line.unit_price ?? line.line_total ?? 0).toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {line.receipt_uploads?.store_name_confirmed ?? 'Unknown store'} &middot; {line.receipt_uploads?.receipt_date ?? 'unknown date'}
                </p>
                <p className="mt-1 text-sm text-amber-700">{line.flag_reason}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={busyId === line.id}
                  onClick={() => handleAction(line.id, 'approve')}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === line.id}
                  onClick={() => handleAction(line.id, 'reject')}
                  className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {flagged.length === 0 && <p className="text-sm text-gray-500">Nothing flagged right now.</p>}
      </div>
    </div>
  );
}
