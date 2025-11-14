export const metadata = {
  title: "Donate to Seed & Spoon NJ | Support Hunger Relief & Food Justice",
  description:
    "Your donation helps Seed & Spoon NJ rescue surplus food, prepare fresh meals, and empower families across New Jersey. Every dollar fights hunger and reduces waste.",
  openGraph: {
    title: "Donate | Seed & Spoon NJ - Every Dollar Feeds Families",
    description:
      "Support community-powered hunger relief in New Jersey. Your tax-deductible donation rescues food, feeds families, and builds a more sustainable food system.",
    url: "https://seedandspoon.org/donate",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate | Seed & Spoon NJ - Every Dollar Feeds Families",
    description:
      "Help us turn surplus into sustenance. Donate to fight hunger and food waste in New Jersey.",
    images: ["/og-default.jpg"],
  },
};

import DonatePageClient from "@/components/donate/DonatePageClient";

export default function DonatePage() {
  return <DonatePageClient />;
}
