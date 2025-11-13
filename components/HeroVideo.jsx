"use client";
import Image from "next/image";

export default function HeroVideo() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/media/hero/hero-poster.jpg"
        preload="auto"
      >
        <source src="/media/hero/hero-video.mp4" type="video/mp4" />
        <source src="/media/hero/hero-video.webm" type="video/webm" />
        {/* Fallback poster if video fails */}
        <Image
          src="/media/hero/hero-poster.jpg"
          alt="Seed & Spoon"
          fill
          className="object-cover"
          priority
        />
      </video>
    </div>
  );
}