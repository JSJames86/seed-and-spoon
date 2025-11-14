// app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CookieBanner from "@/components/CookieBanner";
import CookieSettingsModal from "@/components/CookieSettingsModal";
import AnalyticsLoader from "@/components/AnalyticsLoader";

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
      <body className="min-h-screen antialiased transition-colors duration-300">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg"
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
      </body>
    </html>
  );
}