// components/HeroVideo.jsx
"use client";
import { useState } from "react";
import Image from "next/image";

export default function HeroVideo() {
  const [videoError, setVideoError] = useState(false);

  return (
    <>
      {!videoError ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-slide-3.jpeg"
          className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
          preload="auto"
          aria-label="Seed & Spoon community impact"
          onError={(e) => {
            console.warn("Hero video failed to load, using fallback image");
            setVideoError(true);
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
          <source src="/hero.webm" type="video/webm" />
        </video>
      ) : (
        <Image
          src="/hero-slide-3.jpeg"
          alt="Seed & Spoon community - building food sovereignty in Essex County"
          fill
          className="object-cover object-top md:object-center"
          priority
          sizes="100vw"
        />
      )}
    </>
  );
}