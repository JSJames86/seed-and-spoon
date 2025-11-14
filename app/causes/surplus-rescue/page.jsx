export const metadata = {
  title: "Surplus Rescue | Seed & Spoon NJ – Fighting Food Waste, Feeding Families",
  description:
    "Seed & Spoon NJ rescues surplus food from grocery stores, farms, bakeries, and community partners—turning perfectly good food into meals and grocery boxes for New Jersey families.",
  openGraph: {
    title: "Surplus Rescue | Seed & Spoon NJ",
    description:
      "Learn how Seed & Spoon NJ rescues surplus food and redistributes it to families, reducing waste and feeding communities across New Jersey.",
    url: "https://seedandspoon.org/causes/surplus-rescue",
    images: ["/og-surplus-rescue.jpg"], // optional for later
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Surplus Rescue | Seed & Spoon NJ",
    description:
      "Rescuing surplus food. Reducing waste. Feeding New Jersey families with dignity.",
    images: ["/og-surplus-rescue.jpg"],
  },
};

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
            Every day, perfectly good food gets tossed—not because it&apos;s unsafe, but because it&apos;s
            extra. Seed &amp; Spoon NJ&apos;s Surplus Rescue Program steps in before that happens.
            We collect surplus from grocery stores, bakeries, food banks, and local partners, then
            transform it into fresh meals, grocery boxes, and community dinners for families in need.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
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

          {/* Hero Image: volunteers */}
          <div className="overflow-hidden rounded-2xl border border-neutral-100">
            <img
              src="/images/causes/surplus-rescue/surplus-rescue-volunteers.png"
              alt="Seed & Spoon volunteers rescuing surplus food and preparing it for community distribution"
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
            pantry items, prepared items, and more. Our team picks it up, sorts it, and distributes it
            through our meal program, grocery boxes, and community events.
          </p>
          <p className="text-sm sm:text-base text-neutral-700">
            Surplus Rescue lets us feed more families while reducing food waste and environmental harm.
          </p>
        </div>
      </section>

      {/* Split section with second image */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid gap-6 sm:grid-cols-[1.1fr,1fr] items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-4">
                From Back Room to Family Table
              </h2>
              <p className="text-sm sm:text-base text-neutral-700 mb-3">
                Once surplus arrives at Seed &amp; Spoon, it doesn&apos;t sit. Volunteers move quickly to
                sort, label, and pack it into family-sized boxes and ingredients for cooked meals.
              </p>
              <p className="text-sm sm:text-base text-neutral-700 mb-3">
                Boxes are built with care—balancing fresh produce, pantry staples, and proteins so
                families can stretch what they receive into several days of meals.
              </p>
              <p className="text-sm sm:text-base text-neutral-700">
                Every box is more than food. It&apos;s proof that what others were ready to throw away
                can become stability, dignity, and relief for a neighbor.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-100">
              <img
                src="/images/causes/surplus-rescue/surplus-rescue-food-boxes.jpg"
                alt="Surplus food rescued by Seed & Spoon organized into boxes ready for distribution to families"
                className="w-full h-[220px] sm:h-[260px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Where the food comes from */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-4">
            Where the Food Comes From
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 mb-4">
            We work with local partners across New Jersey who care about reducing waste and feeding
            their neighbors:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Grocery stores and supermarkets</li>
            <li>Bakeries and cafés</li>
            <li>Food banks and pantries with overflow</li>
            <li>Restaurants, caterers, and event venues</li>
            <li>Seasonal donation drives and community collections</li>
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
                Stores or organizations contact us when they have safe, unsold food approaching its
                sell-by date or left over from service.
              </p>
            </li>

            <li>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">2. Pickup &amp; safe transport</h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Our trained volunteers pick up surplus items using food-safe handling, proper storage,
                and temperature control from door to door.
              </p>
            </li>

            <li>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                3. Sorting &amp; quality checks
              </h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Everything is inspected, sorted, and labeled by type and date. Items that don&apos;t
                meet our standards are composted whenever possible instead of landfilled.
              </p>
            </li>

            <li>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                4. Distributed to families
              </h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Surplus fuels our weekly meal program, monthly grocery boxes, and community dinners—
                reaching families referred by schools, social workers, and community partners.
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
                Fresh, nutritious food at no cost—reducing stress and stretching tight budgets with
                dignity, not judgment.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">For partners</h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Turn what would be waste into local impact. Lower disposal costs, support neighbors,
                and show your values in action.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">For the planet</h3>
              <p className="text-sm sm:text-base text-neutral-700">
                Food waste is a major driver of emissions. Rescuing surplus keeps good food out of
                landfills and helps build a more sustainable New Jersey.
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
            Whether you donate food, time, or resources, you&apos;re helping Seed &amp; Spoon NJ
            transform surplus into nourishment—and waste into hope.
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

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:border-neutral-900 hover:text-neutral-900"
            >
              Become a Surplus Partner
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
