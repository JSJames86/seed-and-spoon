'use client';

import { forwardRef } from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const VARIANTS = {
  // Solid ink pill with white text — primary actions
  primary: 'bg-spoon-ink text-white hover:opacity-90',
  // Glass pill — secondary actions
  secondary: 'spoon-glass text-spoon-ink hover:bg-white/80',
};

const SIZES = {
  default: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
  sm: 'px-4 py-2 text-sm',
};

const SpoonButton = forwardRef(function SpoonButton(
  { variant = 'primary', size = 'default', className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold spoon-transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spoon-mint focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export default SpoonButton;
