const CONTENT = {
  meta: {
    title: 'Ways to Give',
    description:
      'Sponsor a kid, give once or monthly, donate an e-gift card, or send an Amazon Wishlist item to help end childhood food insecurity in New Jersey.',
    ogImage: '/og-image.jpg',
  },
  hero: {
    title: 'Ways to Give',
    subtitle:
      'Every gift, in every form, helps end childhood food insecurity in New Jersey.',
  },
  tiers: [
    {
      label: 'Feed a kid for a week',
      amount: 25,
      amountCents: 2500,
      interval: 'one_time',
      source: 'give_sponsor_week',
      description: 'Covers roughly a week of meals at our ~$3.56-per-meal program cost.',
    },
    {
      label: 'Feed a kid for a month',
      amount: 100,
      amountCents: 10000,
      interval: 'one_time',
      source: 'give_sponsor_month',
      description: 'Keeps a child fed for a full month of programming.',
    },
    {
      label: 'Feed a kid for a year',
      amount: 1200,
      amountCents: 120000,
      interval: 'one_time',
      source: 'give_sponsor_year',
      description: 'Sponsors a child for an entire year of meals.',
      featured: true,
    },
  ],
  giftCards: {
    brands: ["BJ's", 'Costco', 'Amazon'],
    email: 'donors@seedandspoon.org',
    pickupEmail: 'hello@seedandspoon.org',
  },
  wishlistUrl: 'https://www.amazon.com/hz/wishlist/ls/1ZC494TKCOAHJ?ref_=wl_share',
  cannotAccept: {
    title: "What We Can't Accept",
    body:
      "We're not able to accept prepared foods or opened items. Our local health department requires that everything we distribute comes from approved, permitted sources with proper handling documentation, so we can keep every family we serve safe. Unopened, non-perishable food donations are always welcome.",
  },
  footerCta:
    'Supporters like you help us end childhood food insecurity in New Jersey.',
};

export const metadata = {
  title: CONTENT.meta.title,
  description: CONTENT.meta.description,
  openGraph: {
    title: `${CONTENT.meta.title} | Seed & Spoon NJ`,
    description: CONTENT.meta.description,
    url: 'https://seedandspoon.org/give',
    siteName: 'Seed & Spoon NJ',
    images: [
      {
        url: CONTENT.meta.ogImage,
        width: 1200,
        height: 630,
        alt: 'Seed & Spoon NJ Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${CONTENT.meta.title} | Seed & Spoon NJ`,
    description: CONTENT.meta.description,
    images: [CONTENT.meta.ogImage],
  },
};

function donateHref({ amountCents, interval, source }) {
  const params = new URLSearchParams();
  if (amountCents) params.set('amount', String(amountCents));
  if (interval) params.set('interval', interval);
  if (source) params.set('source', source);
  return `/donate?${params.toString()}`;
}

export default function GivePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DonateAction',
            name: 'Ways to Give — Seed & Spoon NJ',
            description: CONTENT.meta.description,
            recipient: {
              '@type': 'NGO',
              name: 'Seed & Spoon',
              url: 'https://seedandspoon.org',
              email: CONTENT.giftCards.email,
            },
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://seedandspoon.org/donate',
              actionPlatform: [
                'https://schema.org/DesktopWebPlatform',
                'https://schema.org/MobileWebPlatform',
              ],
            },
          }),
        }}
      />

      <main className="bg-white pt-16 md:pt-20 lg:pt-24">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-16 md:py-24">
          <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
          <div className="absolute inset-0 bg-black opacity-20" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                {CONTENT.hero.title}
              </h1>
              <p className="text-xl md:text-2xl text-green-50 leading-relaxed">
                {CONTENT.hero.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Sponsor a Kid — primary CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-white to-orange-50">
          <div className="container mx-auto px-6">
            <header className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Sponsor a Kid
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Our program costs about $3.56 per meal. Choose a tier below to sponsor a
                child directly&mdash;every gift goes straight to rescued, nutritious meals.
              </p>
            </header>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {CONTENT.tiers.map((tier) => (
                <article
                  key={tier.label}
                  className={`rounded-3xl p-8 text-center shadow-xl transition-transform hover:-translate-y-1 ${
                    tier.featured
                      ? 'bg-gradient-to-br from-green-600 to-green-700 text-white ring-4 ring-orange-300'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  {tier.featured && (
                    <span className="inline-block mb-3 text-xs font-bold uppercase tracking-wide bg-orange-400 text-green-900 px-3 py-1 rounded-full">
                      Biggest Impact
                    </span>
                  )}
                  <div
                    className={`text-5xl font-bold mb-3 ${
                      tier.featured ? 'text-white' : 'text-green-600'
                    }`}
                  >
                    ${tier.amount.toLocaleString()}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tier.label}</h3>
                  <p
                    className={`mb-6 leading-relaxed ${
                      tier.featured ? 'text-green-50' : 'text-gray-600'
                    }`}
                  >
                    {tier.description}
                  </p>
                  <a
                    href={donateHref(tier)}
                    className={`inline-block w-full px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      tier.featured
                        ? 'bg-white text-green-700 hover:bg-green-50 focus-visible:outline-white'
                        : 'bg-orange-500 text-white hover:bg-orange-600 focus-visible:outline-orange-500'
                    }`}
                    aria-label={`${tier.label} for $${tier.amount}`}
                  >
                    Sponsor for ${tier.amount.toLocaleString()}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Give Once or Monthly */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Give Once or Monthly
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Prefer to choose your own amount, or set up an ongoing gift? Give a
                one-time donation or become a monthly supporter&mdash;whatever fits you best.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={donateHref({ interval: 'one_time', source: 'give_once_or_monthly' })}
                  className="inline-block px-8 py-4 rounded-xl font-bold text-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  Give Once
                </a>
                <a
                  href={donateHref({ interval: 'month', source: 'give_once_or_monthly' })}
                  className="inline-block px-8 py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  Give Monthly
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Gift Cards */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Gift Cards
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We gladly accept e-gift cards from:
              </p>
              <ul className="flex flex-wrap justify-center gap-3 mb-8">
                {CONTENT.giftCards.brands.map((brand) => (
                  <li
                    key={brand}
                    className="bg-white border-2 border-gray-200 rounded-full px-5 py-2 font-semibold text-gray-800"
                  >
                    {brand}
                  </li>
                ))}
              </ul>
              <p className="text-gray-700 leading-relaxed">
                E-gift cards can be emailed to{' '}
                <a
                  href={`mailto:${CONTENT.giftCards.email}`}
                  className="font-semibold text-green-700 underline hover:text-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                >
                  {CONTENT.giftCards.email}
                </a>
                , or email{' '}
                <a
                  href={`mailto:${CONTENT.giftCards.pickupEmail}`}
                  className="font-semibold text-green-700 underline hover:text-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                >
                  {CONTENT.giftCards.pickupEmail}
                </a>{' '}
                to arrange pickup.
              </p>
            </div>
          </div>
        </section>

        {/* Amazon Wishlist */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Amazon Wishlist
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Shop our Amazon Wishlist for supplies our kitchen and delivery teams need
                most.
              </p>
              <a
                href={CONTENT.wishlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                View Our Amazon Wishlist
              </a>
            </div>
          </div>
        </section>

        {/* What We Can't Accept */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {CONTENT.cannotAccept.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">{CONTENT.cannotAccept.body}</p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white">
          <div className="container mx-auto px-6 text-center">
            <p className="text-xl md:text-3xl font-semibold max-w-3xl mx-auto leading-relaxed">
              {CONTENT.footerCta}
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
