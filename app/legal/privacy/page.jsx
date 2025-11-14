export const metadata = {
  title: "Privacy Policy | Seed & Spoon NJ - Protecting Your Information",
  description:
    "Learn how Seed & Spoon NJ protects your privacy, handles personal information, and ensures confidentiality for clients, donors, and volunteers.",
  openGraph: {
    title: "Privacy Policy | Seed & Spoon NJ",
    description:
      "Our commitment to protecting your personal information and privacy. Read our privacy policy for clients, donors, and volunteers.",
    url: "https://seedandspoon.org/legal/privacy",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Seed & Spoon NJ",
    description:
      "Learn how we protect your privacy and personal information at Seed & Spoon NJ.",
    images: ["/og-default.jpg"],
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Privacy Policy
        </h1>
        <p className="text-lg text-black/70">
          Our privacy policy details how we collect, use, and protect your personal information. Content coming soon.
        </p>
      </div>
    </div>
  );
}
