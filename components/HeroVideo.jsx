// components/HeroVideo.jsx
export default function HeroVideo() {
  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-fallback.jpg"
        className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
        preload="auto"
        aria-label="Seed & Spoon community impact"
      >
        <source src="/hero.mp4" type="video/mp4" />
        <source src="/hero.webm" type="video/webm" />
      </video>

      {/* Fallback image — only shows if video fails */}
      <noscript>
        <img
          src="/hero-fallback.jpg"
          alt="Community garden and food justice"
          className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
        />
      </noscript>
    </>
  );
}