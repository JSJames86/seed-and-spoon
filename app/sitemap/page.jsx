// Sitemap page - renders an HTML sitemap for users

export const metadata = {
  title: "Sitemap | Seed & Spoon NJ - Complete Site Navigation",
  description:
    "Explore all pages on Seed & Spoon NJ's website. Find resources for getting help, volunteering, donating, and learning about our food rescue mission.",
  openGraph: {
    title: "Sitemap | Seed & Spoon NJ",
    description:
      "Browse the complete Seed & Spoon NJ site map to find food assistance resources, volunteer opportunities, and ways to support our mission.",
    url: "https://seedandspoon.org/sitemap",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sitemap | Seed & Spoon NJ",
    description:
      "Complete site navigation for Seed & Spoon NJ - food rescue, hunger relief, and community empowerment.",
    images: ["/og-default.jpg"],
  },
};

import Link from "next/link";

export default function SitemapPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://seedandspoon.org";

  const pages = [
    // Core pages
    { url: "/", title: "Home", priority: "High" },
    { url: "/about", title: "About Us", priority: "High" },
    { url: "/causes", title: "Our Causes", priority: "High" },
    { url: "/get-help", title: "Get Help", priority: "High" },
    { url: "/donate", title: "Donate", priority: "High" },
    { url: "/volunteer", title: "Volunteer", priority: "High" },
  ];

  const causePages = [
    { url: "/causes/surplus-rescue", title: "Surplus Rescue" },
    { url: "/causes/pantry-partners", title: "Pantry Partners" },
    { url: "/causes/prepared-meals", title: "Prepared Meals" },
    { url: "/causes/workshops", title: "Workshops & Education" },
  ];

  const legalPages = [
    { url: "/accessibility", title: "Accessibility Statement" },
    { url: "/legal/privacy", title: "Privacy Policy" },
    { url: "/legal/terms", title: "Terms of Service" },
    { url: "/legal/food-waiver", title: "Food Donation Waiver" },
    { url: "/legal/donor-privacy", title: "Donor Privacy Policy" },
    { url: "/legal/non-discrimination", title: "Non-Discrimination Policy" },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Sitemap</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-700">
            Main Pages
          </h2>
          <ul className="space-y-2">
            {pages.map((page) => (
              <li key={page.url} className="flex items-center">
                <Link
                  href={page.url}
                  className="text-blue-600 hover:underline flex-1"
                >
                  {page.title}
                </Link>
                <span className="text-sm text-gray-500 ml-4">
                  {page.priority} Priority
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-700">
            Our Causes
          </h2>
          <ul className="space-y-2">
            {causePages.map((page) => (
              <li key={page.url}>
                <Link
                  href={page.url}
                  className="text-blue-600 hover:underline"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-700">
            Legal & Policies
          </h2>
          <ul className="space-y-2">
            {legalPages.map((page) => (
              <li key={page.url}>
                <Link
                  href={page.url}
                  className="text-blue-600 hover:underline"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
