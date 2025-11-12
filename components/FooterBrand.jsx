import Link from "next/link";

export default function FooterBrand() {
  // Use real brand logo - prefer WebP for best performance, fallback to PNG
  const logoWebp = "/assets/logo/seed-and-spoon-logo-compact.webp";
  const logoFallback = "/assets/logo/seed-and-spoon-logo-full-compact.png";

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 rounded-lg"
    >
      <img
        src={`${logoWebp}?v=2`}
        alt="Seed & Spoon logo"
        className="h-8 w-auto select-none"
        draggable={false}
        onError={(e) => {
          // If WebP fails, try PNG fallback
          if (!e.target.dataset.tried) {
            e.target.dataset.tried = "true";
            e.target.src = `${logoFallback}?v=2`;
          } else {
            console.warn("Footer logo failed to load");
          }
        }}
      />
      <span className="text-lg font-bold tracking-tight text-black">
        Seed & Spoon
      </span>
    </Link>
  );
}
