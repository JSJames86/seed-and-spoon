"use client";

import Image from "next/image";

export default function HeroVideo() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Video – always present */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/media/hero/hero-poster.jpg"
        className="hero-video"
        preload="auto"
        aria-label="Seed & Spoon community impact"
      >
        <source src="/media/hero/hero-video.mp4" type="video/mp4" />
        <source src="/media/hero/hero-video.webm" type="video/webm" />
      </video>

      {/* SSR fallback – hidden after mount */}
      <Image
        src="/media/hero/hero-poster.jpg"
        alt="Seed & Spoon community"
        fill
        className="object-cover object-center hidden"
        priority
        sizes="100vw"
      />
    </div>
  );
}