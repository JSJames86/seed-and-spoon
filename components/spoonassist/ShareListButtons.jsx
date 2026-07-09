"use client";

import { useState, useEffect } from "react";

/**
 * ShareListButtons — export a SpoonAssist grocery list to Notes,
 * Reminders, Messages, etc. via the native share sheet, or copy it.
 *
 * Drop into components/spoonassist/. Sits alongside InstacartCTA —
 * Instacart stays the primary CTA; these render as secondary actions.
 *
 * Props:
 *   ingredients — array of strings OR objects ({ name, amount?, unit? })
 *   listTitle   — optional heading, e.g. the recipe name
 */

function formatList(ingredients, listTitle) {
  const lines = ingredients.map((item) => {
    if (typeof item === "string") return `• ${item}`;
    const qty = [item.amount, item.unit].filter(Boolean).join(" ");
    return `• ${qty ? `${qty} ` : ""}${item.name}`;
  });
  const header = listTitle ? `${listTitle} — Grocery List` : "Grocery List";
  return `${header}\n\n${lines.join("\n")}\n\nMade with SpoonAssist`;
}

export default function ShareListButtons({ ingredients = [], listTitle = "" }) {
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  // navigator.share only exists client-side (and mostly on mobile/Safari)
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const empty = ingredients.length === 0;
  const text = formatList(ingredients, listTitle);

  async function handleShare() {
    try {
      await navigator.share({ title: listTitle || "Grocery List", text });
    } catch (err) {
      // AbortError = user closed the sheet; not a failure
      if (err?.name !== "AbortError") console.error("Share failed:", err);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {canShare && (
        <button
          type="button"
          onClick={handleShare}
          disabled={empty}
          className="inline-flex h-[46px] items-center gap-2 rounded-full border border-[#003D29] px-[18px] text-sm font-medium text-[#003D29] transition-colors hover:bg-[#003D29]/5 disabled:opacity-40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v13" />
            <path d="M8 7l4-4 4 4" />
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
          </svg>
          Send to my lists
        </button>
      )}

      <button
        type="button"
        onClick={handleCopy}
        disabled={empty}
        className="inline-flex h-[46px] items-center gap-2 rounded-full border border-[#003D29] px-[18px] text-sm font-medium text-[#003D29] transition-colors hover:bg-[#003D29]/5 disabled:opacity-40"
        aria-live="polite"
      >
        {copied ? "Copied!" : "Copy list"}
      </button>
    </div>
  );
}
