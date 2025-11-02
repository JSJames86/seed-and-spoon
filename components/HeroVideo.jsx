export default function HeroVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/hero-fallback.jpg"
      className="absolute inset-0 w-full h-full object-cover -z-10"
    >
      <source src="/hero.mp4" type="video/mp4" />
      <source src="/hero.webm" type="video/webm" />
    </video>
  );
}
