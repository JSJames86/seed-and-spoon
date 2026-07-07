import Link from "next/link";

export const metadata = {
  title: "Food Distribution Services in Essex County, NJ | Seed & Spoon",
  description:
    "Food distribution services in Essex County, NJ: how Seed & Spoon's meal boxes, prepared meals, and pantry partnerships work, who's eligible, and how to find other local food distribution options.",
  openGraph: {
    title: "Food Distribution Services in Essex County, NJ | Seed & Spoon",
    description:
      "How Seed & Spoon distributes food across Essex County, NJ — meal boxes, prepared meals, pantry partnerships, eligibility, and how to get help.",
    url: "https://seedandspoon.org/resources/food-distribution-essex-county",
    images: ["/og-image.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Distribution Services in Essex County, NJ | Seed & Spoon",
    description:
      "Meal boxes, prepared meals, and pantry partnerships across Essex County, NJ.",
    images: ["/og-image.jpg"],
  },
};

export default function FoodDistributionEssexCountyPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Food Distribution Services in Essex County, NJ
        </h1>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Seed & Spoon is a Newark-based nonprofit distributing food across Essex County, New
          Jersey — including Newark, East Orange, Orange, West Orange, Irvington, Bloomfield,
          Belleville, and surrounding communities. We run three food distribution programs, and we
          also help connect families to other distribution services in the county.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            Our Food Distribution Programs
          </h2>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-3">
            <li>
              <strong>
                <Link href="/causes/surplus-rescue" className="text-green-700 underline underline-offset-2">
                  Surplus Rescue
                </Link>
              </strong>{" "}
              — we collect surplus food from grocery stores, farms, bakeries, and community
              partners and redistribute it as grocery boxes before it goes to waste.
            </li>
            <li>
              <strong>
                <Link href="/causes/prepared-meals" className="text-green-700 underline underline-offset-2">
                  Prepared Meals
                </Link>
              </strong>{" "}
              — volunteer-prepared, home-style meals for families, seniors, and veterans made from
              rescued and donated ingredients.
            </li>
            <li>
              <strong>
                <Link href="/causes/pantry-partners" className="text-green-700 underline underline-offset-2">
                  Pantry Partners
                </Link>
              </strong>{" "}
              — we supply schools, churches, housing communities, and micro-pantries across the
              county with recurring deliveries, so families can pick up food where they already
              gather.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            Who&apos;s Eligible
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Seed & Spoon does not require proof of income to receive food assistance. During
            enrollment we ask about household size and any dietary, allergen, or medical needs so
            we can pack food that actually fits your family — not to determine whether you
            qualify. If you already receive SNAP or WIC, you&apos;re welcome here too; our programs are
            not tied to those benefits.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            How to Get Food
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Apply for household enrollment or browse our live directory of food resources across
            Essex County — including partner pantries and meal sites we don&apos;t run ourselves — on
            our{" "}
            <Link href="/get-help" className="text-green-700 underline underline-offset-2">
              Get Help
            </Link>{" "}
            page. You can also call{" "}
            <a href="tel:211" className="text-green-700 underline underline-offset-2">2-1-1</a>{" "}
            at any time to find food distribution services near you anywhere in New Jersey, or
            search the{" "}
            <a
              href="https://www.feedingamerica.org/find-your-local-foodbank"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline underline-offset-2"
            >
              Feeding America food bank locator
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            Food Allergies and Dietary Needs
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If anyone in your household has a food allergy, see our{" "}
            <Link href="/resources/food-allergies" className="text-green-700 underline underline-offset-2">
              food allergy resources page
            </Link>{" "}
            for how we label allergens in meal boxes and where to find emergency help in NJ.
          </p>
        </section>

        <section className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-black mb-3">
            Want to Help Instead?
          </h2>
          <p className="text-base text-black/70 leading-relaxed">
            Seed & Spoon runs on volunteers and donations. Visit{" "}
            <Link href="/volunteer" className="text-green-700 underline underline-offset-2">Volunteer</Link>{" "}
            to join a distribution shift, or{" "}
            <Link href="/donate" className="text-green-700 underline underline-offset-2">Donate</Link>{" "}
            to help us reach more Essex County families.
          </p>
        </section>
      </div>
    </div>
  );
}
