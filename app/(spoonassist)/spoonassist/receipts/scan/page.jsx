'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PillButton from '@/components/spoonassist/PillButton';
import ReceiptConsentModal from '@/components/spoonassist/ReceiptConsentModal';
import { getOrCreateDeviceToken } from '@/lib/receipts/deviceToken';
import { compressReceiptImage } from '@/lib/receipts/compressImage';

// Photo -> review -> confirm, all on one page/state machine (spec Phase 3
// §1/§6). Kept as a single client component rather than separate routes
// per step -- the flow is inherently linear and short-lived, and this
// avoids re-fetching/re-deriving state across page navigations.

const MATCH_CHIP = {
  auto_matched: { label: 'Matched', className: 'bg-[var(--sa-savings)]/15 text-[var(--sa-savings)]' },
  needs_confirmation: { label: 'Confirm?', className: 'bg-[var(--sa-surface-alt)] text-[var(--sa-ink-soft)]' },
  unmatched: { label: 'Unmatched', className: 'bg-[var(--sa-warning)]/15 text-[var(--sa-warning)]' },
};

function MatchChip({ status }) {
  const c = MATCH_CHIP[status] ?? MATCH_CHIP.unmatched;
  return <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-medium ${c.className}`}>{c.label}</span>;
}

export default function ScanReceiptPage() {
  const [deviceToken, setDeviceToken] = useState(null);
  const [step, setStep] = useState('loading'); // loading | consent | capture | processing | review | confirming | done | error
  const [error, setError] = useState(null);
  const [zip, setZip] = useState('');
  const [receiptUploadId, setReceiptUploadId] = useState(null);
  const [review, setReview] = useState(null); // { store, receiptDate, lineItems }
  const [storeChoice, setStoreChoice] = useState(null); // { chainId, storeId, name } | { other: true, rawName }
  const [lineEdits, setLineEdits] = useState({}); // id -> { included, normalizedName }
  const [confirmResult, setConfirmResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = getOrCreateDeviceToken();
    setDeviceToken(token);
    if (!token) { setStep('capture'); return; }
    fetch(`/api/receipts/consent?deviceToken=${token}`)
      .then((r) => r.json())
      .then((data) => setStep(data.consented ? 'capture' : 'consent'))
      .catch(() => setStep('capture'));
  }, []);

  const handleConsent = async () => {
    setError(null);
    try {
      const res = await fetch('/api/receipts/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceToken }),
      });
      if (!res.ok) throw new Error('failed');
      setStep('capture');
    } catch {
      setError('Could not save your choice -- try again.');
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStep('processing');
    setError(null);

    try {
      const compressed = await compressReceiptImage(file);
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('deviceToken', deviceToken);
      if (zip) formData.append('zip', zip);

      const uploadRes = await fetch('/api/receipts/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
      setReceiptUploadId(uploadData.receiptUploadId);

      const processRes = await fetch('/api/receipts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptUploadId: uploadData.receiptUploadId, deviceToken, zip: zip || undefined }),
      });
      const processData = await processRes.json();
      if (!processRes.ok) throw new Error(processData.error || "Couldn't read this receipt -- try a clearer photo.");

      setReview(processData);
      setStoreChoice(
        processData.store?.matchedChainId
          ? { chainId: processData.store.matchedChainId, storeId: null, name: processData.store.matchedName }
          : { other: true, rawName: processData.store?.nameRaw || '' }
      );
      setLineEdits(Object.fromEntries(processData.lineItems.map((li) => [li.id, { included: true, normalizedName: li.normalized_name }])));
      setStep('review');
    } catch (err) {
      setError(err.message || "Couldn't read this receipt -- try a clearer photo.");
      setStep('error');
    }
  };

  const updateLine = (id, patch) => setLineEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleConfirm = async () => {
    setStep('confirming');
    setError(null);
    try {
      const res = await fetch('/api/receipts/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceToken,
          receiptUploadId,
          zip: zip || undefined,
          store: storeChoice,
          lineItems: Object.entries(lineEdits).map(([id, edit]) => ({ id, ...edit })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save these prices -- try again.');
      setConfirmResult(data);
      setStep('done');
    } catch (err) {
      setError(err.message);
      setStep('review');
    }
  };

  const includedCount = Object.values(lineEdits).filter((e) => e.included !== false).length;

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">Scan a receipt</h1>
      <p className="mt-1 text-[15px] text-[var(--sa-ink-soft)]">
        Help confirm real prices for your neighbors -- and every ingredient your household already buys.
      </p>

      {step === 'consent' && (
        <ReceiptConsentModal onAccept={handleConsent} onCancel={() => window.history.back()} />
      )}

      {step === 'capture' && (
        <div className="mt-6 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-5 shadow-[var(--sa-shadow-card)]">
          <label className="block text-[13px] font-medium text-[var(--sa-ink-soft)]">ZIP code (helps us match your store)</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
            placeholder="07102"
            className="mt-1 w-full rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-4 py-2 text-[15px] text-[var(--sa-ink)] outline-none"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelected}
            className="hidden"
          />
          <PillButton className="mt-4 w-full" onClick={() => fileInputRef.current?.click()}>
            Take or choose a photo
          </PillButton>
        </div>
      )}

      {(step === 'processing' || step === 'confirming') && (
        <div className="mt-8 text-center text-[15px] text-[var(--sa-ink-soft)]">
          {step === 'processing' ? 'Reading your receipt…' : 'Saving prices…'}
        </div>
      )}

      {step === 'error' && (
        <div className="mt-6">
          <p className="text-[15px] text-[var(--sa-warning)]">{error}</p>
          <PillButton variant="secondary" className="mt-3" onClick={() => setStep('capture')}>
            Try again
          </PillButton>
        </div>
      )}

      {step === 'review' && review && (
        <div className="mt-6">
          <div className="rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-4 shadow-[var(--sa-shadow-card)]">
            {storeChoice?.other ? (
              <input
                type="text"
                value={storeChoice.rawName}
                onChange={(e) => setStoreChoice({ other: true, rawName: e.target.value })}
                placeholder="Store name"
                className="w-full bg-transparent text-[15px] font-semibold text-[var(--sa-ink)] outline-none"
              />
            ) : (
              <p className="text-[15px] font-semibold text-[var(--sa-ink)]">{storeChoice?.name}</p>
            )}
            <p className="mt-0.5 text-[13px] text-[var(--sa-ink-soft)]">{review.receiptDate || 'Date unknown'}</p>
            {error && <p className="mt-2 text-[13px] text-[var(--sa-warning)]">{error}</p>}
          </div>

          <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)]">
            {includedCount} of {review.lineItems.length} items
          </p>

          <div className="mt-2 space-y-2">
            {review.lineItems.map((li) => {
              const edit = lineEdits[li.id] ?? { included: true, normalizedName: li.normalized_name };
              const status = edit.normalizedName !== li.normalized_name && edit.normalizedName
                ? 'auto_matched'
                : (li.match_status ?? 'unmatched');
              if (edit.included === false) {
                return (
                  <div key={li.id} className="flex items-center justify-between rounded-[var(--sa-radius-card)] bg-[var(--sa-surface-alt)] px-4 py-2 opacity-50">
                    <span className="text-[13px] text-[var(--sa-ink-soft)] line-through">{li.raw_text}</span>
                    <button type="button" onClick={() => updateLine(li.id, { included: true })} className="text-[12px] font-medium text-[var(--sa-green-deep)]">
                      Undo
                    </button>
                  </div>
                );
              }
              return (
                <div key={li.id} className="rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-3 shadow-[var(--sa-shadow-card)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[var(--sa-ink)]">{li.raw_text}</p>
                      <p className="text-[12px] text-[var(--sa-ink-soft)]">
                        {li.quantity} {li.unit} &middot; ${(li.unit_price ?? li.line_total ?? 0).toFixed(2)}
                        {li.on_sale ? ' (sale)' : ''}
                      </p>
                    </div>
                    <MatchChip status={status} />
                    <button
                      type="button"
                      aria-label={`Remove ${li.raw_text}`}
                      onClick={() => updateLine(li.id, { included: false })}
                      className="shrink-0 text-[var(--sa-ink-soft)] hover:text-[var(--sa-warning)]"
                    >
                      &times;
                    </button>
                  </div>
                  {status !== 'auto_matched' && (
                    <input
                      type="text"
                      value={edit.normalizedName ?? ''}
                      onChange={(e) => updateLine(li.id, { normalizedName: e.target.value || null })}
                      placeholder="What ingredient is this? (leave blank if unclear)"
                      className="mt-2 w-full rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-3 py-1.5 text-[13px] text-[var(--sa-ink)] outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <PillButton className="mt-5 w-full" onClick={handleConfirm} disabled={includedCount === 0}>
            Confirm and share prices
          </PillButton>
        </div>
      )}

      {step === 'done' && confirmResult && (
        <div className="mt-10 text-center">
          <p className="text-[17px] font-semibold text-[var(--sa-ink)]">
            Prices updated for {confirmResult.itemsWritten} item{confirmResult.itemsWritten === 1 ? '' : 's'}
            {confirmResult.storeName ? ` at ${confirmResult.storeName}` : ''} -- thank you!
          </p>
          <div className="mt-5 flex flex-col items-center gap-2">
            <PillButton as={Link} href="/spoonassist/receipts/scan" onClick={() => window.location.reload()}>
              Scan another receipt
            </PillButton>
            <PillButton as={Link} href="/spoonassist/list" variant="secondary">
              Back to list
            </PillButton>
          </div>
        </div>
      )}
    </div>
  );
}
