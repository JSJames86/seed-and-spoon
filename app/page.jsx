import HeroVideo from "../components/HeroVideo";
import StayConnected from "../components/StayConnected";
import Header from "../components/Header";

export default function Home() {
  return (
    <>
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="relative">

        {/* Hero Video - behind header */}
        <section className="relative w-full h-screen -z-10">
          <HeroVideo />
          {/* Optional overlay for contrast */}
          <div className="absolute inset-0 bg-black/20"></div>
        </section>

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
              <a
                href="#gethelp"
                className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-500 transition-all font-bold text-lg"
              >
                Get Help
              </a>
              <a
                href="#donate"
                className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-500 transition-all font-bold text-lg"
              >
                Donate Now
              </a>
              <a
                href="/volunteer"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-green-900 transition-all font-bold text-lg"
              >
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
                <strong>Seed & Spoon NJ</strong> tackles two critical issues simultaneously: the{" "}
                <span className="text-green-700 font-semibold">
                  widespread waste of beautiful, farm-fresh produce
                </span>{" "}
                and the{" "}
                <span className="text-orange-600 font-semibold">
                  growing challenge of food insecurity
                </span>{" "}
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

        {/* Additional sections like "Where We're Serving Next", Donate, Wishlist, Stay Connected */}
        <StayConnected />

      </main>
    </>
  );
}