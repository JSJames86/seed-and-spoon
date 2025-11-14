export const metadata = {
  title: "Volunteer with Seed & Spoon NJ | Join Our Food Justice Mission",
  description:
    "Volunteer with Seed & Spoon NJ to help rescue surplus food, prepare meals, and serve families facing hunger. Flexible shifts, meaningful impact, and community connection await.",
  openGraph: {
    title: "Volunteer | Seed & Spoon NJ - Make a Difference",
    description:
      "Join our volunteer team in Newark and across New Jersey. From kitchen crews to delivery drivers, find your role in fighting hunger and food waste.",
    url: "https://seedandspoon.org/volunteer",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volunteer | Seed & Spoon NJ - Make a Difference",
    description:
      "Be part of the solution. Volunteer to rescue food, cook meals, and empower communities across New Jersey.",
    images: ["/og-default.jpg"],
  },
};

import VolunteerPageClient from "@/components/volunteer/VolunteerPageClient";

export default function VolunteerPage() {
  return <VolunteerPageClient />;
}
