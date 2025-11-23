/**
 * Get Help Page
 *
 * Main page for food assistance with client/referral forms,
 * interactive map, and resource directory
 */

'use client';

import { useState, useRef } from 'react';
import ClientIntakeForm from '@/components/get-help/ClientIntakeForm';
import ReferralIntakeForm from '@/components/get-help/ReferralIntakeForm';
import ResourceMap from '@/components/get-help/ResourceMap';
import CountyDirectory from '@/components/get-help/CountyDirectory';
import ProviderSubmissionModal from '@/components/get-help/ProviderSubmissionModal';

export default function GetHelpPage() {
  const [activeForm, setActiveForm] = useState('client'); // 'client' | 'referral'
  const [mapFilters, setMapFilters] = useState({});
  const [selectedResource, setSelectedResource] = useState(null);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Refs for smooth scrolling
  const clientFormRef = useRef(null);
  const referralFormRef = useRef(null);
  const mapRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResourceSelect = (resource) => {
    setSelectedResource(resource);
    // Could also center map on this resource
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-700 to-green-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get Help with Food
          </h1>
          <p className="text-xl md:text-2xl text-green-50 mb-12">
            Apply for assistance, refer a client, or find local pantries
          </p>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <button
              onClick={() => {
                setActiveForm('client');
                scrollToSection(clientFormRef);
              }}
              className="px-6 py-4 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <span className="text-2xl mb-2 block">🙋</span>
              I need food assistance
            </button>

            <button
              onClick={() => {
                setActiveForm('referral');
                scrollToSection(referralFormRef);
              }}
              className="px-6 py-4 bg-white text-blue-800 rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <span className="text-2xl mb-2 block">🤝</span>
              I'm referring someone
            </button>

            <button
              onClick={() => setIsProviderModalOpen(true)}
              className="px-6 py-4 bg-white text-purple-800 rounded-lg hover:bg-purple-50 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <span className="text-2xl mb-2 block">🏪</span>
              I provide food resources
            </button>
          </div>

          {/* Quick Link to Map */}
          <div className="mt-8">
            <button
              onClick={() => scrollToSection(mapRef)}
              className="text-green-50 hover:text-white underline underline-offset-4 text-lg"
            >
              or browse food resources near you →
            </button>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {/* Form Toggle */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex border-b-2 border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveForm('client')}
                className={`flex-1 px-6 py-4 font-semibold text-lg transition-colors ${
                  activeForm === 'client'
                    ? 'border-b-4 border-green-700 text-green-700 -mb-0.5'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Client Application
              </button>
              <button
                onClick={() => setActiveForm('referral')}
                className={`flex-1 px-6 py-4 font-semibold text-lg transition-colors ${
                  activeForm === 'referral'
                    ? 'border-b-4 border-blue-700 text-blue-700 -mb-0.5'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Partner Referral
              </button>
            </div>
          </div>

          {/* Client Form */}
          <div
            ref={clientFormRef}
            id="client-form"
            className={activeForm === 'client' ? 'block' : 'hidden'}
          >
            <div className="max-w-3xl mx-auto mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Apply for Food Assistance
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Complete this form and we'll connect you with food resources that meet your needs.
                We'll contact you within 48 hours.
              </p>
            </div>
            <ClientIntakeForm
              onSuccess={() => {
                // Could show success state or redirect
              }}
              onScrollToMap={() => scrollToSection(mapRef)}
            />
          </div>

          {/* Referral Form */}
          <div
            ref={referralFormRef}
            id="referral-form"
            className={activeForm === 'referral' ? 'block' : 'hidden'}
          >
            <div className="max-w-3xl mx-auto mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Refer a Client for Food Assistance
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Partner organizations can use this form to refer clients to our food assistance program.
              </p>
            </div>
            <ReferralIntakeForm
              onSuccess={() => {
                // Could show success state
              }}
            />
          </div>
        </div>
      </section>

      {/* Map & Directory Section */}
      <section ref={mapRef} id="resources" className="py-16 md:py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Food Resources Near You
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Search our directory of food pantries, meal sites, and community fridges across New Jersey.
            </p>
          </div>

          {/* Desktop: Side-by-side | Mobile: Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Map (larger on desktop) */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <ResourceMap
                filters={mapFilters}
                onFilterChange={setMapFilters}
                selectedResource={selectedResource}
                onResourceSelect={handleResourceSelect}
              />
            </div>

            {/* Directory (smaller on desktop) */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <CountyDirectory
                filters={mapFilters}
                onResourceClick={handleResourceSelect}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Provider CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Are You a Food Provider?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            If you provide food assistance and want to be listed in our directory,
            we'd love to hear from you.
          </p>
          <button
            onClick={() => setIsProviderModalOpen(true)}
            className="px-8 py-4 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all"
          >
            Request to Be Listed
          </button>
        </div>
      </section>

      {/* Helpful Resources Section */}
      <section className="py-16 bg-green-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Helpful Resources
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Tools and information to help you make the most of available food resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recipes Card */}
            <a
              href="/recipes"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">🍳</div>
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">
                Healthy Recipes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Browse our collection of nutritious, budget-friendly recipes using common pantry ingredients.
              </p>
              <div className="mt-4 text-green-700 dark:text-green-400 font-semibold text-sm">
                View Recipes →
              </div>
            </a>

            {/* SpoonAssist Card */}
            <a
              href="/spoonassist"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">
                SpoonAssist AI
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get instant answers about food assistance, eligibility, and resources using our AI assistant.
              </p>
              <div className="mt-4 text-green-700 dark:text-green-400 font-semibold text-sm">
                Chat with SpoonAssist →
              </div>
            </a>

            {/* Blog Card */}
            <a
              href="/blog"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">
                Blog & Tips
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Read articles about nutrition, food storage, meal planning, and making the most of your resources.
              </p>
              <div className="mt-4 text-green-700 dark:text-green-400 font-semibold text-sm">
                Read Blog →
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Privacy & Support Section */}
      <section className="py-12 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                Your Privacy Matters
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All information you provide is confidential and will only be used to connect you
                with food resources. We never sell or share your personal information.
                <a href="/legal/privacy-policy" className="text-green-700 hover:underline ml-1">
                  Read our Privacy Policy →
                </a>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                Need Help Right Away?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                If you need immediate food assistance:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Call <a href="tel:2-1-1" className="text-green-700 hover:underline">2-1-1</a> to find local resources</li>
                <li>• Visit <a href="https://www.feedingamerica.org/find-your-local-foodbank" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Feeding America's Food Bank Locator</a></li>
                <li>• Browse our map above to find resources near you</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Submission Modal */}
      <ProviderSubmissionModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
      />
    </main>
  );
}
