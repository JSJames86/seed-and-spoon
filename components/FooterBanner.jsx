import Image from "next/image";

export default function FooterBanner() {
  return (
    <div className="relative overflow-hidden">
      <Image
        src="/brand/footer-illustration-no-logo-1600.webp"
        alt="Seed & Spoon community volunteering"
        width={1600}
        height={500}
        sizes="(min-width: 1280px) 1200px, (min-width: 640px) 800px, 100vw"
        className="w-full object-cover h-40 sm:h-48 lg:h-56"
        priority
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-white/0" />
    </div>
  );
}
