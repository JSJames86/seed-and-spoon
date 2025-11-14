export const metadata = {
  title: "Thank You | Seed & Spoon NJ - Your Donation Makes a Difference",
  description:
    "Thank you for supporting Seed & Spoon NJ! Your generous donation helps rescue food, feed families, and build a more sustainable and equitable New Jersey.",
  openGraph: {
    title: "Thank You | Seed & Spoon NJ",
    description:
      "Your donation is transforming lives. Thank you for supporting hunger relief and food justice in New Jersey.",
    url: "https://seedandspoon.org/thank-you",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thank You | Seed & Spoon NJ",
    description:
      "Your support makes a real difference in fighting hunger and food waste across New Jersey. Thank you!",
    images: ["/og-default.jpg"],
  },
};

import ThankYouPageClient from "@/components/thank-you/ThankYouPageClient";

export default function ThankYouPage() {
  return <ThankYouPageClient />;
}
