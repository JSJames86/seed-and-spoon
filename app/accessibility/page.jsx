export const metadata = {
  title: "Accessibility Statement | Seed & Spoon NJ - Inclusive Design for All",
  description:
    "Seed & Spoon NJ is committed to digital accessibility for people with disabilities. Learn about our efforts to ensure equal access to food resources and information.",
  openGraph: {
    title: "Accessibility Statement | Seed & Spoon NJ",
    description:
      "Our commitment to web accessibility and inclusive design. Seed & Spoon NJ ensures equal access to food assistance information and resources.",
    url: "https://seedandspoon.org/accessibility",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility | Seed & Spoon NJ",
    description:
      "Committed to inclusive digital access for all. Learn about our accessibility standards and resources.",
    images: ["/og-default.jpg"],
  },
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Accessibility
        </h1>
        <p className="text-lg text-black/70">
          Seed & Spoon is committed to ensuring digital accessibility for people with disabilities. Content coming soon.
        </p>
      </div>
    </div>
  );
}
