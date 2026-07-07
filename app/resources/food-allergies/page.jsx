import Link from "next/link";

export const metadata = {
  title: "Food Allergy Resources for NJ Families | Seed & Spoon NJ",
  description:
    "Food allergy resources for New Jersey families: how Seed & Spoon labels allergens in meal boxes, tips for households managing food allergies, and where to find food allergy emergency help in NJ.",
  openGraph: {
    title: "Food Allergy Resources for NJ Families | Seed & Spoon NJ",
    description:
      "How Seed & Spoon labels allergens in meal boxes, what families with food-allergic kids should know, and NJ food allergy emergency resources.",
    url: "https://seedandspoon.org/resources/food-allergies",
    images: ["/og-image.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Allergy Resources for NJ Families | Seed & Spoon NJ",
    description:
      "Allergen labeling, household tips, and NJ food allergy emergency resources from Seed & Spoon NJ.",
    images: ["/og-image.jpg"],
  },
};

export default function FoodAllergiesPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Food Allergy Resources for NJ Families
        </h1>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Managing a food allergy is stressful enough without also worrying about where your
          next meal is coming from. Seed & Spoon serves Essex County families through meal boxes,
          prepared meals, and community pantries — and allergen safety is part of how we build
          every box. This page covers how we label allergens, what to know if someone in your
          household has a food allergy, and where to turn in a New Jersey food allergy emergency.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            How We Label Allergens in Meal Boxes
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            During intake enrollment, families tell us about every child&apos;s allergies and their
            severity — mild intolerance, active allergy, or severe/anaphylactic. That information
            feeds a kitchen-facing allergen summary our volunteers use when packing boxes, so
            severe allergies are flagged clearly before food ever reaches your door.
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>We track the nine major allergens the FDA requires labeling for, plus sesame: milk, eggs, peanuts, tree nuts, soy, wheat, fish, shellfish, and sesame.</li>
            <li>Households update allergy and severity information any time through their enrollment.</li>
            <li>Meal boxes for households with a flagged severe allergy get extra review before packing.</li>
            <li>Rescued and donated food doesn&apos;t always come with full ingredient lists — see our{" "}
              <Link href="/legal/food-waiver" className="text-green-700 underline underline-offset-2">
                Food Safety & Allergy Waiver
              </Link>{" "}
              for the full picture of what we can and can&apos;t guarantee.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            What Families With Food-Allergic Kids Should Know
          </h2>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Tell us at enrollment.</strong> The more specific you are about allergy and severity, the better we can flag your box.</li>
            <li><strong>Always check labels yourself.</strong> Rescued and donated items may have incomplete ingredient information — treat our labeling as a helpful flag, not a guarantee.</li>
            <li><strong>Watch for cross-contact.</strong> Shared kitchens and packing environments mean trace exposure is possible even when an allergen isn&apos;t a listed ingredient.</li>
            <li><strong>Keep emergency medication accessible.</strong> If your child carries an EpiPen or other rescue medication, make sure it&apos;s on hand whenever a meal box or delivery arrives.</li>
            <li><strong>Ask questions.</strong> Our volunteers and staff will share what they know about an item&apos;s source and preparation on request.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            NJ Food Allergy Emergency Resources
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you or someone in your household is having a severe allergic reaction, this page is
            not the place to look for help — call 911 or go to the nearest emergency room right
            away, and use prescribed medication (such as an EpiPen) while you wait for care.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Once the emergency has passed, these organizations can help with ongoing food allergy
            management and support in New Jersey:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>FARE (Food Allergy Research & Education)</strong> — national food allergy resources, emergency care plans, and support groups at{" "}
              <a href="https://www.foodallergy.org" target="_blank" rel="noopener noreferrer" className="text-green-700 underline underline-offset-2">foodallergy.org</a>.
            </li>
            <li><strong>Kids With Food Allergies</strong> — recipes, school planning, and community support for allergy families at{" "}
              <a href="https://kidswithfoodallergies.org" target="_blank" rel="noopener noreferrer" className="text-green-700 underline underline-offset-2">kidswithfoodallergies.org</a>.
            </li>
            <li><strong>2-1-1 New Jersey</strong> — dial 2-1-1 to connect with local health and food resources, including help finding allergist care.</li>
            <li><strong>Your pediatrician or allergist</strong> — for a written emergency care plan and prescription rescue medication.</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            For the full terms covering food safety, allergen risk, and liability for food we
            provide, see our{" "}
            <Link href="/legal/food-waiver" className="text-green-700 underline underline-offset-2">
              Food Safety & Allergy Waiver
            </Link>.
          </p>
        </section>

        <section className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-black mb-3">
            Need Food Assistance?
          </h2>
          <p className="text-base text-black/70 leading-relaxed">
            If you haven&apos;t enrolled with Seed & Spoon yet, visit{" "}
            <Link href="/get-help" className="text-green-700 underline underline-offset-2">
              Get Help
            </Link>{" "}
            to apply for food assistance and tell us about any allergies in your household.
          </p>
        </section>
      </div>
    </div>
  );
}
