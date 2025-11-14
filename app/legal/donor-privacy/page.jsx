export const metadata = {
  title: "Donor Privacy Policy | Seed & Spoon NJ - Protecting Your Contributions",
  description:
    "Seed & Spoon NJ values donor privacy. Learn how we protect your donation information, financial data, and personal details with transparency and care.",
  openGraph: {
    title: "Donor Privacy Policy | Seed & Spoon NJ",
    description:
      "Our commitment to protecting donor information. Learn how we handle contributions and financial data with security and respect.",
    url: "https://seedandspoon.org/legal/donor-privacy",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donor Privacy | Seed & Spoon NJ",
    description:
      "Learn how we protect donor information and handle contributions with transparency and security.",
    images: ["/og-default.jpg"],
  },
};

export default function DonorPrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Donor Privacy Policy
        </h1>
        <p className="text-lg text-black/70">
          Our commitment to protecting donor privacy and handling contributions responsibly. Content coming soon.
        </p>
      </div>
    </div>
  );
}
