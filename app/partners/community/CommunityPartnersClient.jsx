'use client';

import Link from 'next/link';
import PartnerInterestForm from '@/components/partners/PartnerInterestForm';
import { PARTNERSHIP_ROLES, PARTNER_PRIVACY_POINTS } from '@/data/partnerships';

// Roles that mostly apply to businesses, shown on the business page instead.
const BUSINESS_ONLY = ['in-kind'];

// ─── Static content ───────────────────────────────────────────────────────────

const WHO_WE_PARTNER_WITH = [
  { icon: '🏫', label: 'K–12 schools' },
  { icon: '🧭', label: 'Social service agencies' },
  { icon: '🎓', label: 'Colleges & universities' },
  { icon: '🏛️', label: 'Municipalities' },
  { icon: '⛪', label: 'Churches & faith communities' },
  { icon: '🏘️', label: 'Community & youth groups' },
];

const RIGHT_NOW = PARTNERSHIP_ROLES.filter((r) => r.status === 'now' && !BUSINESS_ONLY.includes(r.id));
const AS_WE_GROW = PARTNERSHIP_ROLES.filter((r) => r.status === 'growing');

// ─── Page sections ────────────────────────────────────────────────────────────

function RoleItem({ role }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-[#2d5a27] text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
        ✓
      </span>
      <span className="text-gray-700">
        <span className="font-semibold text-gray-900">{role.title}.</span> {role.body}
      </span>
    </li>
  );
}

function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#2d5a27] to-[#1f3f1b] text-white py-20 md:py-28">
      {/* Sentinel observed by Header to detect when hero is in view */}
      <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Become a Community Partner</h1>
        <p className="text-xl text-green-100 leading-relaxed max-w-2xl mx-auto">
          Help us reach Essex County families with the meals, resources, and dignity they deserve.
        </p>
        <a
          href="#intake-form"
          className="inline-block mt-8 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-full transition text-lg"
        >
          Start the Conversation
        </a>
      </div>
    </section>
  );
}

function WhoWePartnerWith() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <header className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Partner With</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            We don&apos;t just feed people, we see them — and that starts with the community
            organizations already rooted in their neighborhoods.
          </p>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {WHO_WE_PARTNER_WITH.map((item) => (
            <div
              key={item.label}
              className="border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3" aria-hidden="true">
                {item.icon}
              </div>
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowWeCanWorkTogether() {
  return (
    <section className="py-20 bg-[#f9f6f0]">
      <div className="container mx-auto px-6 max-w-5xl">
        <header className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Can Work Together</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Start with one clear contribution. If it works well for both of us, we can grow it from there.
          </p>
        </header>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-[#2d5a27] mb-4">Right Now</h3>
            <ul className="space-y-3">
              {RIGHT_NOW.map((role) => (
                <RoleItem key={role.id} role={role} />
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-[#2d5a27] mb-4">As We Grow</h3>
            <ul className="space-y-3">
              {AS_WE_GROW.map((role) => (
                <RoleItem key={role.id} role={role} />
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 bg-white rounded-2xl p-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How we protect families</h3>
          <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
            {PARTNER_PRIVACY_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            Businesses can find sponsorship and employee giving options on our{' '}
            <Link href="/partners/corporate" className="font-semibold text-[#2d5a27] hover:underline">
              business partnerships
            </Link>{' '}
            page.
          </p>
        </div>
      </div>
    </section>
  );
}

function IntakeFormSection() {
  return (
    <section id="intake-form" className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-2xl">
        <header className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tell Us About Your Organization</h2>
          <p className="text-gray-500">
            Fill out the form below and our team will follow up to talk through next steps.
          </p>
        </header>
        <div className="bg-[#f9f6f0] rounded-2xl p-8 sm:p-10">
          <PartnerInterestForm page="partners/community" />
        </div>
      </div>
    </section>
  );
}

export default function CommunityPartnersClient() {
  return (
    <div className="bg-white pt-16 md:pt-20 lg:pt-24">
      <Hero />
      <WhoWePartnerWith />
      <HowWeCanWorkTogether />
      <IntakeFormSection />
    </div>
  );
}
