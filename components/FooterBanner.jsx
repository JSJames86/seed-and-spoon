import Image from "next/image";

export default function FooterBanner() {
  return (
    <div className="bg-white">
      {/* Banner Image */}
      <div className="relative overflow-hidden">
        <Image
          src="/brand/footer-illustration-no-logo-1600.webp"
          alt="Seed & Spoon community volunteering"
          width={1600}
          height={500}
          sizes="(min-width: 1280px) 1200px, (min-width: 640px) 800px, 100vw"
          className="w-full object-cover object-[center_bottom] h-36 sm:h-44 lg:h-52"
          priority
        />
        {/* Subtle gradient overlay - much lighter than before */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
      </div>

      {/* Logo - positioned to visually touch the banner */}
      <div className="flex justify-center bg-white -mt-[2px]">
        <img
          src="/assets/logo/seed-and-spoon-logo-full-compact.png"
          alt="Seed & Spoon logo"
          className="w-40 sm:w-48 md:w-56"
        />
      </div>
    </div>
  );
}
