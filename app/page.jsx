"use client";

import Header from "../components/Header";
import HeroVideo from "../components/HeroVideo";
import StayConnected from "../components/StayConnected";

export default function Home() {
  return (
    <>
      {/* Transparent Header */}
      <Header />

      {/* Hero Video behind header */}
      <div className="relative z-0 h-screen">
        <HeroVideo />
      </div>

      <main className="pt-0"> {/* Header floats on top, no padding needed */}

        {/* Green Hero Section */}
        <section className="bg-gradient-to-br from-green-700 to-green-900 py-20 text-white">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              We grow food. We serve meals.<br />But mostly, we see people.
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
              Building food sovereignty in Essex County—one family, one meal, one skill at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#gethelp" className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-500 transition-all font-bold text-lg">
                Get Help
              </a>
              <a href="#donate" className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-500 transition-all font-bold text-lg">
                Donate Now
              </a>
              <a href="/volunteer" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-green-900 transition-all font-bold text-lg">
                Volunteer
              </a>
            </div>
          </div>
        </section>

        {/* Light Green Section */}
        <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Bridging the gap between surplus and sustenance.
              </h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                <strong>Seed & Spoon NJ</strong> tackles two critical issues simultaneously: the{' '}
                <span className="text-green-700 font-semibold">widespread waste of beautiful, farm-fresh produce</span>{' '}
                and the{' '}
                <span className="text-orange-600 font-semibold">growing challenge of food insecurity</span>{' '}
                in our community.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We organize local volunteers to rescue these ingredients and prepare them into high-quality, culturally relevant, ready-to-eat meals, delivered directly to distribution partners throughout New Jersey.
              </p>
            </div>
          </div>
        </section>

        {/* 3-Step Impact Cycle */}
        <section id="programs" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
              Our 3-Step Impact Cycle
            </h2>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              From rescue to delivery, every meal makes a difference
            </p>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🍳</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">1. Cook</h3>
                <p className="text-gray-600">
                  Skilled volunteers transform rescued produce into nourishing, chef-designed meals in commercial kitchens.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📦</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">2. Pack</h3>
                <p className="text-gray-600">
                  Meals are packaged individually into eco-friendly containers, labelled, and stored correctly for immediate transport.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">3. Deliver</h3>
                <p className="text-gray-600">
                  Distribution teams run efficient routes, connecting meals with those who need them most at local hubs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Where We're Serving Next */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
              Where We're Serving Next
            </h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  Newark Community Center Meal Service
                </h3>
                <p className="text-gray-600 mb-4">600 Broad St, Newark, NJ 07102</p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span className="mr-2">🕐</span>
                  Next service: Check our social media
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  Trenton Mobile Meal Drop-Off
                </h3>
                <p className="text-gray-600 mb-4">The Old Mill Park Parking Lot, Trenton, NJ 08608</p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span className="mr-2">🕐</span>
                  Next service: Check our social media
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Donate Section */}
        <section id="donate" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">
                Power a Meal: Donate
              </h2>
              <p className="text-center text-xl text-gray-600 mb-12">
                Every dollar helps rescue food, cover cooking costs, and deliver warmth directly to a family in need.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-green-600 mb-2">$25</div>
                  <p className="text-gray-700 font-semibold mb-2">Feed a Family</p>
                  <p className="text-sm text-gray-600">Provides 10 nutritious meals</p>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-green-600 mb-2">$50</div>
                  <p className="text-gray-700 font-semibold mb-2">Stock the Kitchen</p>
                  <p className="text-sm text-gray-600">Covers ingredients for 20 meals</p>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-green-600 mb-2">$100</div>
                  <p className="text-gray-700 font-semibold mb-2">Full Day Impact</p>
                  <p className="text-sm text-gray-600">Sponsors an entire meal service</p>
                </div>
              </div>

              <div className="text-center">
                <button className="bg-green-600 text-white px-12 py-4 rounded-full hover:bg-green-700 transition-all font-bold text-xl shadow-lg hover:shadow-xl">
                  Donate Now
                </button>
                <p className="text-sm text-gray-500 mt-4">Secure payment processing coming soon</p>
              </div>
            </div>
          </div>
        </section>

        {/* Essential Resources Wishlist */}
        <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">
                Essential Resources Wishlist
              </h2>
              <p className="text-center text-xl text-gray-600 mb-12">
                Help stock our kitchens and distribution vans with crucial non-perishable goods and supplies.
              </p>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span className="text-gray-700">Half-size Catering Foil Pans</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span className="text-gray-700">High-quality Bulk Cooking Oil</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span className="text-gray-700">Disposable Nitrile Gloves (L/XL)</span>
                  </li>
                </ul>

                <div className="text-center">
                  <a 
                    href="#" 
                    className="inline-block bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-all font-bold shadow-lg hover:shadow-xl"
                  >
                    View our full Amazon Wishlist →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stay Connected Section */}
        <StayConnected />

      </main>
    </>
  );
}