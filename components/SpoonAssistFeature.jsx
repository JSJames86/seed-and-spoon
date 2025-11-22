"use client";

import Link from "next/link";
import Image from "next/image";

export default function SpoonAssistFeature() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Image/Visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/spoonassist/logo.png"
                alt="SpoonAssist - Compare Grocery Prices"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl">
              <p className="text-sm font-semibold">Save Money on Groceries</p>
              <p className="text-2xl font-bold">Compare Local Prices</p>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
              New Tool
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Introducing <span className="text-green-600">SpoonAssist</span>
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Compare grocery prices across local stores for any recipe. Create smart shopping lists
              and save money on ingredients while eating healthy.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Price Comparison</h3>
                  <p className="text-gray-600">See which stores offer the best prices for your ingredients</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Shopping Lists</h3>
                  <p className="text-gray-600">Generate and export shopping lists optimized for savings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dietary Preferences</h3>
                  <p className="text-gray-600">Filter by gluten-free, vegan, low-carb, and diabetic options</p>
                </div>
              </div>
            </div>

            <Link
              href="/spoonassist"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Try SpoonAssist Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
