"use client";

import { useRef, useState, useEffect } from "react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import Link from "next/link";

function StatCard({ label, mainStat, percentage, description, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  // Apply reveal animation
  useRevealOnScroll(cardRef, { duration: 0.6, delay: delay / 1000 });

  // Animated percentage counter
  const animatedPercentage = useAnimatedCounter(percentage, 1500, isVisible);

  useEffect(() => {
    const currentRef = cardRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add delay before triggering animation
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="rounded-3xl bg-white shadow-sm border border-slate-100 p-5 md:p-6 hover:shadow-md transition-shadow duration-300"
    >
      {/* Label */}
      <p className="label-xs text-[var(--green-primary)] mb-3">{label}</p>

      {/* Main Stat */}
      <p className="heading-h3 text-[var(--charcoal)] mb-2">{mainStat}</p>

      {/* Animated Percentage */}
      <p className="body-md font-bold text-[var(--charcoal)] mb-3">
        ≈ {Math.round(animatedPercentage)}%
      </p>

      {/* Description */}
      <p className="body-sm text-slate-700">{description}</p>
    </div>
  );
}

export default function WhyThisMatters() {
  const wishlistRef = useRef(null);

  // Apply reveal animation to wishlist CTA
  useRevealOnScroll(wishlistRef, { duration: 0.7, y: 20 });

  const stats = [
    {
      label: "NATIONWIDE",
      mainStat: "1 in 7 people",
      percentage: 14,
      description: "live in a food-insecure household in the U.S.",
      delay: 0,
    },
    {
      label: "NEW JERSEY",
      mainStat: "1 in 9 people",
      percentage: 11,
      description: "struggle to consistently afford enough food.",
      delay: 150,
    },
    {
      label: "ESSEX COUNTY",
      mainStat: "1 in 6 people",
      percentage: 16,
      description:
        "face food insecurity — one of the highest rates in the state.",
      delay: 300,
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="heading-h2 text-[var(--charcoal)]">
            Why this work matters
          </h2>
          <p className="body-md text-slate-700 text-center max-w-2xl mx-auto mt-3">
            Food insecurity isn't just a distant problem — it's happening right
            here in our community. These numbers represent real families,
            neighbors, and children who deserve better.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="mt-10 grid gap-6 md:gap-8 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* How Seed & Spoon Responds */}
        <div className="mt-10 bg-[var(--cream)] rounded-2xl p-8 md:p-10">
          <h3 className="heading-h3 text-[var(--charcoal)] mb-6 text-center md:text-left">
            How Seed &amp; Spoon responds
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-[var(--green-primary)] flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="body-md text-slate-700">
                <strong className="font-bold text-[var(--charcoal)]">
                  Rescue surplus food
                </strong>{" "}
                before it goes to waste and redirect it to families who need it
                most.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-[var(--green-primary)] flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="body-md text-slate-700">
                <strong className="font-bold text-[var(--charcoal)]">
                  Partner with community pantries
                </strong>{" "}
                to expand access to fresh, nutritious food across Essex County.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-[var(--green-primary)] flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="body-md text-slate-700">
                <strong className="font-bold text-[var(--charcoal)]">
                  Cook prepared meals
                </strong>{" "}
                with dignity and care, ensuring everyone has access to hot,
                home-style food.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-[var(--green-primary)] flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="body-md text-slate-700">
                <strong className="font-bold text-[var(--charcoal)]">
                  Lead education workshops
                </strong>{" "}
                on food skills and financial literacy to build long-term
                stability.
              </p>
            </li>
          </ul>
        </div>

        {/* Amazon Wishlist CTA - Soft highlight */}
        <div ref={wishlistRef} className="mt-10 rounded-2xl bg-[var(--leaf-light)]/25 border border-[var(--leaf-light)]/40 px-6 py-6 md:px-8 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h3 className="heading-h3 text-[var(--charcoal)] mb-2">
              Help us stock our pantry
            </h3>
            <p className="body-md text-slate-700">
              Can't donate money right now? You can still make a huge impact by
              purchasing items from our Amazon Wishlist and having them shipped
              directly to us.
            </p>
          </div>
          <Link
            href="https://www.amazon.com/hz/wishlist/ls/1ZC494TKCOAHJ?ref_=wl_share"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[var(--green-primary)] text-white px-6 py-3 rounded-full font-bold body-md hover:bg-[var(--leaf-mid)] transition-colors shadow-sm whitespace-nowrap"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.53.404-3.045.606-4.53.606-2.502 0-4.97-.48-7.4-1.44-2.428-.96-4.59-2.324-6.485-4.09-.153-.14-.18-.26-.08-.36zM23.95 15.31c-.305-.314-.64-.576-1.006-.785-.366-.21-.694-.303-.994-.28-.288.023-.495.13-.616.333-.12.202-.14.44-.057.713.082.272.248.527.494.764.247.238.55.43.916.58.365.145.725.215 1.076.215.458 0 .833-.16 1.128-.48.293-.32.434-.72.434-1.2 0-.427-.125-.79-.38-1.09zm-.774 1.414c-.137.137-.298.206-.482.206s-.35-.07-.495-.206c-.146-.135-.22-.297-.22-.483 0-.186.074-.347.22-.483.146-.137.31-.206.495-.206s.345.07.482.206c.138.136.206.297.206.483 0 .186-.068.348-.206.483zm-1.17-10.027c.272-.11.542-.165.81-.165.664 0 1.085.302 1.263.907.075.27.112.582.112.935 0 .7-.13 1.296-.388 1.785-.26.49-.63.863-1.112 1.118-.482.256-.98.384-1.495.384-.29 0-.564-.043-.824-.13-.26-.085-.486-.207-.677-.364s-.337-.346-.44-.57c-.102-.223-.153-.473-.153-.748 0-.427.124-.79.37-1.09.248-.298.58-.51.998-.633.42-.123.88-.185 1.383-.185h.436v-.243c0-.354-.074-.628-.22-.823-.147-.195-.368-.293-.663-.293-.26 0-.495.063-.706.19-.21.126-.365.302-.466.528-.075.165-.16.265-.256.3-.096.034-.226.018-.39-.05l-.413-.165c-.123-.05-.196-.116-.22-.198-.023-.082.006-.195.087-.338.226-.407.574-.735 1.043-.985z" />
            </svg>
            View Wishlist
          </Link>
        </div>
      </div>
    </section>
  );
}
