export const metadata = {
  title: "Food Safety & Allergy Waiver | Seed & Spoon NJ - Important Information",
  description:
    "Important food safety and allergen information for Seed & Spoon NJ clients. Learn about our food handling practices, labeling, and allergy awareness protocols.",
  openGraph: {
    title: "Food Safety & Allergy Waiver | Seed & Spoon NJ",
    description:
      "Food safety protocols and allergen awareness at Seed & Spoon NJ. Read important information for clients receiving food assistance.",
    url: "https://seedandspoon.org/legal/food-waiver",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Safety & Allergen Info | Seed & Spoon NJ",
    description:
      "Important food safety and allergy information for clients of Seed & Spoon NJ.",
    images: ["/og-default.jpg"],
  },
};

export default function FoodWaiverPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Food Safety & Allergy Waiver
        </h1>
        <p className="text-lg text-black/70">
          This waiver covers important information about food safety practices and allergen awareness. Content coming soon.
        </p>
      </div>
    </div>
  );
}
