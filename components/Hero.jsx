"use client";

export default function Hero() {
  return (
    <section className="relative w-full bg-gradient-to-b from-[#f5f1e8] to-[#faf8f4] py-16 sm:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
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
