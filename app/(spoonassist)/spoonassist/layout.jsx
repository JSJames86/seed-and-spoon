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
        {/* Top bar: desktop gets the full brand + segmented nav control;
            mobile gets a slim bar with just a way back to the main site,
            since the fixed bottom tab nav is SpoonAssist-only navigation. */}
        <header className="border-b border-[var(--sa-surface-alt)]">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
            <Link href="/spoonassist" aria-label="SpoonAssist home" className="hidden lg:block">
              <Image src="/spoonassist/logo.png" alt="SpoonAssist" width={512} height={268} priority className="h-9 w-auto" />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1 text-[13px] font-semibold text-[var(--sa-ink-soft)] lg:hidden"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3.5 5 8l5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Seed &amp; Spoon
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
