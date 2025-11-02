export default function HeroVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/hero-fallback.jpg"
      className="absolute inset-0 w-full h-full object-cover"
      aria-label="Background video showing Seed & Spoon community impact"
    >
      <source src="/hero.mp4" type="video/mp4" />
      <source src="/hero.webm" type="video/webm" />
      Your browser does not support the video tag.
    </video>
  );
}
