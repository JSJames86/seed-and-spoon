// app/layout.jsx
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import SmoothScroll from "@/components/SmoothScroll";
import CookieBanner from "@/components/CookieBanner";
import CookieSettingsModal from "@/components/CookieSettingsModal";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import Providers from "@/components/Providers";
import { SubscribePopupTrigger } from "@/components/email/SubscribeModal";
import { Libre_Franklin, Roboto_Slab, Crimson_Text, Fraunces, Hanken_Grotesk } from 'next/font/google';
import { SOCIAL_LINKS } from "@/data/socialLinks";

const libreFranklin = Libre_Franklin({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-libre-franklin',
  display: 'swap',
});

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-roboto-slab',
  display: 'swap',
});

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-crimson-text',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-fraunces',
  display: 'swap',
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-hanken-grotesk',
  display: 'swap',
});

export const metadata = {
  title: {
    default: "Seed & Spoon | Fighting Youth Hunger in Newark, NJ",
    template: "%s | Seed & Spoon",
  },
  description:
    "Seed & Spoon is a Newark-based nonprofit serving Essex County with community meal donations, monthly meal boxes, and youth gardening programs.",
  metadataBase: new URL("https://seedandspoon.org"),
  openGraph: {
    siteName: "Seed & Spoon",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seed & Spoon NJ | Neighbors Feeding Neighbors",
    description:
      "Fighting food waste, feeding families, and teaching long-term food stability across Essex County.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    // Preload hero image to improve LCP on homepage
    "link-preload-hero": "<link rel=\"preload\" as=\"image\" href=\"/media/hero/hero-bg.jpg\" fetchpriority=\"high\">",
  },
};

// iOS safe area and viewport configuration
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // Enable safe-area-inset support for iOS
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NonprofitOrganization",
  name: "Seed & Spoon",
  url: "https://seedandspoon.org",
  logo: "https://seedandspoon.org/logo.png",
  description:
    "A Newark-based nonprofit serving Essex County — reducing youth hunger through community meal donations, monthly meal box subscriptions, and youth gardening programs.",
  areaServed: "Essex County, NJ",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Newark",
    addressRegion: "NJ",
    addressCountry: "US",
  },
  knowsAbout: ["food insecurity", "youth hunger", "community meal programs", "urban gardening"],
  sameAs: SOCIAL_LINKS.map((social) => social.url),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${libreFranklin.variable} ${robotoSlab.variable} ${crimsonText.variable} ${fraunces.variable} ${hankenGrotesk.variable} font-sans min-h-screen antialiased transition-colors duration-300`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[var(--green-primary)] text-white px-4 py-2 rounded-lg body-sm font-bold"
          >
            Skip to content
          </a>
          <SmoothScroll />
          <SiteChrome>{children}</SiteChrome>

          {/* GDPR/CCPA Cookie Consent System */}
          <CookieBanner />
          <CookieSettingsModal />

          {/* Analytics - Loads only after consent */}
          <AnalyticsLoader />

          {/* Email subscription popup */}
          <SubscribePopupTrigger />
        </Providers>
      </body>
    </html>
  );
}