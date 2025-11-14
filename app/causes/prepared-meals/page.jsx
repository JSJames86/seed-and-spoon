export const metadata = {
  title: "Prepared Meals | Seed & Spoon NJ – Fresh, Nutritious Meals for Families",
  description:
    "Seed & Spoon NJ prepares fresh, home-style meals for families, seniors, veterans, and neighbors in need—using rescued food, donated ingredients, and community-powered kitchens.",
  openGraph: {
    title: "Prepared Meals | Seed & Spoon NJ",
    description:
      "Explore how Seed & Spoon NJ transforms rescued ingredients into nutritious prepared meals that support families across New Jersey.",
    url: "https://seedandspoon.org/causes/prepared-meals",
    images: ["/og-prepared-meals.jpg"], // optional upload later
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prepared Meals | Seed & Spoon NJ",
    description:
      "Fresh, ready-to-eat meals made with love and delivered with dignity—discover our Prepared Meals program.",
    images: ["/og-prepared-meals.jpg"],
  },
};
import Image from "next/image";
import Link from "next/link";

export default function PreparedMealsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
        <img
          src="/images/causes/prepared-meals/prepared-meals-hero-alt.jpg"
          alt="Seed & Spoon NJ prepared meals hero image"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center px-4">
          <h1 className="text-white text-3xl md:text-5xl font-bold text-center drop-shadow-lg">
            Prepared Meals
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          Fresh, Home-Style Meals Cooked With Care
        </h2>
        <p className="text-lg text-neutral-700 leading-relaxed mb-4">
          Seed & Spoon NJ&apos;s Prepared Meals program provides ready-to-heat meals
          designed to support families, elders, veterans, and disabled neighbors
          who need convenient, nutritious options.
        </p>
        <p className="text-lg text-neutral-700 leading-relaxed">
          Every meal is cooked with dignity in mind, following food safety guidelines
          and made with a mix of rescued ingredients, pantry staples, and fresh produce.
        </p>
      </section>

      {/* How It Works */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            How the Prepared Meals Program Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xl font-semibold mb-2">1. Plan & Prepare</h3>
              <p className="text-neutral-700">
                Menus are designed around nutrition, rescued ingredients, and
                community preferences — always focusing on balance and comfort.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">2. Cook & Pack</h3>
              <p className="text-neutral-700">
                Trained volunteers prepare, cool, and pack meals in compostable
                or reheatable containers with clear labels and instructions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">3. Deliver & Distribute</h3>
              <p className="text-neutral-700">
                Meals are distributed through partners or delivered directly
                to families, elders, and disabled neighbors who face mobility challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Row */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <img
            src="/images/causes/prepared-meals/prepared-meals-chicken-pot-pie.jpg"
            alt="Chicken pot pie prepared meal"
            className="rounded-lg shadow-md object-cover w-full h-64"
          />

          <img
            src="/images/causes/prepared-meals/prepared-meals-mini-sliders.png"
            alt="Mini burger sliders prepared meal"
            className="rounded-lg shadow-md object-cover w-full h-64"
          />

          <img
            src="/images/causes/prepared-meals/prepared-meals-lasagna-set.jpg"
            alt="Lasagna meal with garlic bread and salad"
            className="rounded-lg shadow-md object-cover w-full h-64"
          />
        </div>
      </section>

      {/* Who We Serve */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 text-center">
            Who We Serve
          </h2>
          <p className="text-lg text-neutral-700 leading-relaxed text-center mb-8">
            Our meals support neighbors facing barriers to cooking or accessing fresh food.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-neutral-700 text-base">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold mb-2">Families Experiencing Food Stress</h3>
              <p>
                Working parents, single caregivers, and families balancing tight schedules
                or heavy financial strain.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold mb-2">Elders & Disabled Neighbors</h3>
              <p>
                Individuals with mobility limitations, chronic conditions, or limited
                access to cooking facilities.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold mb-2">Veterans</h3>
              <p>
                Veterans on fixed incomes or recovering from health challenges
                receive nutritious, ready-to-heat meals delivered with respect.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold mb-2">Referred Households</h3>
              <p>
                Families referred through schools, housing programs, social workers,
                and community partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4 text-center">
          Support the Prepared Meals Program
        </h2>
        <p className="text-lg text-neutral-700 leading-relaxed text-center mb-8">
          This program is resource-intensive but deeply impactful.  
          You can help keep the kitchen going in meaningful ways.
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-sm text-neutral-700">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold mb-2">Sponsor Ingredients</h3>
            <p>Help fund proteins, vegetables, and staple ingredients for cooking days.</p>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold mb-2">Supply Containers</h3>
            <p>Support the purchase of safe containers, labels, and essential kitchen supplies.</p>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold mb-2">Volunteer With Us</h3>
            <p>Join a cook day, prep session, or packing shift to help create these meals.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a
            href="/donate"
            className="inline-block px-8 py-3 rounded-full bg-emerald-600 text-white font-medium text-lg hover:bg-emerald-700 transition"
          >
            Donate to Prepared Meals
          </a>
          <a
            href="/volunteer"
            className="inline-block px-8 py-3 rounded-full border border-emerald-600 text-emerald-700 font-medium text-lg hover:bg-emerald-50 transition"
          >
            Volunteer in the Kitchen
          </a>
        </div>
      </section>
    </div>
  );
}
