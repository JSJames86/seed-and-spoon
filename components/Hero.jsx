"use client";

import Image from "next/image";
import Button from "./Button";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F8F6F0]">
      {/* Background Image Layer */}
      <div className="absolute inset-0">
        <Image
          src="/media/hero/hero-bg.jpg"
          alt="Seed & Spoon community"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center space-y-4">
        {/* Main Heading */}
        <h1 className="heading-hero hero-text-shadow text-white text-3xl sm:text-4xl md:text-5xl mb-6">
          At Seed &amp; Spoon, we don&apos;t just feed people.
          <br />
          We see them — and respond with compassion and care.
        </h1>

        {/* Subtext */}
        <p className="hero-text-shadow body-lg text-white/90 mt-4 mb-10">
          We&apos;re building a restorative care network in Essex County — meals, resources, and real support delivered with dignity across our community.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <Button variant="primary" href="/get-help">
            I need help
          </Button>
          <Button variant="secondary" href="/donate">
            I want to donate
          </Button>
          <Button variant="outline" href="/volunteer">
            I want to volunteer
          </Button>
        </div>
      </div>
    </section>
  );
}
