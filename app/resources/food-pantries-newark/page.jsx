import Link from "next/link";

export const metadata = {
  title: "Food Pantries Near Newark, NJ | Seed & Spoon",
  description:
    "Find food pantries near Newark, NJ. Seed & Spoon connects Newark families with pantry partners, grocery boxes, and prepared meals — plus how to search our live directory of local food resources.",
  openGraph: {
    title: "Food Pantries Near Newark, NJ | Seed & Spoon",
    description:
      "How to find food pantries near Newark, NJ, and how Seed & Spoon's pantry partner network and grocery box deliveries help fill the gaps.",
    url: "https://seedandspoon.org/resources/food-pantries-newark",
    images: ["/og-image.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Pantries Near Newark, NJ | Seed & Spoon",
    description: "Find food pantries near Newark, NJ with Seed & Spoon.",
    images: ["/og-image.jpg"],
  },
};

export default function FoodPantriesNewarkPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Food Pantries Near Newark, NJ
        </h1>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Looking for a food pantry near Newark, NJ? Seed & Spoon is a Newark-based nonprofit that
          both runs its own food distribution and partners with schools, churches, and community
          pantries across Newark and Essex County so families can pick up food where they already
          go.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            Find a Pantry Near You
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            The fastest way to find current pantry hours and locations near Newark is our live{" "}
            <Link href="/get-help" className="text-green-700 underline underline-offset-2">
              Get Help
            </Link>{" "}
            directory, which lists food resources by New Jersey county and is kept up to date as
            providers change. You can also:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Call <a href="tel:211" className="text-green-700 underline underline-offset-2">2-1-1</a> — free, 24/7 referrals to food pantries and meal sites near Newark</li>
            <li>Search the <a href="https://www.feedingamerica.org/find-your-local-foodbank" target="_blank" rel="noopener noreferrer" className="text-green-700 underline underline-offset-2">Feeding America food bank locator</a></li>
            <li>Ask your child&apos;s school, place of worship, or community center — many host pantries or know which nearby ones are active this week</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            Our Pantry Partner Network
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Through our{" "}
            <Link href="/causes/pantry-partners" className="text-green-700 underline underline-offset-2">
              Pantry Partners
            </Link>{" "}
            program, Seed & Spoon delivers fresh groceries and prepared meals directly to schools,
            faith-based sites, housing communities, and micro-pantries across Newark on a
            recurring schedule. If your organization already sees families struggling with food
            access, you can{" "}
            <Link href="/causes/pantry-partners" className="text-green-700 underline underline-offset-2">
              become a partner site
            </Link>.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you don&apos;t have a partner pantry nearby, you can apply directly for household
            enrollment through{" "}
            <Link href="/get-help" className="text-green-700 underline underline-offset-2">
              Get Help
            </Link>{" "}
            and we&apos;ll connect you with grocery boxes or prepared meals — no proof of income
            required.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            What to Bring / What to Expect
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Requirements vary by pantry, since each is independently run. Many Newark-area pantries
            ask for photo ID and proof of address, though some require nothing at all — the
            directory and 2-1-1 can tell you what a specific location needs before you go. If
            anyone in your household has a food allergy, let us know at enrollment; see our{" "}
            <Link href="/resources/food-allergies" className="text-green-700 underline underline-offset-2">
              food allergy resources page
            </Link>{" "}
            for how we handle allergen labeling.
          </p>
        </section>

        <section className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-black mb-3">
            Want to Help Instead?
          </h2>
          <p className="text-base text-black/70 leading-relaxed">
            Seed & Spoon runs on volunteers and donations. Visit{" "}
            <Link href="/volunteer" className="text-green-700 underline underline-offset-2">Volunteer</Link>{" "}
            to help pack or deliver boxes, or{" "}
            <Link href="/donate" className="text-green-700 underline underline-offset-2">Donate</Link>{" "}
            to help stock Newark-area pantries.
          </p>
        </section>
      </div>
    </div>
  );
}
