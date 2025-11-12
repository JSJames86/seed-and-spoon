// app/page.jsx
import Header from "@/components/Header";  // Capital H, exact match
import Hero from "@/components/Hero";
import HeroContent from "@/components/HeroContent";

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
    </>
  );
}