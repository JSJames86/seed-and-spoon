import Link from 'next/link';
import PartnerInterestForm from '@/components/partners/PartnerInterestForm';
import {
  PARTNERSHIP_ROLES,
  PARTNER_AUDIENCES,
  PARTNER_PROCESS,
  PARTNER_PRIVACY_POINTS,
} from '@/data/partnerships';
import { KIT_COST, START_THRESHOLD } from '@/data/fiveLoavesCampaign';

const DESCRIPTION =
  'Partner with Seed & Spoon to feed Newark children. Choose one clear role, from funding weekend meals to hosting a pickup site or a student research project.';

export const metadata = {
  title: 'Partner With Us – Seed & Spoon',
  description: DESCRIPTION,
  alternates: { canonical: 'https://seedandspoon.org/partners' },
  openGraph: {
    title: 'Partner With Us – Seed & Spoon',
    description: DESCRIPTION,
    url: 'https://seedandspoon.org/partners',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
};

const ROLES_NOW = PARTNERSHIP_ROLES.filter((r) => r.status === 'now');
const ROLES_GROWING = PARTNERSHIP_ROLES.filter((r) => r.status === 'growing');

const PILOT_FACTS = [
  { value: 'Up to 25', label: 'children, about 15 families' },
  { value: '15', label: 'weekends of prepared meals' },
  { value: `$${KIT_COST}`, label: 'covers the food in one child’s weekend kit' },
  { value: `${Math.round(START_THRESHOLD * 100)}%`, label: 'of the goal raised and the pilot begins' },
];

export default function PartnersHubPage() {
  return (
    <div className="bg-white pt-16 md:pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#2d5a27] to-[#1f3f1b] text-white py-20 md:py-28">
        {/* Sentinel observed by Header to detect when hero is in view */}
        <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-200 mb-4">Partner With Us</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            One clear role. Real meals for Newark kids.
          </h1>
          <p className="text-xl text-green-100 leading-relaxed max-w-2xl mx-auto">
            Every partnership starts with one contribution that fits what your organization does well.
            If it works for both of us, we grow it together.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#interest-form"
              className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-full transition text-lg"
            >
              Tell Us How You’d Like to Help
            </a>
            <a
              href="#find-your-path"
              className="inline-block border border-white/40 hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-full transition text-lg"
            >
              Find Your Path
            </a>
          </div>
        </div>
      </section>

      {/* What we're doing now */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What partners help make possible</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our first program, the 5 Loaves pilot, sends Newark children home each Friday with a weekend
              of prepared meals and snacks. It begins once the food goal is mostly funded, which is why
              funding partners matter most right now.
            </p>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PILOT_FACTS.map((fact) => (
              <div key={fact.label} className="rounded-2xl bg-[#f9f6f0] p-6 text-center">
                <p className="text-3xl font-bold text-[#2d5a27] mb-1">{fact.value}</p>
                <p className="text-sm text-gray-600">{fact.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8">
            <Link href="/campaigns/five-loaves" className="font-semibold text-[#2d5a27] hover:underline">
              See the 5 Loaves campaign →
            </Link>
          </p>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-[#f9f6f0]">
        <div className="container mx-auto px-6 max-w-5xl">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ways to partner</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Any organization can take on any role. Start with the one that fits your people and resources.
            </p>
          </header>

          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#2d5a27] mb-4">Open now</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {ROLES_NOW.map((role) => (
              <div key={role.id} className="bg-white rounded-2xl p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{role.body}</p>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">As we grow</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES_GROWING.map((role) => (
              <div key={role.id} className="rounded-2xl p-6 border border-dashed border-gray-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{role.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{role.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience paths */}
      <section id="find-your-path" className="py-20 bg-white scroll-mt-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find your path</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A good first step for each kind of organization.</p>
          </header>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PARTNER_AUDIENCES.map((audience) => (
              <div
                key={audience.id}
                className="flex flex-col border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{audience.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">{audience.firstStep}</p>
                <Link href={audience.href} className="text-sm font-semibold text-[#2d5a27] hover:underline">
                  {audience.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process + privacy */}
      <section className="py-20 bg-[#f9f6f0]">
        <div className="container mx-auto px-6 max-w-5xl grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What happens next</h2>
            <ol className="space-y-6">
              {PARTNER_PROCESS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#2d5a27] text-white font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100 self-start">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How we protect families</h2>
            <ul className="space-y-3">
              {PARTNER_PRIVACY_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-[#2d5a27] flex-shrink-0" aria-hidden="true">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="interest-form" className="py-20 bg-white scroll-mt-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tell us how you’d like to contribute</h2>
            <p className="text-gray-600">
              This helps us see what fits before we schedule a conversation.
            </p>
          </header>
          <div className="bg-[#f9f6f0] rounded-2xl p-8 sm:p-10">
            <PartnerInterestForm page="partners" />
          </div>
        </div>
      </section>
    </div>
  );
}
