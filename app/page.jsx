// app/page.jsx
import Header from "@/components/Header";  // Capital H, exact match
import HeroVideo from "@/components/HeroVideo";
import HeroContent from "@/components/HeroContent";

export default function Home() {
  return (
    <>
      <Header />

      {/* HERO: VIDEO ONLY - Clean video display with transparent header */}
      <section className="hero-section relative w-full overflow-hidden bg-black">
        {/* Sentinel for transparent header detection */}
        <div id="hero-sentinel" className="absolute top-0 left-0 w-full h-1 pointer-events-none" aria-hidden="true" />

        {/* Video fills the entire viewport - responsive container */}
        <div className="absolute inset-0 w-full h-full">
          <HeroVideo />
        </div>

        {/* Subtle overlay for better video quality perception */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" aria-hidden="true" />
      </section>

      {/* CONTENT: BELOW HERO */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <HeroContent />
        </div>
      </section>
    </>
  );
}