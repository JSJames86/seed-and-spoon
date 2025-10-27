export default function HeroVideo() {
  return (
    <section className="relative w-full mt-16 sm:mt-[72px] md:mt-20 lg:mt-[88px]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto max-h-64 sm:max-h-96 lg:max-h-[500px] object-cover"
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
