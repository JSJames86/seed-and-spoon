import Header from '../components/Header';
import HeroVideo from '../components/HeroVideo';
import StayConnected from '../components/StayConnected';

export default function Home() {
  return (
    <>
      <Header />   {/* <-- Insert here, always at the top */}
      <main>
        {/* Hero Video - Right under header */}
        <HeroVideo />

        {/* Rest of your current sections */}
        <section className="bg-gradient-to-br from-green-700 to-green-900 py-20 text-white">
          {/* ... existing content ... */}
        </section>

        {/* Light Green Section */}
        <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
          {/* ... existing content ... */}
        </section>

        {/* 3-Step Impact Cycle */}
        <section id="programs" className="py-20 bg-white">
          {/* ... existing content ... */}
        </section>

        {/* Where We're Serving Next */}
        <section className="py-20 bg-gray-50">
          {/* ... existing content ... */}
        </section>

        {/* Donate Section */}
        <section id="donate" className="py-20 bg-white">
          {/* ... existing content ... */}
        </section>

        {/* Essential Resources Wishlist */}
        <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
          {/* ... existing content ... */}
        </section>

        {/* Stay Connected Section */}
        <StayConnected />
      </main>
    </>
  );
}