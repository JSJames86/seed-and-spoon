export const metadata = {
  title: "Get Food Help | Seed & Spoon NJ - Family Intake",
  description:
    "Need food help in Essex County? Start a family intake, send a referral, or find local food pantries and meal sites. We never ask for income or Social Security numbers.",
  openGraph: {
    title: "Get Food Help | Seed & Spoon NJ - Connecting Families with Resources",
    description:
      "Find food assistance in New Jersey. Start a family intake, explore our resource map, and connect with pantries, meal programs, and community support.",
    url: "https://seedandspoon.org/get-help",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Food Help | Seed & Spoon NJ",
    description:
      "Need food assistance? We're here to help connect you with meals, groceries, and community resources across New Jersey.",
    images: ["/og-image.jpg"],
  },
};

import GetHelpPageClient from "@/components/get-help/GetHelpPageClient";

export default function GetHelpPage() {
  return <GetHelpPageClient />;
}
