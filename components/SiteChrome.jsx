'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// The SpoonAssist v2 app shell (app/(spoonassist)/spoonassist/**) renders its
// own layout — bottom tab nav, no nonprofit chrome — per the SpoonAssist v2
// spec. `/spoonassist/classic` (the pre-v2 wizard) keeps the site chrome it
// was built with. A full Next.js multi-root-layout split would require every
// existing route to move under its own route group, so this pathname check
// is the low-risk way to carve out just the v2 shell.
function isSpoonAssistV2(pathname) {
  if (!pathname) return false;
  if (pathname === '/spoonassist') return true;
  return pathname.startsWith('/spoonassist/') && !pathname.startsWith('/spoonassist/classic');
}

// /links is a standalone link-in-bio hub with its own header (logo + tagline)
// and no destination for site nav/footer to usefully point back into.
function isLinksHub(pathname) {
  return pathname === '/links';
}

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const hideChrome = isSpoonAssistV2(pathname) || isLinksHub(pathname);

  if (hideChrome) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
