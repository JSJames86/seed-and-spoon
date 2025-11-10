import Image from "next/image";

// Inline placeholder logo if SVG assets are missing
function PlaceholderLogo({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 560 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Seed & Spoon logo"
    >
      {/* Simple seed/leaf icon */}
      <circle cx="40" cy="40" r="28" fill="currentColor" opacity="0.08" />
      <path
        d="M40 20C33 20 28 25 28 32C28 41 33 46 40 46C40 46 40 39 40 32C40 32 45 32 50 32C55 32 60 37 60 46C60 55 55 60 48 60C41 60 36 55 36 46"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Text */}
      <text
        x="90"
        y="52"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="32"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="-0.02em"
      >
        Seed &amp; Spoon
      </text>
    </svg>
  );
}

export default function FooterVisual() {
  // Detect which illustration files exist (all 4 tight variants are available)
  const illustrationSrc = "/brand/footer-illustration-tight-1600.webp";
  const illustrationWidth = 1600;
  const illustrationHeight = 480;

  // Logo priority: lockup.svg → icon.svg → placeholder
  // Since no SVG files exist yet, we'll use placeholder
  const logoSrc = "/brand/logo-lockup.svg"; // Will fallback to placeholder if missing

  return (
    <div className="bg-white">
      {/* Shared width container using CSS variable */}
      <div
        className="mx-auto w-[var(--fvw)]"
        style={{ ['--fvw']: 'min(92vw, 900px)' }}
      >
        {/* Illustration - decorative, no gradient, object-contain */}
        <Image
          src={illustrationSrc}
          alt=""
          aria-hidden="true"
          width={illustrationWidth}
          height={illustrationHeight}
          srcSet={`
            /brand/footer-illustration-tight-1200.webp 1200w,
            /brand/footer-illustration-tight-1600.webp 1600w,
            /brand/footer-illustration-tight-2200.webp 2200w
          `}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 1200px, 1600px"
          className="block mx-auto w-[var(--fvw)] h-32 sm:h-40 md:h-48 lg:h-56 object-contain select-none"
          priority={false}
        />

        {/* Logo - sits directly below illustration with negative margin to close gap */}
        <div className="block mx-auto -mt-[3px] w-[min(560px,92vw)] sm:w-[min(640px,92vw)] md:w-[min(720px,92vw)]">
          <img
            src={logoSrc}
            alt="Seed & Spoon logo"
            draggable={false}
            className="w-full h-auto"
            onError={(e) => {
              // If SVG logo fails, render inline placeholder
              const placeholder = document.createElement('div');
              placeholder.innerHTML = `
                <svg viewBox="0 0 560 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto text-neutral-900">
                  <circle cx="40" cy="40" r="28" fill="currentColor" opacity="0.08" />
                  <path d="M40 20C33 20 28 25 28 32C28 41 33 46 40 46C40 46 40 39 40 32C40 32 45 32 50 32C55 32 60 37 60 46C60 55 55 60 48 60C41 60 36 55 36 46" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                  <text x="90" y="52" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="32" font-weight="700" fill="currentColor" letter-spacing="-0.02em">Seed &amp; Spoon</text>
                </svg>
              `;
              e.target.replaceWith(placeholder.firstElementChild);
            }}
          />
        </div>
      </div>
    </div>
  );
}
