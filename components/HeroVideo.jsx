"use client";
import { useEffect, useState } from "react";

export default function HeroVideo() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/media/hero/hero-poster.jpg';
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/media/hero/hero-poster.jpg"
          alt="Seed & Spoon community"
          className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/media/hero/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
        preload="auto"
        aria-label="Background video showing Seed & Spoon community impact"
      >
        <source src="/media/hero/hero-video.webm" type="video/webm" />
        <source src="/media/hero/hero-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
