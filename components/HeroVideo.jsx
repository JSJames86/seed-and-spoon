export default function HeroVideo() {
  return (
    <section className="relative w-full mt-24">
      <video autoPlay loop muted playsInline className="w-full h-auto">
        <source src="/assets/hero-video.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
