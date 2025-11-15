"use client";

import Image from "next/image";

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
      <div className="absolute inset-0 bg-[rgba(248,246,240,0.78)]" />

      {/* Foreground Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 max-w-3xl text-center">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 mb-6">
          At Seed & Spoon, we don't just feed people.
          <br />
          <span className="text-[#8B4513]">
            We see them — and respond with compassion and care.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light mb-10 max-w-4xl mx-auto">
          We're building a restorative care network in Essex County — meals, resources, and real support delivered with dignity across our community.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <a
            href="/get-help"
            className="rounded-lg bg-green-600 px-8 py-4 font-bold text-white text-lg transition-all hover:bg-green-500 hover:scale-105 shadow-lg"
          >
            I need help
          </a>
          <a
            href="/donate"
            className="rounded-lg bg-orange-600 px-8 py-4 font-bold text-white text-lg transition-all hover:bg-orange-500 hover:scale-105 shadow-lg"
          >
            I want to donate
          </a>
          <a
            href="/volunteer"
            className="rounded-lg border-2 border-green-600 px-8 py-4 font-bold text-green-600 text-lg transition-all hover:bg-green-600 hover:text-white hover:scale-105 shadow-lg"
          >
            I want to volunteer
          </a>
        </div>
      </div>
    </section>
  );
}
