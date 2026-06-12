'use client';

import { forwardRef } from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Pill-shaped toggle chip. Active: solid ink bg, white text.
// Inactive: glass pill.
const Chip = forwardRef(function Chip({ active, className = '', children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium spoon-transition whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spoon-mint focus-visible:ring-offset-2',
        active ? 'bg-spoon-ink text-white' : 'spoon-glass text-spoon-ink hover:bg-white/80',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export default Chip;
