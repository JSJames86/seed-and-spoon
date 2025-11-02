export default function HeroVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/hero-fallback.jpg"
      className="w-full h-auto max-h-[90vh] object-cover md:max-h-[100vh]"
      aria-label="Background video showing Seed & Spoon community impact"
    >
      <source src="/hero.mp4" type="video/mp4" />
      <source src="/hero.webm" type="video/webm" />
      Your browser does not support the video tag.
    </video>
  );
}
