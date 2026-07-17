import FAQAccordion from './FAQAccordion';
import CapabilityStatementViewer from '@/components/CapabilityStatementViewer';

// ============================================================================
// EDITABLE CONTENT OBJECT
// Update text and URLs here without touching the layout code below.
// Every claim on this page must be true as published — this is a pre-launch
// org, and the copy is written accordingly (see WHERE WE ARE section).
// ============================================================================

const CONTENT = {
  meta: {
    title: 'Our Story',
    description:
      'Seed & Spoon is a Newark-based nonprofit building the infrastructure to end weekend and out-of-school hunger for children in Essex County, starting with 5 Loaves, our weekend meal program launching its first pilot.',
    ogImage: '/og-image.jpg',
  },

  hero: {
    title: 'Built in Newark. Built for the hours school can’t reach.',
    subtitle:
      'Seed & Spoon is a Newark-based nonprofit building the infrastructure to end weekend and out-of-school hunger for children in Essex County — starting with 5 Loaves, our weekend meal program launching its first pilot.',
    ctas: [
      { text: 'Sponsor a Child’s Weekend', url: '/give', isPrimary: true },
      { text: 'See Our Theory of Change', url: '/impact', isPrimary: false },
    ],
  },

  problem: {
    title: 'The weekend nutrition gap',
    paragraphs: [
      'For thousands of children in Newark, school is the most reliable source of food they have. Breakfast and lunch are guaranteed Monday through Friday — and then the week ends. From Friday afternoon to Monday morning, that guarantee disappears for 60+ hours.',
      'Hunger relief in America is generous but fragmented. Pantries and drives do essential work, but no system exists to carry a child’s nutrition reliably across every weekend, for every enrolled child, without exception.',
    ],
    callout:
      'Childhood hunger is not caused by a shortage of food or a shortage of goodwill. It is caused by a shortage of infrastructure. Seed & Spoon exists to build it.',
  },

  whoWeAre: {
    title: 'A new organization, building deliberately',
    paragraphs: [
      'Seed & Spoon, Inc. was incorporated in New Jersey on February 3, 2026. We are young — and we are building this the way infrastructure should be built: safety plans before first meals, cost models before fundraising appeals, documentation before scale.',
      'We haven’t delivered our first meal box yet. When we do, every family will be able to trust exactly what’s inside it — because we spent our first year earning that trust on paper, in systems, and in code.',
    ],
    founderNote: {
      label: 'Founder’s note',
      paragraphs: [
        'I grew up in Elizabeth, New Jersey, and I know what it means when the food runs out before the week does. After two decades away — building companies, leading teams, learning to write software — I came home to build the thing I wish had existed for families like mine: not another drive, not another pantry, but a system a family can count on every single weekend.',
        'Seed & Spoon is built from lived experience and run like infrastructure. That’s not a contradiction. It’s the whole point.',
      ],
      signature: '— Janelle James, Founder & Executive Director',
    },
  },

  building: {
    title: 'What we’re building',
    programs: [
      {
        number: '1',
        title: '5 Loaves — weekend meal coverage',
        intro: 'Our inaugural program delivers complete weekend meal boxes to enrolled children:',
        points: [
          'Prepared in a licensed commercial kitchen under a formal HACCP food safety plan, with documented critical control points at cook, cool, and freeze',
          'Matched to each child’s allergen profile through family-level intake before the first box ships',
          'Sealed and verified — tamper-evident seals, per-bag verification against the batch sheet, cold-chain carriers to the doorstep',
          'Costed to the penny — our pilot model runs $3.56 per meal, and we publish our unit costs',
        ],
        status:
          'Pilot status: launching with 15–25 Newark-area families as funding is secured. Coverage is the standard: every enrolled child, every weekend, no exceptions.',
      },
      {
        number: '2',
        title: 'SpoonAssist — technology that multiplies every dollar',
        intro:
          'Food access isn’t only about supply — it’s about stretching what families already have. SpoonAssist, our meal planning and grocery intelligence platform, helps households turn one grocery trip into a full week of meals by surfacing how ingredients overlap across recipes, so nothing is wasted and every dollar covers more plates.',
        points: [],
        status:
          'The same rails that will move meals through 5 Loaves are being built to put planning power directly in families’ hands — at a scale no delivery route can reach.',
      },
    ],
  },

  readyBeforeDayOne: {
    title: 'Ready before day one',
    intro: 'Before our first delivery, we have completed:',
    items: [
      'A formal HACCP food safety plan and standard operating procedures covering meal prep, packaging, and delivery',
      'A published cost model — $3.56 per meal, with a full 3-year budget and budget narrative',
      'Allergen-gated family intake design, so no child ever receives a meal their family didn’t verify',
      {
        text: 'Published research — our white paper, ',
        italic: 'Modernizing Hunger Relief: Technology, Infrastructure, and the Future of Youth Food Security',
        after: ' (Zenodo, DOI: 10.5281/zenodo.20299779), lays out the evidence base for our model',
        linkUrl: '/resources/reports',
      },
      'Our own technology stack — donation processing, delivery tracking, and program management built in-house, so mission dollars fund meals, not software subscriptions',
    ],
  },

  accountability: {
    title: 'How we hold ourselves accountable',
    paragraphs: [
      'We publish our unit costs. We will survey every family we serve and change course when something isn’t working. We treat food safety as non-negotiable, not aspirational. And we measure success by coverage and stability — not by pounds of food moved.',
      'Our research, cost models, and operational playbooks are published openly, so other communities can replicate what works instead of starting from zero.',
    ],
    links: [
      { text: 'Read Our Theory of Change', url: '/impact' },
      { text: 'Read the White Paper', url: '/resources/reports' },
    ],
  },

  whereWeAre: {
    title: 'Where we are right now',
    items: [
      { done: true, text: 'Incorporated in New Jersey (February 3, 2026)' },
      { done: true, text: 'EIN issued · SAM.gov active (UEI: JZQRPU1GRRM6 · CAGE: 207U1)' },
      { done: true, text: 'IRS Form 1023 filed — 501(c)(3) determination pending', bold: true },
      { done: false, text: 'NJ charity registration in progress' },
      { done: true, text: 'Food safety plan, SOPs, and cost model complete' },
      { done: false, text: '5 Loaves pilot: launching as funding is secured' },
      { done: false, text: 'Commercial kitchen partnership: in final selection' },
    ],
    footnote: 'This page will be updated as each milestone lands. Last updated July 2026.',
  },

  getInvolved: {
    title: 'Be part of the first weekend',
    cards: [
      {
        title: 'Sponsor a child’s weekend meals',
        description: 'From about $25/week. Your support funds the first pilot cohort.',
        buttonText: 'Ways to Give',
        buttonUrl: '/give',
        isPrimary: true,
        color: 'orange',
      },
      {
        title: 'Volunteer interest list',
        description: 'The pilot will need packers, drivers, and community connectors. Join the list and we’ll reach out as roles open.',
        buttonText: 'Sign Up',
        buttonUrl: '/volunteer',
        isPrimary: true,
        color: 'green',
      },
      {
        title: 'Partner with us',
        description: 'Schools, community organizations, and kitchens.',
        buttonText: 'Partner Inquiry',
        buttonUrl: '/partners/community',
        isPrimary: false,
        color: 'blue',
      },
    ],
  },

  faq: {
    title: 'Frequently Asked Questions',
    intro: 'We’re here to answer your questions about how we work, who we serve, and how you can get involved.',
    questions: [
      {
        question: 'Are donations tax-deductible?',
        answer:
          'Seed & Spoon, Inc. has filed IRS Form 1023 and our 501(c)(3) determination is currently pending. Because our application was filed within the IRS’s required window after incorporation, approval would generally make tax-exempt status retroactive to our formation date — meaning donations made now would become tax-deductible once the determination arrives. We will notify all donors the moment our letter is issued, and we provide receipts for every contribution. Please consult your tax advisor about your individual situation.',
      },
      {
        question: 'Who can receive food from Seed & Spoon?',
        answer:
          'Our 5 Loaves pilot will enroll 15–25 Newark-area families with school-age children, with allergen-gated intake for every child. Enrollment opens when the pilot launches — join our mailing list or visit our Get Help page to be notified. Our long-term commitment is dignity-first access: enrollment based on need, never on paperwork burdens or stigma.',
      },
      {
        question: 'How do you ensure food safety?',
        answer:
          'Food safety is designed in before the first meal ships. All 5 Loaves meals will be prepared in a licensed commercial kitchen under our formal HACCP plan, with documented critical control points, allergen protocols with per-child verification, tamper-evident seals applied at packing, and cold-chain handling to the doorstep. Our batch documentation means every bag is traceable from kitchen to family.',
      },
      {
        question: 'How can schools or organizations partner with you?',
        answer:
          'We’re looking for mission-aligned partners as we build toward our first pilot. Schools, community organizations, and licensed kitchens can reach out to discuss what a partnership could look like once we’re enrolling families. Visit our Partner Inquiry page or contact us directly, and we’ll follow up as pilot logistics take shape.',
      },
      {
        question: 'I’m not a cook — can I still volunteer?',
        answer:
          'Yes. The pilot will need packers, drivers, and community connectors, not just kitchen help. Join our volunteer interest list and we’ll reach out as roles open ahead of the first pilot cohort — training will be provided for every role before the first box ships.',
      },
      {
        question: 'What if my child has dietary restrictions or allergies?',
        answer:
          'Allergen matching is built into family-level intake before a single box ships — the Big 9 allergens plus sesame, tracked per child with severity noted, so no child receives a meal their family hasn’t verified. If you have questions about how intake will work, contact us and we’ll walk you through it ahead of enrollment.',
      },
    ],
  },

  schema: {
    organizationName: 'Seed & Spoon',
    url: 'https://seedandspoon.org',
    logo: 'https://seedandspoon.org/assets/logo/seed-and-spoon-logo-full.png',
    description:
      'Newark-based nonprofit building the infrastructure to end weekend and out-of-school hunger for children in Essex County, New Jersey.',
    email: 'info@seedandspoon.org',
  },
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export const metadata = {
  title: CONTENT.meta.title,
  description: CONTENT.meta.description,
  openGraph: {
    title: CONTENT.meta.title,
    description: CONTENT.meta.description,
    url: 'https://seedandspoon.org/about',
    siteName: 'Seed & Spoon',
    images: [
      {
        url: CONTENT.meta.ogImage,
        width: 1200,
        height: 630,
        alt: 'Seed & Spoon Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: CONTENT.meta.title,
    description: CONTENT.meta.description,
    images: [CONTENT.meta.ogImage],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: CONTENT.schema.organizationName,
            url: CONTENT.schema.url,
            logo: CONTENT.schema.logo,
            description: CONTENT.schema.description,
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'General Inquiries',
              email: CONTENT.schema.email,
              availableLanguage: ['English', 'Spanish'],
            },
          }),
        }}
      />

      <div className="bg-white pt-16 md:pt-20 lg:pt-24">
        <HeroSection />
        <ProblemSection />
        <WhoWeAreSection />
        <BuildingSection />
        <ReadyBeforeDayOneSection />
        <AccountabilitySection />
        <WhereWeAreSection />
        <GetInvolvedSection />
        <FAQSection />
        <CredentialsSection />
      </div>
    </>
  );
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-20 md:py-32">
      {/* Sentinel observed by Header to detect when hero is in view */}
      <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {CONTENT.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-10 leading-relaxed text-green-50">
            {CONTENT.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {CONTENT.hero.ctas.map((cta) => (
              <a
                key={cta.text}
                href={cta.url}
                className={`inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl ${
                  cta.isPrimary
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-white border-2 border-white'
                }`}
              >
                {cta.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
            {CONTENT.problem.title}
          </h2>
          {CONTENT.problem.paragraphs.map((p, i) => (
            <p key={i} className="text-xl text-gray-700 leading-relaxed mb-6">
              {p}
            </p>
          ))}
          <p className="text-xl md:text-2xl text-gray-800 font-semibold leading-relaxed border-t-4 border-green-500 pt-8 mt-6">
            {CONTENT.problem.callout}
          </p>
        </div>
      </div>
    </section>
  );
}

function WhoWeAreSection() {
  const { whoWeAre } = CONTENT;
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            {whoWeAre.title}
          </h2>
          {whoWeAre.paragraphs.map((p, i) => (
            <p key={i} className="text-xl text-gray-700 leading-relaxed mb-6">
              {p}
            </p>
          ))}

          <div className="mt-12 bg-green-50 border-l-4 border-green-600 rounded-lg p-8 md:p-10">
            <p className="text-sm font-bold uppercase tracking-wide text-green-700 mb-4">
              {whoWeAre.founderNote.label}
            </p>
            {whoWeAre.founderNote.paragraphs.map((p, i) => (
              <p key={i} className="text-lg text-gray-800 leading-relaxed italic mb-4">
                {p}
              </p>
            ))}
            <p className="text-gray-900 font-semibold not-italic mt-6">
              {whoWeAre.founderNote.signature}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuildingSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
          {CONTENT.building.title}
        </h2>

        <div className="max-w-5xl mx-auto space-y-12">
          {CONTENT.building.programs.map((program) => (
            <article key={program.number} className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <div className="flex items-start gap-6">
                <div className="text-5xl font-bold text-green-200 flex-shrink-0">
                  {program.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {program.title}
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    {program.intro}
                  </p>
                  {program.points.length > 0 && (
                    <ul className="space-y-3 mb-6">
                      {program.points.map((point, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                          <span className="text-gray-700 leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-gray-800 font-medium bg-orange-50 border-l-4 border-orange-500 pl-4 py-3 rounded">
                    {program.status}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReadyBeforeDayOneSection() {
  const { readyBeforeDayOne } = CONTENT;
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            {readyBeforeDayOne.title}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-10 text-center">
            {readyBeforeDayOne.intro}
          </p>
          <ul className="space-y-4">
            {readyBeforeDayOne.items.map((item, i) => (
              <li key={i} className="flex items-start bg-gray-50 rounded-lg p-5">
                <span className="text-green-600 mr-4 mt-0.5 text-xl flex-shrink-0">✓</span>
                {typeof item === 'string' ? (
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                ) : (
                  <span className="text-gray-700 leading-relaxed">
                    {item.text}
                    <a
                      href={item.linkUrl}
                      className="italic text-green-700 underline hover:text-green-800"
                    >
                      {item.italic}
                    </a>
                    {item.after}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AccountabilitySection() {
  const { accountability } = CONTENT;
  return (
    <section className="py-20 bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            {accountability.title}
          </h2>
          {accountability.paragraphs.map((p, i) => (
            <p key={i} className="text-xl leading-relaxed text-green-50 mb-6">
              {p}
            </p>
          ))}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {accountability.links.map((link) => (
              <a
                key={link.text}
                href={link.url}
                className="inline-block px-8 py-4 rounded-lg font-bold text-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white border-2 border-white transition-all"
              >
                {link.text} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhereWeAreSection() {
  const { whereWeAre } = CONTENT;
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-10 text-center">
            {whereWeAre.title}
          </h2>
          <ul className="space-y-4 bg-white rounded-lg shadow-md p-8 md:p-10">
            {whereWeAre.items.map((item, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-3 mt-0.5 text-xl flex-shrink-0" aria-hidden="true">
                  {item.done ? '✅' : '🔄'}
                </span>
                <span className={`text-gray-800 leading-relaxed ${item.bold ? 'font-semibold' : ''}`}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-center text-gray-500 text-sm mt-6 italic">
            {whereWeAre.footnote}
          </p>
        </div>
      </div>
    </section>
  );
}

function GetInvolvedSection() {
  const { getInvolved } = CONTENT;
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
          {getInvolved.title}
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {getInvolved.cards.map((card) => (
            <article
              key={card.title}
              className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center flex flex-col"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
              <p className="text-gray-700 mb-6 leading-relaxed flex-1">
                {card.description}
              </p>
              <a
                href={card.buttonUrl}
                className={`inline-block px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg ${
                  card.isPrimary
                    ? card.color === 'orange'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800'
                }`}
                aria-label={`${card.buttonText} - ${card.title}`}
              >
                {card.buttonText} →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            {CONTENT.faq.title}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {CONTENT.faq.intro}
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <FAQAccordion questions={CONTENT.faq.questions} />
        </div>
      </div>
    </section>
  );
}

function CredentialsSection() {
  const badges = [
    'UEI: JZQRPU1GRRM6',
    'CAGE: 207U1',
    'SAM.gov Active',
    'Woman-Owned',
    '501(c)(3) Pending',
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Work With Us
          </h2>
          <p className="text-gray-600 mb-4">
            Interested in partnering, funding, or contracting with Seed &amp; Spoon?
            Download our official capability statement.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {badges.map((badge) => (
              <span
                key={badge}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium"
              >
                {badge}
              </span>
            ))}
          </div>

          <CapabilityStatementViewer />
        </div>
      </div>
    </section>
  );
}
