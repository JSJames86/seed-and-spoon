'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import BottomTabNav from '@/components/spoonassist/BottomTabNav';

const TAB_ROOTS = ['/spoonassist', '/spoonassist/recipes', '/spoonassist/plan', '/spoonassist/list', '/spoonassist/profile'];

function BackChevron() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => router.back()}
      className="-ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center text-[var(--sa-ink-soft)] spoon-transition hover:text-[var(--sa-ink)]"
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 3.5 5 8l5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// Sticky app bar (spec §1): back chevron (sub-pages only) + logo/wordmark on
// the left, the desktop tab pill in the middle, and a plain link back to the
// main site on the right. The mobile tab bar is a separate fixed footer
// (BottomTabNav variant="mobile", mounted once in layout.jsx) so it isn't
// duplicated here.
export default function AppHeader() {
  const pathname = usePathname();
  const isSubPage = !TAB_ROOTS.includes(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--sa-surface-alt)] bg-[var(--sa-surface)] shadow-[0_1px_0_rgb(69_71_36_/_0.04)]">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-2 lg:px-6 lg:py-3">
        <div className="flex min-w-0 items-center gap-1">
          {isSubPage && <BackChevron />}
          <Link
            href="/spoonassist"
            aria-label="SpoonAssist home"
            className="flex h-11 min-w-11 items-center"
          >
            <Image src="/spoonassist/logo.png" alt="SpoonAssist" width={512} height={268} priority className="h-7 w-auto lg:h-8" />
          </Link>
        </div>

        <BottomTabNav variant="desktop" />

        <Link
          href="/"
          className="flex h-11 shrink-0 items-center gap-1 text-[13px] font-semibold text-[var(--sa-ink-soft)] spoon-transition hover:text-[var(--sa-ink)]"
        >
          Seed &amp; Spoon
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3.5h6.5v6.5M12.5 3.5 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
