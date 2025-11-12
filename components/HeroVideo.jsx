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
          poster="/hero-fallback.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            width: '100%',
            height: '100%',
            maxWidth: '100vw',
            maxHeight: '100vh'
          }}
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
          src="/hero-fallback.jpg"
          alt="Seed & Spoon community - building food sovereignty in Essex County"
          fill
          className="object-cover object-center"
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          priority
          sizes="100vw"
        />
      )}
    </>
  );
}
