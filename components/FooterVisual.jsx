import Image from "next/image";

export default function FooterVisual() {
  // Illustration configuration
  const illustrationSrc = "/brand/footer-illustration-tight-1600.webp";
  const illustrationWidth = 1600;
  const illustrationHeight = 480;

  // Logo: Use real brand asset (PNG until SVG is uploaded)
  const logoSvg = "/brand/logo-lockup.svg";
  const logoPng = "/assets/logo/seed-and-spoon-logo-full-compact.png";

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
            src={`${logoPng}?v=1`}
            alt="Seed & Spoon logo"
            draggable={false}
            className="w-full h-auto"
            onError={(e) => {
              // Try SVG if PNG fails (future-proofing for when you upload SVG)
              if (!e.target.dataset.tried) {
                e.target.dataset.tried = "true";
                e.target.src = `${logoSvg}?v=1`;
              } else {
                console.warn("Footer visual logo failed to load - no logo displayed");
                e.target.style.display = "none";
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
