import Link from "next/link";

export default function SurplusRescuePage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="border-b border-neutral-100 bg-neutral-50/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-emerald-700 mb-3">
            Cause
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 mb-4">
            Surplus Rescue
          </h1>
          <p className="text-base sm:text-lg text-neutral-800 max-w-2xl mb-4">
            Saving good food. Feeding our neighbors. Respecting the planet.
          </p>
          <p className="text-sm sm:text-base text-neutral-700 max-w-2xl mb-8">
            Every day, perfectly good food gets tossed—not because it&apos;s unsafe, but because it&apos;s extra.
            Seed &amp; Spoon NJ&apos;s Surplus Rescue Program steps in before that happens. We collect surplus
            from grocery stores, bakeries, food banks, and local partners, then transform it into fresh meals,
            grocery boxes, and community dinners for families in need.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Become a Surplus Partner
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:border-neutral-900 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Donate to Fuel Rescues
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Image — replace with your Gemini image */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="overflow-hidden rounded-2xl border border-neutral-100">
            <img
              src="/images/surplus-rescue-hero.jpg"
              alt="Volunteers sorting rescued food"
              className="w-full h-[260px] sm:h-[320px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* What is Surplus Rescue */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-4">
            What is Surplus Rescue?
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 mb-3">
            Instead of letting good food go to waste, we redirect it back into our community.
          </p>
          <p className="text-sm sm:text-base text-neutral-700 mb-3">
            Seed &amp; Spoon NJ partners with businesses that have unsold, safe food—produce, bread,
            pantry items, and more. Our team picks it up, sorts it, and distributes it through our meal
            program, grocery boxes, and community events.
          </p>
          <p className="text-sm sm:text-base text-neutral-700">
            Surplus Rescue lets us feed more families while reducing food waste and environmental harm.
          </p>
        </div>
      </section>

      {/* Where the food comes from */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-4">
            Where the Food Comes From
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-neutral-700">
            <li>Grocery stores and supermarkets</li>
            <li>Bakeries and cafés</li>
            <li>Food banks and pantries with overflow</li>
            <li>Restaurants and caterers</li>
            <li>Seasonal events and donation drives</li>
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-50 border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-6">
            How the Surplus Rescue Program Works
          </h2>

          <ol className="space-y-5">
            <li>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">1. Partners notify us</h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Stores or organizations contact us when they have safe, unsold food.
              </p>
            </li>

            <li>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">2. Pickup &amp; safe transport</h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Our trained volunteers pick up surplus items using food-safe handling and proper temperature control.
              </p>
            </li>

            <li>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                3. Sorting &amp; quality checks
              </h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Everything is sorted, inspected, and labeled before being prepared or packed.
              </p>
            </li>

            <li>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                4. Distributed to families
              </h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Surplus fuels our weekly meal program, monthly grocery boxes, and community dinners.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Why it matters */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-6">
            Why Surplus Rescue Matters
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">For families</h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Fresh, nutritious food at no cost — feeding families with dignity.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">For partners</h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Reduce waste, reduce costs, and create real local impact.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">For the planet</h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Less waste → lower emissions → a cleaner, more sustainable NJ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">
            Join the Surplus Rescue Network
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 mb-6 max-w-2xl">
            Whether you donate food, time, or resources, you&apos;re helping Seed &amp; Spoon NJ transform
            surplus into nourishment — and waste into hope.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              Donate to Support Surplus Rescue
            </Link>

            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:border-neutral-900 hover:text-neutral-900"
            >
              Volunteer on the Rescue Team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
