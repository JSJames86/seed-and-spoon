"use client";

import Image from "next/image";
import Link from "next/link";

export default function SDGCard({ goal, size = "default" }) {
  const isCompact = size === "compact";

  return (
    <Link
      href={goal.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] focus-visible:ring-offset-2 transition-all duration-300 overflow-hidden ${
        isCompact ? "p-4" : "p-5 md:p-6"
      }`}
    >
      {/* SDG Icon */}
      <div className={`relative flex-shrink-0 mx-auto ${isCompact ? "w-16 h-16 mb-3" : "w-20 h-20 mb-4"}`}>
        <Image
          src={`/images/sdg/sdg-${goal.slug}.png`}
          alt={`SDG ${goal.number}: ${goal.name}`}
          fill
          className="object-contain"
          sizes={isCompact ? "64px" : "80px"}
        />
      </div>

      {/* Goal label */}
      <p
        className="label-xs text-center mb-1"
        style={{ color: goal.color }}
      >
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
      <p
        className={`text-xs font-medium text-center mt-3 group-hover:underline underline-offset-2 transition-colors`}
        style={{ color: goal.color }}
      >
        Learn more ↗
      </p>
    </Link>
  );
}
