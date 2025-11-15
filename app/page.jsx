// app/page.jsx

export const metadata = {
  title: "Seed & Spoon | Nourishing Essex County with dignity",
  description:
    "Seed & Spoon is a restorative care network in Essex County, NJ — connecting families, volunteers, and local kitchens to deliver meals, food boxes, and support with dignity.",
  openGraph: {
    title: "Seed & Spoon | Nourishing Essex County with dignity",
    description:
      "Seed & Spoon is a restorative care network in Essex County, NJ — connecting families, volunteers, and local kitchens to deliver meals, food boxes, and support with dignity.",
    url: "https://seedandspoon.org",
    images: ["/media/hero/hero-bg.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seed & Spoon | Nourishing Essex County with dignity",
    description:
      "A restorative care network delivering meals, food boxes, and support with dignity across Essex County, NJ.",
    images: ["/media/hero/hero-bg.jpg"],
  },
};

import Header from "@/components/Header";  // Capital H, exact match
import Hero from "@/components/Hero";
import WhyThisMatters from "@/components/WhyThisMatters";
import StoryScroll from "@/components/StoryScroll";

export default function Home() {
  return (
    <>
      <Header />

      {/* HERO */}
      <Hero />

      {/* STORY SCROLL SECTION */}
      <StoryScroll />

      {/* WHY THIS WORK MATTERS */}
      <WhyThisMatters />
    </>
  );
}
