// app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CookieBanner from "@/components/CookieBanner";
import CookieSettingsModal from "@/components/CookieSettingsModal";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import { AuthProvider } from "@/contexts/AuthContext";
import { Libre_Franklin, Roboto_Slab, Crimson_Text } from 'next/font/google';

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

export const metadata = {
  title: "Seed & Spoon NJ | Neighbors Feeding Neighbors in Essex County",
  description:
    "Seed & Spoon NJ rescues surplus food, partners with community pantries, cooks prepared meals, and leads food & financial skills workshops to build long-term food security in Essex County.",
  openGraph: {
    title: "Seed & Spoon NJ | Neighbors Feeding Neighbors",
    description:
      "From surplus rescue and pantry partners to prepared meals and skills workshops, Seed & Spoon NJ is building a community-powered food safety net in Essex County.",
    url: "https://seedandspoonnj.org", // update to your live domain if different
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seed & Spoon NJ | Neighbors Feeding Neighbors",
    description:
      "Fighting food waste, feeding families, and teaching long-term food stability across Essex County.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// iOS safe area and viewport configuration
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // Enable safe-area-inset support for iOS
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${libreFranklin.variable} ${robotoSlab.variable} ${crimsonText.variable} font-sans min-h-screen antialiased transition-colors duration-300`}>
        <AuthProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[var(--green-primary)] text-white px-4 py-2 rounded-lg body-sm font-bold"
          >
            Skip to content
          </a>
          <SmoothScroll />
          <Header />
          <main id="main">{children}</main>
          <Footer />

          {/* GDPR/CCPA Cookie Consent System */}
          <CookieBanner />
          <CookieSettingsModal />

          {/* Analytics - Loads only after consent */}
          <AnalyticsLoader />
        </AuthProvider>
      </body>
    </html>
  );
}