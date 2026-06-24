export const metadata = {
  title: 'Press & Media Kit – Seed & Spoon',
  description:
    'Media resources, brand assets, organizational credentials, and press contacts for Seed & Spoon — New Jersey\'s youth food insecurity nonprofit.',
  openGraph: {
    title: 'Press & Media Kit – Seed & Spoon',
    description:
      'Media resources, brand assets, organizational credentials, and press contacts for Seed & Spoon.',
    url: 'https://seedandspoon.org/press',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
};

const pressContacts = [
  {
    role: 'General Media Inquiries',
    email: 'hello@seedandspoon.org',
  },
  {
    role: 'Partnership & Grants',
    email: 'hello@seedandspoon.org',
  },
];

const quickFacts = [
  { label: 'Founded', value: '2026' },
  { label: 'Location', value: 'Newark, New Jersey' },
  { label: 'Structure', value: 'Nonprofit — 501(c)(3) Pending' },
  { label: 'Focus Area', value: 'Youth Food Insecurity' },
  { label: 'Phone', value: '1 (732) 707-1769' },
  { label: 'Website', value: 'seedandspoon.org' },
];

export default function PressPage() {
  return (
    <main className="bg-white pt-16 md:pt-20 lg:pt-24">
      {/* Hero */}
      <section className="bg-[#f9f6f0] py-16 md:py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-[#2d5a27] font-semibold mb-3">
            Press &amp; Media
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Media Kit
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            Everything journalists, grant writers, and partners need to tell the Seed &amp; Spoon
            story accurately and compellingly.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column: main assets */}
            <div className="lg:col-span-2 space-y-8">
              {/* Boilerplate */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white">
                <h2 className="font-semibold text-gray-900 mb-3">About Seed &amp; Spoon</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Seed & Spoon is a New Jersey-based nonprofit organization specializing in youth
                  food insecurity intervention, community food distribution, and family support
                  services. Founded in 2026 and headquartered in Newark, we partner with schools,
                  community organizations, and local stakeholders to provide consistent access to
                  nutritious food and essential resources for underserved populations.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our approach combines immediate food assistance with long-term,
                  sustainability-focused strategies that strengthen community food systems and
                  improve outcomes for children and families. We are committed to delivering
                  reliable, scalable, and impact-driven services aligned with public and
                  community needs.
                </p>
              </div>

              {/* Mission statement */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white">
                <h2 className="font-semibold text-gray-900 mb-3">Mission Statement</h2>
                <blockquote className="text-sm text-gray-600 leading-relaxed border-l-4 border-[#2d5a27] pl-4 italic">
                  Seed &amp; Spoon&apos;s mission is to nourish and support youth experiencing
                  instability by addressing food insecurity and providing access to meals, stability
                  pathways, and supportive programs that build stability, independence, and
                  long-term opportunity.
                </blockquote>
              </div>

              {/* Capability Statement Card */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Federal Capability Statement</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Our official SAM.gov credential document for grants and partnerships.
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium whitespace-nowrap ml-4">
                    Active Registration
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                  <span>
                    UEI: <strong className="text-gray-700">JZQRPU1GRRM6</strong>
                  </span>
                  <span>
                    CAGE: <strong className="text-gray-700">207U1</strong>
                  </span>
                  <span>
                    SAM.gov expires: <strong className="text-gray-700">April 30, 2027</strong>
                  </span>
                </div>

                <a
                  href="/documents/capability-statement.pdf"
                  download
                  className="inline-flex items-center gap-2 text-sm text-[#2d5a27] font-semibold hover:underline"
                >
                  ↓ Download PDF
                </a>
              </div>

              {/* Press contacts */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white">
                <h2 className="font-semibold text-gray-900 mb-4">Press Contacts</h2>
                <div className="space-y-3">
                  {pressContacts.map((contact) => (
                    <div key={contact.role} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{contact.role}</span>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-[#2d5a27] font-medium hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: quick facts + brand */}
            <div className="space-y-6">
              {/* Quick facts */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white">
                <h2 className="font-semibold text-gray-900 mb-4">Quick Facts</h2>
                <dl className="space-y-3">
                  {quickFacts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-xs text-gray-400 uppercase tracking-wide">
                        {fact.label}
                      </dt>
                      <dd className="text-sm font-medium text-gray-800 mt-0.5">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Brand assets */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white">
                <h2 className="font-semibold text-gray-900 mb-4">Brand Assets</h2>
                <div className="space-y-3">
                  <div className="bg-[#f9f6f0] rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-700">Logo (Light BG)</span>
                    <a
                      href="/assets/logo-transparent.png"
                      download
                      className="text-xs text-[#2d5a27] font-semibold hover:underline"
                    >
                      ↓ PNG
                    </a>
                  </div>
                  <div className="bg-[#2d5a27] rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-white">Logo (Dark BG)</span>
                    <a
                      href="/logo-full.webp"
                      download
                      className="text-xs text-green-200 font-semibold hover:underline"
                    >
                      ↓ WebP
                    </a>
                  </div>
                  <div className="bg-[#f9f6f0] rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-700">Capability Statement</span>
                    <a
                      href="/documents/capability-statement.pdf"
                      download
                      className="text-xs text-[#2d5a27] font-semibold hover:underline"
                    >
                      ↓ PDF
                    </a>
                  </div>
                </div>
              </div>

              {/* Brand colors */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white">
                <h2 className="font-semibold text-gray-900 mb-4">Brand Colors</h2>
                <div className="space-y-2">
                  {[
                    { name: 'Primary Green', hex: '#2d5a27', light: false },
                    { name: 'Dark Green', hex: '#1f3f1b', light: false },
                    { name: 'Cream', hex: '#f9f6f0', light: true },
                  ].map((color) => (
                    <div key={color.hex} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-gray-100 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{color.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{color.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
