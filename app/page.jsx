import HeroVideo from '../components/HeroVideo';
import StayConnected from '../components/StayConnected';

export default function Home() {
  return (
    <main>
      {/* Hero Video - Right under header */}
      <HeroVideo />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 py-12 sm:py-16 md:py-20 lg:py-24 text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            We grow food. We serve meals.<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>But mostly, we see people.
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            Building food sovereignty in Essex County—one family, one meal, one skill at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-2xl mx-auto">
            <a href="#gethelp" className="w-full sm:w-auto bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-green-500 transition-all font-bold text-base sm:text-lg shadow-lg hover:shadow-xl">
              Get Help
            </a>
            <a href="#donate" className="w-full sm:w-auto bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-orange-500 transition-all font-bold text-base sm:text-lg shadow-lg hover:shadow-xl">
              Donate Now
            </a>
            <a href="#volunteer" className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-white hover:text-green-900 transition-all font-bold text-base sm:text-lg">
              Volunteer
            </a>
          </div>
        </div>
      </section>

      {/* Light Green Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-12 sm:py-16 md:py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
              Bridging the gap between surplus and sustenance.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-4 sm:mb-6">
              <strong>Seed & Spoon NJ</strong> tackles two critical issues simultaneously: the{' '}
              <span className="text-green-700 font-semibold">widespread waste of beautiful, farm-fresh produce</span>{' '}
              and the{' '}
              <span className="text-orange-600 font-semibold">growing challenge of food insecurity</span>{' '}
              in our community.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              We organize local volunteers to rescue these ingredients and prepare them into high-quality, culturally relevant, ready-to-eat meals, delivered directly to distribution partners throughout New Jersey.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Impact Cycle */}
      <section id="programs" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-800">
            Our 3-Step Impact Cycle
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-10 sm:mb-12 md:mb-16 max-w-2xl mx-auto">
            From rescue to delivery, every meal makes a difference
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            <div className="text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl" aria-hidden="true">🍳</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">1. Cook</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Skilled volunteers transform rescued produce into nourishing, chef-designed meals in commercial kitchens.
              </p>
            </div>

            <div className="text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl" aria-hidden="true">📦</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">2. Pack</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Meals are packaged individually into eco-friendly containers, labelled, and stored correctly for immediate transport.
              </p>
            </div>

            <div className="text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl" aria-hidden="true">🚚</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">3. Deliver</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Distribution teams run efficient routes, connecting meals with those who need them most at local hubs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where We're Serving Next */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-12 md:mb-16 text-gray-800">
            Where We're Serving Next
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <article className="bg-white rounded-lg shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-gray-800">
                Newark Community Center Meal Service
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">600 Broad St, Newark, NJ 07102</p>
              <div className="flex items-center text-green-600 font-semibold text-sm sm:text-base">
                <span className="mr-2" aria-hidden="true">🕐</span>
                Next service: Check our social media
              </div>
            </article>

            <article className="bg-white rounded-lg shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-gray-800">
                Trenton Mobile Meal Drop-Off
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">The Old Mill Park Parking Lot, Trenton, NJ 08608</p>
              <div className="flex items-center text-green-600 font-semibold text-sm sm:text-base">
                <span className="mr-2" aria-hidden="true">🕐</span>
                Next service: Check our social media
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Donate Section */}
      <section id="donate" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
              Power a Meal: Donate
            </h2>
            <p className="text-center text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 md:mb-12">
              Every dollar helps rescue food, cover cooking costs, and deliver warmth directly to a family in need.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">$25</div>
                <p className="text-base sm:text-lg text-gray-700 font-semibold mb-2">Feed a Family</p>
                <p className="text-xs sm:text-sm text-gray-600">Provides 10 nutritious meals</p>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">$50</div>
                <p className="text-base sm:text-lg text-gray-700 font-semibold mb-2">Stock the Kitchen</p>
                <p className="text-xs sm:text-sm text-gray-600">Covers ingredients for 20 meals</p>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">$100</div>
                <p className="text-base sm:text-lg text-gray-700 font-semibold mb-2">Full Day Impact</p>
                <p className="text-xs sm:text-sm text-gray-600">Sponsors an entire meal service</p>
              </div>
            </div>

            <div className="text-center">
              <button className="w-full sm:w-auto bg-green-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full hover:bg-green-700 transition-all font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl">
                Donate Now
              </button>
              <p className="text-xs sm:text-sm text-gray-500 mt-4">Secure payment processing coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Resources Wishlist */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
              Essential Resources Wishlist
            </h2>
            <p className="text-center text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 md:mb-12">
              Help stock our kitchens and distribution vans with crucial non-perishable goods and supplies.
            </p>

            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 text-lg sm:text-xl flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-sm sm:text-base text-gray-700">Half-size Catering Foil Pans</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 text-lg sm:text-xl flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-sm sm:text-base text-gray-700">High-quality Bulk Cooking Oil</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 text-lg sm:text-xl flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-sm sm:text-base text-gray-700">Disposable Nitrile Gloves (L/XL)</span>
                </li>
              </ul>

              <div className="text-center">
                <a
                  href="#"
                  className="inline-block w-full sm:w-auto bg-orange-500 text-white px-6 sm:px-8 py-3 rounded-full hover:bg-orange-600 transition-all font-bold text-sm sm:text-base shadow-lg hover:shadow-xl"
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
  );
}
