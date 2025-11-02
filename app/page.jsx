"use client";

import Header from "../components/Header";
import HeroVideo from "../components/HeroVideo";
import StayConnected from "../components/StayConnected";

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero video behind header */}
      <div className="relative z-0">
        <HeroVideo />
      </div>

      <main className="pt-0"> {/* Header floats on top, no padding needed */}
        {/* Green Hero Section */}
        <section className="bg-gradient-to-br from-green-700 to-green-900 py-20 text-white">
          {/* ... your content */}
        </section>

        {/* Rest of your sections */}
        {/* Light Green Section, 3-Step Impact Cycle, Locations, Donate, Wishlist, StayConnected */}
      </main>
    </>
  );
}