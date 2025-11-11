// app/page.jsx
import Header from "@/components/header";
import HeroVideo from "@/components/HeroVideo";
import HeroContent from "@/components/HeroContent";

export default function Home() {
  return (
    <>
      <Header />

      {/* HERO: VIDEO ONLY */}
      <section className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-black">
        <div id="hero-sentinel" className="absolute top-0 left-0 w-full h-1 -z-10" />
        <HeroVideo />
        <div className="absolute inset-0 bg-black/40" />
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