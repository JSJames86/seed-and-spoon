export default function HeroVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/hero-fallback.jpg"
      className="absolute inset-0 w-full h-full object-cover object-[center_20%] md:object-center"
      preload="metadata"
      aria-label="Background video showing Seed & Spoon community impact"
    >
      <source src="/hero.mp4" type="video/mp4" />
      <source src="/hero.webm" type="video/webm" />
      {/* Fallback image for browsers that don't support video */}
      <img
        src="/hero-fallback.jpg"
        alt="Seed & Spoon community"
        className="w-full h-full object-cover object-[center_20%] md:object-center"
      />
    </video>
  );
}
