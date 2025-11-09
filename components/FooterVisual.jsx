import Image from "next/image";

// Inline fallback logo if external SVGs are missing
function FallbackLogo({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Seed & Spoon logo"
    >
      {/* Simple seed/spoon iconography */}
      <circle cx="30" cy="30" r="20" fill="currentColor" opacity="0.1" />
      <path
        d="M30 15C25 15 22 18 22 22C22 27 25 30 30 30C30 30 30 25 30 22C30 22 33 22 36 22C39 22 42 25 42 30C42 35 39 38 35 38C32 38 29 35 29 30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text
        x="55"
        y="38"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="currentColor"
      >
        Seed &amp; Spoon
      </text>
    </svg>
  );
}

export default function FooterVisual() {
  // Logo fallback chain: prefer lockup, then icon, then inline fallback
  const logoSrc = "/brand/logo-lockup.svg"; // Primary preference
  const logoFallback = "/assets/logo/seed-and-spoon-logo-full-compact.png";
  
  return (
    <div className="bg-white">
      {/* Illustration - centered, no gradient, pure white background */}
      <div className="relative w-full flex justify-center">
        <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[560px] xl:max-w-[640px]">
          <Image
            src="/brand/footer-illustration-no-logo-1600.webp"
            alt=""
            width={1600}
            height={500}
            sizes="(max-width: 640px) 320px, (max-width: 768px) 400px, (max-width: 1024px) 480px, (max-width: 1280px) 560px, 640px"
            className="w-full h-auto object-contain"
            priority={false}
          />
        </div>
      </div>

      {/* Logo - visually touches the illustration (negative margin to close gap) */}
      <div className="flex justify-center -mt-2 pb-6">
        <img
          src={logoFallback}
          alt="Seed & Spoon logo"
          className="w-[320px] sm:w-[400px] md:w-[480px] lg:w-[560px] xl:w-[640px] h-auto"
          onError={(e) => {
            // If logo fails to load, show fallback
            e.target.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = e.target.className;
            e.target.parentNode.appendChild(fallback);
          }}
        />
      </div>
    </div>
  );
}
