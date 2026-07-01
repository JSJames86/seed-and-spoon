'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  {
    href: '/spoonassist',
    label: 'Home',
    icon: (
      <path d="M3 9.5 10 4l7 5.5V16a1 1 0 01-1 1h-3.5v-4.5h-5V17H4a1 1 0 01-1-1V9.5Z" />
    ),
  },
  {
    href: '/spoonassist/recipes',
    label: 'Recipes',
    icon: (
      <>
        <path d="M6 3v6a2 2 0 002 2h0" />
        <path d="M6 3v14M9 3v8" />
        <path d="M15 3a3 3 0 013 3v3a3 3 0 01-3 3v6" />
      </>
    ),
  },
  {
    href: '/spoonassist/plan',
    label: 'Plan',
    icon: (
      <>
        <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
        <path d="M3.5 8.5h13M7 3v3M13 3v3" />
      </>
    ),
  },
  {
    href: '/spoonassist/list',
    label: 'List',
    icon: (
      <>
        <path d="M4 5h12M4 10h12M4 15h8" />
        <circle cx="2.2" cy="5" r="0.4" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    href: '/spoonassist/profile',
    label: 'Profile',
    icon: (
      <>
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </>
    ),
  },
];

function TabIcon({ children }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function isActive(pathname, href) {
  if (href === '/spoonassist') return pathname === '/spoonassist';
  return pathname?.startsWith(href);
}

// `variant` picks which physical nav renders — the layout mounts one of each
// (desktop segmented control in the top bar, mobile pill in a fixed footer)
// so exactly one is present per breakpoint, never both stacked on top of
// each other.
export default function BottomTabNav({ variant = 'mobile' }) {
  const pathname = usePathname();

  if (variant === 'desktop') {
    return (
      <nav aria-label="SpoonAssist" className="hidden lg:flex items-center gap-1 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface)] p-1 shadow-[var(--sa-shadow-card)]">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-1.5 rounded-[var(--sa-radius-pill)] px-4 py-2 text-[14px] font-semibold spoon-transition ${
                active
                  ? 'bg-[var(--sa-green-deep)] text-[var(--sa-bg)]'
                  : 'text-[var(--sa-ink-soft)] hover:bg-[var(--sa-surface-alt)]'
              }`}
            >
              <TabIcon>{tab.icon}</TabIcon>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="SpoonAssist"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-3 sa-bottom-nav-safe-area"
    >
      <div className="flex items-center gap-1.5 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface)] px-2.5 py-2 shadow-[0_4px_20px_rgb(69_71_36_/_0.18)]">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className={`flex h-11 w-11 items-center justify-center rounded-full spoon-transition ${
                active
                  ? 'bg-[var(--sa-green-deep)] text-[var(--sa-bg)]'
                  : 'bg-[var(--sa-surface-alt)] text-[var(--sa-ink)]'
              }`}
            >
              <TabIcon>{tab.icon}</TabIcon>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
