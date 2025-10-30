"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-gray-900 px-4 text-center">
      {/* Title */}
      <h1 className="text-5xl font-bold mb-4">Oh no -- this shelf is empty!</h1>

      {/* Lead paragraph */}
      <p className="text-lg mb-6 max-w-xl">
        Looks like the page you were looking for isn\'t here. No worries -- there are still neighbors
        to feed. While we refill this shelf, you can head home or help us put meals where they\'re
        needed most.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Link
          href="/"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          aria-label="Return to Seed & Spoon homepage"
        >
          Return Home
        </Link>
        <Link
          href="/donate"
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          aria-label="Donate to help fill the pantry"
        >
          Help Fill the Pantry
        </Link>
      </div>

      {/* Microcopy */}
      <p className="text-sm italic text-gray-700">Even when the pantry\'s empty, kindness refills it.</p>

      {/* Placeholder illustration */}
      <img
        src="/assets/empty-pantry.png"
        alt="Illustration of an empty pantry shelf with a warm, hopeful style."
        className="mt-6 w-full max-w-md"
      />
    </main>
  );
}
