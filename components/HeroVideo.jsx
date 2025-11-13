"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function HeroVideo() {
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 480);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const showPosterOnly = isMobile || videoError;

  // SSR fallback – poster only
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
    <div className="relative w-full h-full overflow-hidden">
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
    </div>
  );
}