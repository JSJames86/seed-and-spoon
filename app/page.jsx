// app/page.jsx

export const metadata = {
  title: "Seed & Spoon NJ | Fighting Hunger, Rescuing Food, Empowering Communities",
  description:
    "Seed & Spoon NJ transforms surplus food into nutritious meals for families facing food insecurity across New Jersey. Join our community-powered mission to end hunger with dignity and sustainability.",
  openGraph: {
    title: "Seed & Spoon NJ | Fighting Hunger Through Food Rescue",
    description:
      "Community-centered food rescue and hunger relief in New Jersey. We turn surplus food into fresh meals, support local pantries, and empower families with dignity.",
    url: "https://seedandspoon.org",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seed & Spoon NJ | Fighting Hunger Through Food Rescue",
    description:
      "Transforming surplus into sustenance. Join our community-powered mission to end hunger in New Jersey.",
    images: ["/og-default.jpg"],
  },
};

import Header from "@/components/Header";  // Capital H, exact match
import Hero from "@/components/Hero";
import HeroContent from "@/components/HeroContent";
import StoryScroll from "@/components/StoryScroll";

export default function Home() {
  return (
    <>
      <Header />

      {/* HERO: VIDEO with dynamic viewport height handling */}
      <Hero />

      {/* CONTENT: BELOW HERO */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <HeroContent />
        </div>
      </section>

      {/* STORY SCROLL SECTION */}
      <StoryScroll />
    </>
  );
}
