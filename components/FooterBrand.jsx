import Link from "next/link";

// Inline placeholder logo icon - replace when /public/brand/logo-icon.svg is available
function LogoIcon({ className = "w-7 h-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Placeholder: Simple seed/leaf icon */}
      <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.1" />
      <path
        d="M16 8C13 8 11 10 11 13C11 16 13 18 16 18C16 18 16 15 16 13C16 13 18 13 20 13C22 13 24 15 24 18C24 21 22 23 19 23C16 23 14 21 14 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function FooterBrand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 rounded-lg"
    >
      <LogoIcon className="w-7 h-7 text-black transition-transform group-hover:scale-110" />
      <span className="text-lg font-bold tracking-tight text-black">
        Seed & Spoon
      </span>
    </Link>
  );
}
