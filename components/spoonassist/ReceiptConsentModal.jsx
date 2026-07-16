'use client';

// One-time consent screen before a device's first receipt scan (spec §4).
// Plain-language, not a wall of legal text -- what we extract, what we
// never store, and that the photo itself stays private.
export default function ReceiptConsentModal({ onAccept, onCancel, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-6 shadow-[var(--sa-shadow-card)]">
        <h2 className="text-[17px] font-semibold text-[var(--sa-ink)]">Before you scan a receipt</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--sa-ink-soft)]">
          We extract item names and prices only. We never store card numbers, loyalty numbers, or your name.
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--sa-ink-soft)]">
          Your receipt photo is private to your device and deleted automatically after 30 days. Only the
          anonymous prices are shared with the community.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onAccept}
            disabled={submitting}
            className="w-full rounded-[var(--sa-radius-pill)] bg-[var(--sa-green-deep)] px-4 py-3 text-[15px] font-semibold text-[var(--sa-on-dark)] disabled:opacity-60"
          >
            {submitting ? 'One moment…' : 'Got it, continue'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-[var(--sa-radius-pill)] px-4 py-2 text-[14px] font-medium text-[var(--sa-ink-soft)]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
