export const metadata = {
  title: 'Corporate Partnerships – Seed & Spoon',
  description:
    'Partner with Seed & Spoon to fight youth food insecurity in New Jersey. Explore corporate giving, employee engagement, and federal grant opportunities.',
  openGraph: {
    title: 'Corporate Partnerships – Seed & Spoon',
    description:
      'Partner with Seed & Spoon to fight youth food insecurity in New Jersey. Explore corporate giving, employee engagement, and federal grant opportunities.',
    url: 'https://seedandspoon.org/partners/corporate',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
};

export default function CorporatePartnersPage() {
  return (
    <div className="bg-white pt-16 md:pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#2d5a27] to-[#1f3f1b] text-white py-20 md:py-28">
        {/* Sentinel observed by Header to detect when hero is in view */}
        <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Partner With Seed & Spoon
          </h1>
          <p className="text-xl text-green-100 leading-relaxed max-w-2xl mx-auto">
            Together we can ensure every child in New Jersey has access to nutritious food.
            Corporate partnerships amplify our reach, deepen our impact, and strengthen communities.
          </p>
        </div>
      </section>

      {/* Partnership tiers */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <header className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ways to Partner</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Whether you&apos;re a small business or a national brand, there&apos;s a partnership model
              that fits your goals and capacity.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Corporate Giving',
                icon: '💚',
                description:
                  'Make a direct financial contribution to fund meals, kitchen operations, and delivery logistics. Receive full tax documentation and impact reports.',
                cta: 'Donate as a Business',
                href: '/donate',
              },
              {
                title: 'Employee Engagement',
                icon: '🤝',
                description:
                  'Bring your team to our kitchens and distribution events. Volunteer days, team-building, and skills-based volunteering all available.',
                cta: 'Plan a Volunteer Day',
                href: '/contact?subject=volunteer-day',
              },
              {
                title: 'In-Kind Donations',
                icon: '📦',
                description:
                  'Donate surplus food, packaging materials, equipment, or professional services. We handle logistics and provide donation receipts.',
                cta: 'Discuss In-Kind Giving',
                href: '/contact?subject=in-kind',
              },
            ].map((tier) => (
              <div
                key={tier.title}
                className="border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{tier.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{tier.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{tier.description}</p>
                <a
                  href={tier.href}
                  className="text-sm font-semibold text-[#2d5a27] hover:underline"
                >
                  {tier.cta} →
                </a>
              </div>
            ))}
          </div>
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
                  <li className="text-sm text-gray-600">✓ Nonprofit Organization — 501(c)(3) Pending</li>
                  <li className="text-sm text-gray-600">✓ Registered New Jersey Charity — Pending</li>
                </ul>
              </div>
            </div>

            <a
              href="/documents/capability-statement.pdf"
              download
              className="inline-flex items-center gap-2 bg-[#2d5a27] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#1f3f1b] transition"
            >
              ↓ Download Capability Statement (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make an Impact?</h2>
          <p className="text-gray-500 mb-8">
            Reach out to discuss how your organization can partner with Seed &amp; Spoon.
            We&apos;ll tailor a plan that meets your CSR goals and drives real community change.
          </p>
          <a
            href="/contact?subject=corporate-partnership"
            className="inline-flex items-center gap-2 bg-[#2d5a27] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#1f3f1b] transition"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
