import Link from 'next/link';

export default function SectionHeader({ title, seeAllHref, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h2 className="text-[22px] font-semibold text-[var(--sa-ink)]">{title}</h2>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="text-[13px] font-semibold text-[var(--sa-ink-soft)] hover:text-[var(--sa-ink)] spoon-transition"
        >
          See all
        </Link>
      )}
    </div>
  );
}
