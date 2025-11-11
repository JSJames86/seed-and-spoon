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
    const posterLink = document.createElement('link');
    posterLink.rel = 'preload';
    posterLink.as = 'image';
    posterLink.href = '/media/hero/hero-poster.jpg';
    document.head.appendChild(posterLink);

    const webmLink = document.createElement('link');
    webmLink.rel = 'preload';
    webmLink.as = 'video';
    webmLink.href = '/media/hero/hero-video.webm';
    webmLink.type = 'video/webm';
    document.head.appendChild(webmLink);

    return () => {
      if (posterLink.parentNode) posterLink.parentNode.removeChild(posterLink);
      if (webmLink.parentNode) webmLink.parentNode.removeChild(webmLink);
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
