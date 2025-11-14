export const metadata = {
  title: "Get Food Help | Seed & Spoon NJ - Apply for Assistance",
  description:
    "Need food assistance in New Jersey? Apply for help, refer a client, or find local food pantries and meal sites. Seed & Spoon NJ connects families with dignity-centered food resources.",
  openGraph: {
    title: "Get Food Help | Seed & Spoon NJ - Connecting Families with Resources",
    description:
      "Find food assistance in New Jersey. Apply for help, explore our resource map, and connect with pantries, meal programs, and community support.",
    url: "https://seedandspoon.org/get-help",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Food Help | Seed & Spoon NJ",
    description:
      "Need food assistance? We're here to help connect you with meals, groceries, and community resources across New Jersey.",
    images: ["/og-default.jpg"],
  },
};

import GetHelpPageClient from "@/components/get-help/GetHelpPageClient";

export default function GetHelpPage() {
  return <GetHelpPageClient />;
}
