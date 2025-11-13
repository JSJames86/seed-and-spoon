"use client";
import HeroVideo from "./HeroVideo";

export default function Hero() {
  return (
    <section
      className="hero-section relative w-full overflow-hidden bg-black"
      style={{ touchAction: "pan-y" }}
    >
      <div
        id="hero-sentinel"
        className="absolute top-0 left-0 w-full h-px pointer-events-none"
        aria-hidden="true"
      />

      <HeroVideo />

      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}
