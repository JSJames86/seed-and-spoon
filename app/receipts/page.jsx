'use client';

import { useEffect, useRef, useState } from 'react';
import { getOrCreateDeviceToken } from '@/lib/receipts/deviceToken';

// Send Us the Receipts -- public receipt upload, route /receipts.
// Anonymous by design: the same device_token pattern the personal
// SpoonAssist receipt-confirmation flow uses (lib/receipts/deviceToken) is
// the only identifier. No account, no name.

const CONSENT_VERSION = '2026-07-v1';
const MAX_FILE_MB = 10;

export default function SendUsTheReceiptsPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [homeZip, setHomeZip] = useState('');
  const [consented, setConsented] = useState(false);
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const fileInput = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onPickFile(f) {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setErrorMsg("That file isn't a photo. Upload a picture of your receipt.");
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setErrorMsg(`Photo is too large. Keep it under ${MAX_FILE_MB} MB.`);
      return;
    }
    setErrorMsg('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!file || !storeName.trim() || !consented) return;
    if (homeZip && !/^\d{5}$/.test(homeZip)) {
      setErrorMsg('ZIP code should be 5 digits, like 07103.');
      return;
    }
    setState('sending');
    setErrorMsg('');
    try {
      const deviceToken = getOrCreateDeviceToken();
      const form = new FormData();
      form.append('image', file);
      form.append('storeName', storeName.trim());
      form.append('storeLocation', storeLocation.trim());
      form.append('homeZip', homeZip.trim());
      form.append('deviceToken', deviceToken || '');
      form.append('consentVersion', CONSENT_VERSION);

      const res = await fetch('/api/receipts/submit', { method: 'POST', body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Upload failed');
      }
      setState('done');
    } catch (e) {
      setState('error');
      setErrorMsg(e instanceof Error ? e.message : 'Upload failed. Try again.');
    }
  }

  if (state === 'done') {
    return (
      <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">
          <p className="text-4xl" aria-hidden>🧾</p>
          <h1 className="heading-h2 mt-4 text-[var(--dark-forest)]">
            Receipt received. Thank you.
          </h1>
          <p className="body-md mt-3 text-[var(--charcoal)]">
            Your receipt is now part of community evidence about grocery prices in
            New Jersey. The photo deletes automatically within 30 days -- only the
            anonymous price data stays.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-8"
            onClick={() => {
              setFile(null);
              setPreview(null);
              setStoreName('');
              setStoreLocation('');
              setHomeZip('');
              setConsented(false);
              setState('idle');
            }}
          >
            Send another receipt
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] px-4 py-10">
      <div className="mx-auto max-w-xl">
        <header>
          <p className="label-xs text-[var(--green-primary)]">
            A Seed &amp; Spoon community study
          </p>
          <h1 className="heading-h2 mt-1 text-[var(--dark-forest)]">
            Send Us the Receipts
          </h1>
          <p className="body-md mt-3 text-[var(--charcoal)]">
            Do families in different Newark neighborhoods pay different prices for
            the same groceries? Lawmakers are debating grocery pricing right now --
            and nobody has data from our neighborhoods. Your receipt is evidence.
          </p>
        </header>

        <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="font-semibold text-amber-900">Before you snap the photo</h2>
          <p className="body-sm mt-2 text-amber-900">
            Fold or cover the bottom of the receipt (payment info) and any
            loyalty or rewards number, wherever it appears. We never want those --
            if we can see them, we discard the photo.
          </p>
        </section>

        <section className="mt-6 space-y-5">
          <div>
            <label className="form-label">Receipt photo</label>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="mt-1 w-full rounded-xl border-2 border-dashed border-[var(--cream)] bg-[var(--white)] px-4 py-8 text-[var(--charcoal)] transition-all duration-300 hover:border-[var(--green-primary)]"
            >
              {file ? 'Choose a different photo' : 'Take or choose a photo'}
            </button>
            {preview && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt="Preview of your receipt"
                className="mt-3 max-h-72 w-full rounded-lg object-contain bg-[var(--cream)]"
              />
            )}
          </div>

          <div>
            <label htmlFor="store" className="form-label">Store name</label>
            <input
              id="store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="ShopRite, C-Town, Aldi, the corner bodega…"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="loc" className="form-label">
              Store location <span className="font-normal text-neutral-500">(street or neighborhood)</span>
            </label>
            <input
              id="loc"
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
              placeholder="Springfield Ave, Newark"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="zip" className="form-label">
              Your home ZIP code <span className="font-normal text-neutral-500">(optional -- just the ZIP)</span>
            </label>
            <input
              id="zip"
              value={homeZip}
              onChange={(e) => setHomeZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              inputMode="numeric"
              placeholder="07103"
              className="form-input w-32"
            />
          </div>

          <div className="rounded-xl border border-[var(--cream)] bg-[var(--white)] p-4 body-sm text-[var(--charcoal)]">
            <p className="font-medium text-[var(--dark-forest)]">Our commitment to you</p>
            <p className="mt-2">
              We record only the store, date, items, and prices. No names, no
              accounts, nothing tied to you. Receipt photos delete automatically
              within 30 days; only anonymous price data remains. Findings may
              appear in public reports, legislative testimony, and research --
              always as neighborhood-level statistics, never as individual
              receipts. Questions or removal requests:{' '}
              <a href="mailto:research@seedandspoon.org" className="text-[var(--green-primary)] underline">
                research@seedandspoon.org
              </a>
              .
            </p>
            <label className="mt-3 flex items-start gap-2">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--green-primary)]"
              />
              <span>I understand and agree.</span>
            </label>
          </div>

          {errorMsg && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {errorMsg}
            </p>
          )}

          <button
            type="button"
            disabled={!file || !storeName.trim() || !consented || state === 'sending'}
            onClick={submit}
            className="btn btn-primary w-full justify-center disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
          >
            {state === 'sending' ? 'Uploading…' : 'Upload receipt'}
          </button>
        </section>
      </div>
    </main>
  );
}
