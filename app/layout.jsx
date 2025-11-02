// app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { Metadata } from "next";
import Head from "next/head";

export const metadata: Metadata = {
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <Head>
        <link rel="preload" as="video" href="/hero.mp4" />
        <link rel="preload" as="image" href="/logo-light.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="min-h-screen bg-white dark:bg-gray-900 antialiased transition-colors duration-300">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg">
          Skip to content
        </a>
        <SmoothScroll />
        <Header />
        <main id="main" className="pt-16 md:pt-20 lg:pt-24">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}