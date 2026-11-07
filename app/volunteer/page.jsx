export const metadata = {
  title: "Volunteer with Seed & Spoon NJ | Join Our Food Justice Mission",
  description:
    "Volunteer with Seed & Spoon NJ: cook, drive, photograph, film, write, research, fundraise, or serve on our board. In-person and remote roles helping Newark kids eat well.",
  openGraph: {
    title: "Volunteer | Seed & Spoon NJ - Make a Difference",
    description:
      "Join our volunteer team in Newark and across New Jersey. From kitchen crews and drivers to social media, video, research, and board service, find your role.",
    url: "https://seedandspoon.org/volunteer",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volunteer | Seed & Spoon NJ - Make a Difference",
    description:
      "Be part of the solution. Volunteer to rescue food, cook meals, and empower communities across New Jersey.",
    images: ["/og-image.jpg"],
  },
};

import VolunteerPageClient from "@/components/volunteer/VolunteerPageClient";

export default function VolunteerPage() {
  return <VolunteerPageClient />;
}
