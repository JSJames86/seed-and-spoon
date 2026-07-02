'use client';

import { useState } from 'react';

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.7 7L10.3 4.8M5.7 9L10.3 11.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// Confirmation-state savings summary (spec §4.7) that doubles as an
// organic-growth share hook: Web Share API on devices that support it,
// clipboard-copy fallback otherwise.
export default function SavingsShareCard({ savings, duplicateItemsAvoided, className = '' }) {
  const [copied, setCopied] = useState(false);

  const shareText = `I saved $${savings.toFixed(2)} and skipped buying ${duplicateItemsAvoided} duplicate item${duplicateItemsAvoided === 1 ? '' : 's'} this week by planning meals with SpoonAssist.`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // user cancelled or share failed -- fall through to clipboard
      }
    }
    try {
      await navigator.clipboard?.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable -- nothing more we can do silently
    }
  };

  return (
    <div className={`rounded-[var(--sa-radius-card)] bg-[var(--sa-green-deep)] p-6 text-center text-[var(--sa-on-dark)] ${className}`}>
      <p className="text-[13px] font-semibold uppercase tracking-wide opacity-80">This week you saved</p>
      <p className="mt-1 text-[36px] font-semibold">${savings.toFixed(2)}</p>
      <p className="mt-1 text-[15px] opacity-90">
        and skipped {duplicateItemsAvoided} duplicate item{duplicateItemsAvoided === 1 ? '' : 's'}
      </p>
      <button
        type="button"
        onClick={handleShare}
        className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--sa-radius-pill)] bg-[var(--sa-on-dark)] px-4 py-2 text-[13px] font-semibold text-[var(--sa-green-deep)] spoon-transition hover:opacity-90"
      >
        <ShareIcon /> {copied ? 'Copied!' : 'Share'}
      </button>
    </div>
  );
}
