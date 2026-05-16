"use client";

import { useRef } from "react";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import SDGCard from "./SDGCard";
import { PRIMARY_SDGS, SECONDARY_SDGS } from "./sdgData";

export default function SDGSection() {
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const secondaryRef = useRef(null);

  useRevealOnScroll(headingRef, { duration: 0.6 });
  useRevealOnScroll(gridRef, { duration: 0.7, y: 30, delay: 0.1 });
  useRevealOnScroll(secondaryRef, { duration: 0.6, y: 20, delay: 0.2 });

  return (
    <section className="bg-[var(--cream)] py-16 md:py-24" aria-labelledby="sdg-heading">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div ref={headingRef} className="text-center mb-12">
          <p className="label-xs text-[var(--dark-forest)] mb-3">
            GLOBAL IMPACT FRAMEWORK
          </p>
          <h2 id="sdg-heading" className="heading-h2 text-[var(--charcoal)]">
            Aligned with Global Goals
          </h2>
          <div className="heading-underline"></div>
          <p className="body-md text-slate-700 max-w-2xl mx-auto mt-6">
            Seed &amp; Spoon supports global efforts to reduce hunger, improve
            community wellbeing, and increase equitable access to food resources
            for children and families — in alignment with the United Nations
            Sustainable Development Goals.
          </p>
        </div>

        {/* Primary SDG Cards */}
        <div
          ref={gridRef}
          className="grid gap-5 sm:grid-cols-3"
        >
          {PRIMARY_SDGS.map((goal) => (
            <SDGCard key={goal.number} goal={goal} />
          ))}
        </div>

        {/* Secondary SDGs — compact row */}
        <div ref={secondaryRef} className="mt-8">
          <p className="label-xs text-slate-500 text-center mb-4">
            ALSO SUPPORTING
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {SECONDARY_SDGS.map((goal) => (
              <div key={goal.number} className="w-40">
                <SDGCard goal={goal} size="compact" />
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-400 mt-10 max-w-xl mx-auto">
          Seed &amp; Spoon is not affiliated with or endorsed by the United
          Nations. We independently align our work with the SDG framework
          because we believe in doing our part.{" "}
          <a
            href="https://www.un.org/sustainabledevelopment/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600 transition-colors"
          >
            Learn about the SDGs ↗
          </a>
        </p>
      </div>
    </section>
  );
}
