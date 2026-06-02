// app/page.jsx
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

// Lazy load below-the-fold components so GSAP + heavy sections
// do not block initial paint or LCP
const StoryScroll = dynamic(() => import("@/components/StoryScroll"), { ssr: false });
const SpoonAssistFeature = dynamic(() => import("@/components/SpoonAssistFeature"), { ssr: false });
const WhyThisMatters = dynamic(() => import("@/components/WhyThisMatters"), { ssr: false });
const SDGSection = dynamic(() => import("@/components/sdgs/SDGSection"), { ssr: false });

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

export default function Home() {
  return (
    <>
      <Header />

      {/* HERO — eager loaded, above the fold */}
      <Hero />

      {/* Below-the-fold — lazy loaded to protect LCP */}
      <StoryScroll />
      <SpoonAssistFeature />
      <WhyThisMatters />
      <SDGSection />
    </>
  );
}

