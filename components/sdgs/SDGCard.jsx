"use client";

import Image from "next/image";

export default function SDGCard({ goal, size = "default" }) {
  const isCompact = size === "compact";
  const imgSize = isCompact ? 64 : 80;

  return (
    <a
      href={goal.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col items-center rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] focus-visible:ring-offset-2 transition-all duration-300 ${
        isCompact ? "p-4" : "p-5 md:p-6"
      }`}
    >
      {/* SDG Icon */}
      <Image
        src={`/images/sdg/sdg-${goal.slug}.png`}
        alt={`SDG ${goal.number}: ${goal.name}`}
        width={imgSize}
        height={imgSize}
        className={`object-contain flex-shrink-0 ${isCompact ? "mb-3" : "mb-4"}`}
      />

      {/* Goal label — brand color kept as a decorative accent dot; the
          official SDG hues (esp. yellow/gold) don't clear WCAG text
          contrast on white, so the readable text uses a neutral tone. */}
      <p className="label-xs text-center mb-1 text-slate-600 flex items-center justify-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: goal.color }}
          aria-hidden="true"
        />
        SDG {goal.number}
      </p>

      {/* Goal name */}
      <h3
        className={`font-bold text-[var(--charcoal)] text-center leading-tight mb-2 font-display ${
          isCompact ? "text-sm" : "text-base"
        }`}
      >
        {goal.name}
      </h3>

      {/* Description — hidden in compact mode */}
      {!isCompact && (
        <p className="body-sm text-slate-600 text-center flex-1">
          {goal.description}
        </p>
      )}

      {/* Learn more affordance */}
      <p className="text-xs font-medium text-center mt-3 text-slate-600 group-hover:text-slate-800 group-hover:underline underline-offset-2 transition-colors">
        Learn more ↗
      </p>
    </a>
  );
}
