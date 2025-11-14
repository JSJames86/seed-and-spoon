export const metadata = {
  title: "Cookie Policy | Seed & Spoon NJ - Manage Your Preferences",
  description:
    "Learn how Seed & Spoon NJ uses cookies and similar technologies. Manage your cookie preferences and understand how we collect website usage data.",
  openGraph: {
    title: "Cookie Policy | Seed & Spoon NJ",
    description:
      "Manage your cookie preferences and learn about our cookie usage for website functionality and analytics.",
    url: "https://seedandspoon.org/legal/cookies",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy | Seed & Spoon NJ",
    description:
      "Learn about cookie usage and manage your preferences on our website.",
    images: ["/og-default.jpg"],
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Cookie Settings
        </h1>
        <p className="text-lg text-black/70">
          Learn about how we use cookies and manage your preferences. Content coming soon.
        </p>
      </div>
    </div>
  );
}
