import Image from 'next/image';
import Link from 'next/link';
import BottomTabNav from '@/components/spoonassist/BottomTabNav';
import { PlanProvider } from '@/components/spoonassist/PlanProvider';
import { ThemeProvider } from '@/components/spoonassist/ThemeProvider';
import './spoonassist-v2.css';

export const metadata = {
  title: {
    default: 'SpoonAssist',
    template: '%s | SpoonAssist',
  },
  description: 'Plan your week, get one smart shopping list, and compare grocery prices before you buy.',
  manifest: '/spoonassist/manifest.webmanifest',
  icons: {
    icon: '/spoonassist/icon.png',
    apple: '/spoonassist/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SpoonAssist',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#EFF2DC',
};

export default function SpoonAssistV2Layout({ children }) {
  return (
    <PlanProvider>
      <ThemeProvider>
        {/* Top bar on every breakpoint: a way back to the main site plus the
            SpoonAssist brand logo. Desktop additionally gets the segmented
            nav control (mobile navigation is the fixed bottom tab bar). */}
        <header className="border-b border-[var(--sa-surface-alt)]">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4 lg:px-6 lg:py-5">
            <Link
              href="/"
              aria-label="Back to Seed & Spoon"
              className="flex items-center gap-1.5 text-[15px] font-semibold text-[var(--sa-ink-soft)] spoon-transition hover:text-[var(--sa-ink)]"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3.5 5 8l5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Seed &amp; Spoon</span>
            </Link>
            <Link href="/spoonassist" aria-label="SpoonAssist home">
              <Image src="/spoonassist/logo.png" alt="SpoonAssist" width={512} height={268} priority className="h-12 w-auto lg:h-14" />
            </Link>
            <BottomTabNav variant="desktop" />
          </div>
        </header>

        <div className="mx-auto max-w-[1100px] px-4 pb-28 pt-6 lg:px-6 lg:pb-16 lg:pt-8">
          {children}
        </div>

        {/* Mobile bottom tab bar */}
        <BottomTabNav variant="mobile" />

        <footer className="pb-6 pt-2 text-center lg:pb-10">
          <Link
            href="/"
            className="text-[12px] font-medium text-[var(--sa-ink-soft)] underline-offset-2 hover:underline"
          >
            A Seed &amp; Spoon service
          </Link>
        </footer>
      </ThemeProvider>
    </PlanProvider>
  );
}
