// app/page.jsx
import Hero from "@/components/Hero";
import BelowFold from "@/components/BelowFold";

export const metadata = {
  title: "Seed & Spoon NJ | Fighting Youth Hunger in Newark, NJ",
  description:
    "Seed & Spoon is a Newark-based restorative care network serving Essex County — connecting families, volunteers, and local kitchens to deliver meals, food boxes, and support with dignity.",
  openGraph: {
    title: "Seed & Spoon NJ | Fighting Youth Hunger in Newark, NJ",
    description:
      "Seed & Spoon is a Newark-based restorative care network serving Essex County — connecting families, volunteers, and local kitchens to deliver meals, food boxes, and support with dignity.",
    url: "https://seedandspoon.org",
    images: ["/media/hero/hero-bg.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seed & Spoon NJ | Fighting Youth Hunger in Newark, NJ",
    description:
      "A Newark-based restorative care network serving Essex County — delivering meals, food boxes, and support with dignity.",
    images: ["/media/hero/hero-bg.jpg"],
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <BelowFold />
    </>
  );
}
