// components/HeroVideo.jsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function HeroVideo() {
  const [videoError, setVideoError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show poster-only if video errors
  const showPosterOnly = videoError;

  // Prevent hydration mismatch - show poster during SSR
  if (!mounted) {
    return (
      <Image
        src="/media/hero/hero-poster.jpg"
        alt="Seed & Spoon community"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
    );
  }

  return (
    <>
      {!showPosterOnly ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero/hero-poster.jpg"
          className="hero-video"
          preload="auto"
          aria-label="Seed & Spoon community impact"
          onError={(e) => {
            console.warn("Hero video failed to load, using fallback image");
            setVideoError(true);
          }}
        >
          <source src="/media/hero/hero-video.mp4" type="video/mp4" />
          <source src="/media/hero/hero-video.webm" type="video/webm" />
        </video>
      ) : (
        <Image
          src="/media/hero/hero-poster.jpg"
          alt="Seed & Spoon community - building food sovereignty in Essex County"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      )}
    </>
  );
}
