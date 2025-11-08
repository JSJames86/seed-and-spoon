// app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata = {
  title: "Seed & Spoon NJ | Food Sovereignty in Essex County",
  description: "We rescue surplus produce, cook meals, and deliver hope. Join us in fighting food waste and hunger.",
  openGraph: {
    title: "Seed & Spoon NJ",
    description: "From rescue to delivery — every meal makes a difference.",
    url: "https://seedandspoonnj.org",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seed & Spoon NJ",
    description: "Fighting food waste. Feeding families.",
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
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg">
          Skip to content
        </a>
        <SmoothScroll />
        <Header />
        <main id="main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}