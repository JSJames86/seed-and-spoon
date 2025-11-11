"use client";
import { useEffect } from "react";
import HeroVideo from "./HeroVideo";
import HeroContent from "./HeroContent";

export default function Hero() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);

    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  return (
    <section className="hero-section relative w-full min-h-[100dvh] overflow-hidden flex items-center justify-center bg-black">
      <div
        id="hero-sentinel"
        className="absolute top-0 left-0 w-full h-px pointer-events-none"
        aria-hidden="true"
      />

      <HeroVideo />

      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 pointer-events-none"
        aria-hidden="true"
      />

      <HeroContent />
    </section>
  );
}
