"use client";

const baseClasses =
  'inline-flex items-center justify-center rounded-full px-6 py-3 body-sm font-bold transition-colors duration-200';

const variantClasses = {
  primary:
    'bg-[var(--green-primary)] text-[var(--white)] shadow-sm hover:bg-[#3f932f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-primary)]',
  secondary:
    'bg-[var(--orange-primary)] text-[var(--white)] shadow-sm hover:bg-[#c65718] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--orange-primary)]',
  outline:
    'bg-[var(--white)] text-[var(--green-primary)] border-2 border-[var(--green-primary)] hover:bg-[#eaf6e5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-primary)]',
};

export default function Button({
  variant = 'primary',
  href,
  children,
  className = '',
  ...props
}) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
