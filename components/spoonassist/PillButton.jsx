'use client';

const VARIANTS = {
  primary: 'bg-[var(--sa-accent)] text-white hover:brightness-105 active:brightness-95',
  secondary: 'bg-[var(--sa-surface)] text-[var(--sa-ink)] border border-[var(--sa-surface-alt)] hover:bg-[var(--sa-surface-alt)]',
  ghost: 'bg-transparent text-[var(--sa-ink-soft)] hover:bg-[var(--sa-surface-alt)]',
};

const SIZES = {
  sm: 'text-[13px] px-4 py-2',
  md: 'text-[15px] px-5 py-2.5',
  lg: 'text-[17px] px-6 py-3.5',
};

// The one reusable pill shape every button, input, and CTA in the SpoonAssist
// v2 shell is built from — see spec §3, rule 2 ("nothing square").
export default function PillButton({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--sa-radius-pill)] font-semibold spoon-transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
