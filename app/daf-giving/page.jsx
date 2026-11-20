import DafDirectGive from '@/components/donate/DafDirectGive';
import { dafCopy, DAF_NOTIFY_EMAIL } from '@/data/dafGiving';
import { ORG_LEGAL_NAME, ORG_EIN, ORG_TAX_STATUS_LINE } from '@/lib/org';

export const metadata = {
  title: dafCopy.meta.title,
  description: dafCopy.meta.description,
  alternates: { canonical: 'https://seedandspoon.org/daf-giving' },
  openGraph: {
    title: `${dafCopy.meta.title} | Seed & Spoon NJ`,
    description: dafCopy.meta.description,
    url: 'https://seedandspoon.org/daf-giving',
    siteName: 'Seed & Spoon NJ',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Seed & Spoon NJ Logo' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${dafCopy.meta.title} | Seed & Spoon NJ`,
    description: dafCopy.meta.description,
    images: ['/og-image.jpg'],
  },
};

const notifyHref = `mailto:${DAF_NOTIFY_EMAIL}?subject=${encodeURIComponent(
  'I recommended a DAF grant to Seed & Spoon'
)}&body=${encodeURIComponent(
  'Name:\nDAF sponsor (e.g., Fidelity Charitable, DAFgiving360):\nGrant amount:\nDate recommended:\nAnything you would like us to know:\n'
)}`;

const linkClass =
  'font-semibold text-green-700 underline hover:text-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700';

export default function DafGivingPage() {
  return (
    <div className="bg-white pt-16 md:pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-16 md:py-24">
        <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {dafCopy.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-green-50 leading-relaxed">
              {dafCopy.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Why give through a DAF */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-green-50 via-white to-orange-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {dafCopy.why.map((item) => (
              <article key={item.title} className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-gray-600 leading-relaxed">{item.body}</p>
              </article>
            ))}
          </div>

          {/* DAF Direct widget / link */}
          <div className="max-w-2xl mx-auto">
            <DafDirectGive />
          </div>
        </div>
      </section>

      {/* Other sponsors: EIN fallback */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Have a DAF Somewhere Else?
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed text-center">
              Vanguard Charitable, a community foundation, or another sponsor? Log in to your
              DAF account, search for us, and recommend a grant using these details:
            </p>
            <dl className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 grid sm:grid-cols-[auto,1fr] gap-x-6 gap-y-3">
              <dt className="font-semibold text-gray-900">Legal name</dt>
              <dd className="text-gray-700">{ORG_LEGAL_NAME}</dd>
              <dt className="font-semibold text-gray-900">EIN</dt>
              <dd className="text-gray-700 font-mono">{ORG_EIN}</dd>
              <dt className="font-semibold text-gray-900">Designation</dt>
              <dd className="text-gray-700">Unrestricted / general support</dd>
              <dt className="font-semibold text-gray-900">Questions</dt>
              <dd className="text-gray-700">
                <a href={`mailto:${DAF_NOTIFY_EMAIL}`} className={linkClass}>
                  {DAF_NOTIFY_EMAIL}
                </a>
              </dd>
            </dl>
          </div>
        </div>
      </section>

      {/* Let us know you gave */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Let Us Know You Gave
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              DAF sponsors don&rsquo;t always tell us who recommended a grant. A quick note
              helps us match your gift and thank you properly.
            </p>
            <a
              href={notifyHref}
              className="inline-block px-8 py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Tell Us About Your Grant
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Questions About DAF Giving
            </h2>
            <div className="space-y-4">
              {dafCopy.faq.map((item) => (
                <details
                  key={item.q}
                  className="group bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 open:bg-white"
                >
                  <summary className="cursor-pointer font-semibold text-gray-900 text-lg list-none flex justify-between items-center gap-4">
                    {item.q}
                    <span aria-hidden="true" className="text-green-700 group-open:rotate-45 transition-transform text-2xl leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-gray-700 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-10 text-center text-sm text-gray-500">{ORG_TAX_STATUS_LINE}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
