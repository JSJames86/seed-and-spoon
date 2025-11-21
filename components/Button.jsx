"use client";

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 body-sm font-semibold transition-all duration-300 border-0';

const variantClasses = {
  primary:
    'bg-[var(--green-primary)] text-[var(--white)] shadow-green-glow hover:bg-[var(--leaf-mid)] hover:-translate-y-0.5 hover:shadow-green-glow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-primary)]',
  secondary:
    'bg-[var(--orange-primary)] text-[var(--white)] shadow-orange-glow hover:bg-[#c65718] hover:-translate-y-0.5 hover:shadow-orange-glow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--orange-primary)]',
  accent:
    'text-[var(--white)] shadow-orange-glow hover:-translate-y-0.5 hover:shadow-orange-glow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--orange-primary)]',
  dark:
    'bg-[var(--dark-forest)] text-[var(--white)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dark-forest)]',
  outline:
    'bg-transparent text-[var(--green-primary)] border-2 border-[var(--green-primary)] hover:bg-[rgba(79,175,59,0.1)] hover:border-[var(--leaf-mid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-primary)]',
  ghost:
    'bg-transparent text-[var(--green-primary)] border-2 border-[var(--green-primary)] px-[30px] py-3 hover:bg-[rgba(79,175,59,0.1)] hover:border-[var(--leaf-mid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-primary)]',
};

// Add inline style for accent gradient button
const accentStyle = {
  background: 'var(--orange-gradient)',
};

export default function Button({
  variant = 'primary',
  href,
  children,
  className = '',
  ...props
}) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  const style = variant === 'accent' ? accentStyle : {};

  if (href) {
    return (
      <a href={href} className={classes} style={style} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} style={style} {...props}>
      {children}
    </button>
  );
}
