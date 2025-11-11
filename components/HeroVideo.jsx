"use client";
import { useEffect, useState } from "react";

export default function HeroVideo() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // If reduced motion is preferred, show poster only
  if (prefersReducedMotion) {
    return (
      <img
        src="/media/hero/hero-poster.jpg"
        alt="Seed & Spoon community"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    );
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/media/hero/hero-poster.jpg"
      className="absolute inset-0 w-full h-full object-cover object-center"
      preload="metadata"
      aria-label="Background video showing Seed & Spoon community impact"
    >
      {/* WebM first for Chrome/Android - better compression */}
      <source src="/media/hero/hero-video.webm" type="video/webm" />
      {/* MP4 for Safari/iOS - better compatibility */}
      <source src="/media/hero/hero-video.mp4" type="video/mp4" />
      {/* Fallback image for browsers that don't support video */}
      <img
        src="/media/hero/hero-poster.jpg"
        alt="Seed & Spoon community"
        className="w-full h-full object-cover object-center"
      />
    </video>
  );
}
