import { CAPABILITY_STATEMENT_PATH, ORG_TAX_STATUS, NJ_CHARITY_REG_NO } from '@/lib/org';
import PartnerInterestForm from '@/components/partners/PartnerInterestForm';
import { campaignDonateHref } from '@/data/campaignShared';
import { FIVE_LOAVES_SLUG, KIT_COST, TOTAL_KITS } from '@/data/fiveLoavesCampaign';
import {
  SMALL_BUSINESS_IDEAS,
  CORPORATE_CHANNELS,
  SPONSOR_RECOGNITION,
  PARTNER_PRIVACY_POINTS,
} from '@/data/partnerships';

const DESCRIPTION =
  'Sponsor weekend meals for Newark children, host a give-back event, match employee gifts, or donate goods and services. Business partnerships with Seed & Spoon.';

export const metadata = {
  title: 'Business & Corporate Partners – Seed & Spoon',
  description: DESCRIPTION,
  openGraph: {
    title: 'Business & Corporate Partners – Seed & Spoon',
    description: DESCRIPTION,
    url: 'https://seedandspoon.org/partners/corporate',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
};

const CHILDREN = 25;
const WEEKENDS = TOTAL_KITS / CHILDREN;

// Sponsorship menu, priced from the 5 Loaves kit cost so it stays in step with the campaign.
const SPONSOR_LEVELS = [
  { amount: KIT_COST, label: 'One child’s weekend', note: 'Eight prepared meals and five snacks' },
  { amount: KIT_COST * 5, label: 'One child for five weekends', note: 'A third of the pilot for one child' },
  { amount: KIT_COST * WEEKENDS, label: 'One child for the whole pilot', note: `All ${WEEKENDS} weekends` },
  { amount: KIT_COST * CHILDREN, label: 'A weekend for every child', note: `Every kit for one Friday, all ${CHILDREN} children` },
].map((level) => ({
  ...level,
  href: campaignDonateHref(FIVE_LOAVES_SLUG, level.amount, { source: 'business_partners' }),
}));

const usd = (n) => `$${n.toLocaleString('en-US')}`;

function CardGrid({ items }) {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {items.map((item) => (
        <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export default function CorporatePartnersPage() {
  return (
    <div className="bg-white pt-16 md:pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#2d5a27] to-[#1f3f1b] text-white py-20 md:py-28">
        {/* Sentinel observed by Header to detect when hero is in view */}
        <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-200 mb-4">
            Business &amp; Corporate Partners
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Put your business behind Newark kids’ weekend meals
          </h1>
          <p className="text-xl text-green-100 leading-relaxed max-w-2xl mx-auto">
            {usd(KIT_COST)} covers the food in one child’s weekend kit. Whether you run a corner shop or a
            national company, there’s a clear way to help.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#sponsor"
              className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-full transition text-lg"
            >
              Sponsor Meals
            </a>
            <a
              href="#interest-form"
              className="inline-block border border-white/40 hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-full transition text-lg"
            >
              Start a Conversation
            </a>
          </div>
        </div>
      </section>

      {/* Sponsorship menu */}
      <section id="sponsor" className="py-20 bg-white scroll-mt-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sponsor the 5 Loaves pilot</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every level funds food for real weekend meal kits. Gifts go to the 5 Loaves campaign and are
              tax-deductible as allowed by law.
            </p>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPONSOR_LEVELS.map((level) => (
              <a
                key={level.amount}
                href={level.href}
                className="group flex flex-col rounded-2xl border border-gray-200 p-6 hover:border-[#2d5a27] hover:shadow-lg transition"
              >
                <span className="text-3xl font-bold text-[#2d5a27] mb-2">{usd(level.amount)}</span>
                <span className="font-semibold text-gray-900">{level.label}</span>
                <span className="text-sm text-gray-500 mt-1 flex-1">{level.note}</span>
                <span className="mt-4 text-sm font-semibold text-[#2d5a27] group-hover:underline">Sponsor →</span>
              </a>
            ))}
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#f9f6f0] p-6">
              <h3 className="font-semibold text-gray-900 mb-3">How we thank sponsors</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {SPONSOR_RECOGNITION.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#2d5a27]" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-[#f9f6f0] p-6">
              <h3 className="font-semibold text-gray-900 mb-3">What we never share</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {PARTNER_PRIVACY_POINTS.filter((_, i) => i !== 1).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#2d5a27]" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Small business */}
      <section className="py-20 bg-[#f9f6f0]">
        <div className="container mx-auto px-6 max-w-5xl">
          <header className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">For small businesses</h2>
            <p className="text-gray-600 max-w-2xl">
              Local businesses can say yes quickly, and your customers want to help too. Pick one idea to start.
            </p>
          </header>
          <CardGrid items={SMALL_BUSINESS_IDEAS} />
        </div>
      </section>

      {/* Corporations */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <header className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">For corporations</h2>
            <p className="text-gray-600 max-w-2xl">
              We’ll match your giving program, employee engagement goals, or grant cycle to a defined need in
              the pilot.
            </p>
          </header>
          <CardGrid items={CORPORATE_CHANNELS} />
        </div>
      </section>

      {/* Federal & Grant Credentials */}
      <section className="py-20 bg-[#f9f6f0]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-[#f9f6f0] rounded-2xl">
            <h2 className="text-2xl font-semibold text-[#2d5a27] mb-2">
              Federal &amp; Grant Credentials
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Seed &amp; Spoon is a SAM.gov registered organization eligible for federal awards,
              grants, and partnerships. Our registration is active through April 30, 2027.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">UEI</p>
                <p className="font-mono font-semibold text-gray-800">JZQRPU1GRRM6</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">CAGE Code</p>
                <p className="font-mono font-semibold text-gray-800">207U1</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">DUNS</p>
                <p className="font-mono font-semibold text-gray-800">14-376-5630</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">SAM.gov Status</p>
                <p className="font-semibold text-[#2d5a27]">Active ✓</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  NAICS Codes
                </h3>
                <ul className="space-y-1">
                  <li className="text-sm text-gray-600">
                    <span className="font-mono text-gray-800">624210</span> — Community Food Services
                  </li>
                  <li className="text-sm text-gray-600">
                    <span className="font-mono text-gray-800">624110</span> — Child and Youth Services
                  </li>
                  <li className="text-sm text-gray-600">
                    <span className="font-mono text-gray-800">813319</span> — Other Social Advocacy Organizations
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Certifications
                </h3>
                <ul className="space-y-1">
                  <li className="text-sm text-gray-600">✓ Woman-Owned Organization</li>
                  <li className="text-sm text-gray-600">✓ Nonprofit Organization — {ORG_TAX_STATUS}</li>
                  <li className="text-sm text-gray-600">✓ Registered New Jersey Charity — Reg. No. {NJ_CHARITY_REG_NO}</li>
                </ul>
              </div>
            </div>

            <a
              href={CAPABILITY_STATEMENT_PATH}
              download
              className="inline-flex items-center gap-2 bg-[#2d5a27] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#1f3f1b] transition"
            >
              ↓ Download Capability Statement (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* Interest form */}
      <section id="interest-form" className="py-20 bg-white scroll-mt-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to talk?</h2>
            <p className="text-gray-600">
              Tell us what you’d like to offer and we’ll follow up to shape a plan that fits your business.
            </p>
          </header>
          <div className="bg-[#f9f6f0] rounded-2xl p-8 sm:p-10">
            <PartnerInterestForm page="partners/corporate" defaultType="Small business" />
          </div>
        </div>
      </section>
    </div>
  );
}
