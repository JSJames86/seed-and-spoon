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
import dynamic from "next/dynamic";
import SpoonAssistFeature from "@/components/SpoonAssistFeature";

// GSAP (~40 KB) is only needed when the user scrolls; lazy-load the whole
// component so it's excluded from the initial page bundle.
const StoryScroll = dynamic(() => import("@/components/StoryScroll"));

export default function Home() {
  return (
    <>
      <Header />

      {/* HERO */}
      <Hero />

      {/* STORY SCROLL SECTION */}
      <StoryScroll />

      {/* SPOONASSIST FEATURE */}
      <SpoonAssistFeature />

      {/* WHY THIS WORK MATTERS */}
      <WhyThisMatters />
    </>
  );
}
