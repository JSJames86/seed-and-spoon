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
        className="absolute inset-0 w-full h-full object-cover object-center"
        preload="auto"
        aria-label="Seed & Spoon community impact"
        style={{
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        <source src="/hero.mp4" type="video/mp4" />
        <source src="/hero.webm" type="video/webm" />
      </video>

      {/* Fallback image — only shows if video fails */}
      <noscript>
        <img
          src="/hero-fallback.jpg"
          alt="Community garden and food justice"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </noscript>
    </>
  );
}