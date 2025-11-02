import Image from 'next/image';
import FAQAccordion from './FAQAccordion';

// ============================================================================
// EDITABLE CONTENT OBJECT
// Update text, stats, and URLs here without touching the layout code below
// ============================================================================

const CONTENT = {
  // SEO & Metadata
  meta: {
    title: 'About Us - Seed & Spoon NJ | Fighting Food Insecurity in New Jersey',
    description: 'Learn how Seed & Spoon NJ rescues surplus food and transforms it into dignified, nutritious meals for New Jersey families facing food insecurity.',
    ogImage: '/assets/logo-transparent.png',
  },

  // Hero Section
  hero: {
    title: 'Turning Surplus into Sustenance, Waste into Worth',
    subtitle: 'Every day in New Jersey, thousands of pounds of fresh food go to waste while families struggle to put meals on the table. We\'re changing that.',
    stats: [
      { number: '500K+', label: 'Meals Rescued', color: 'green' },
      { number: '15K', label: 'Volunteers Mobilized', color: 'orange' },
      { number: '200+', label: 'Partner Organizations', color: 'blue' },
    ],
  },

  // Problem Section
  problem: {
    title: 'The Dual Crisis We Face',
    intro: 'New Jersey stands at the intersection of two urgent challenges--and we believe they hold the solution to each other.',
    challenges: [
      {
        title: 'Food Insecurity',
        stat: '1 in 10 New Jersey residents',
        description: 'Over 900,000 people in our state don\'t know where their next meal will come from. Food insecurity affects working families, seniors on fixed incomes, children in every school district, and individuals experiencing sudden hardship.',
        impact: 'Hunger doesn\'t just mean empty stomachs--it means kids struggling to focus in school, adults choosing between groceries and medicine, and families living under constant stress.',
      },
      {
        title: 'Food Waste',
        stat: '40% of food produced is wasted',
        description: 'Meanwhile, grocery stores, restaurants, farms, and distributors discard millions of pounds of perfectly edible food every year due to cosmetic imperfections, overproduction, or approaching best-by dates.',
        impact: 'This waste fills our landfills, releases methane into the atmosphere, and represents a staggering loss of resources, labor, and potential nourishment.',
      },
    ],
    conclusion: 'We don\'t accept this reality. We see a better way forward--one where rescued food becomes a source of dignity, health, and hope.',
  },

  // Solution Section
  solution: {
    title: 'Our Model: Rescue, Transform, Deliver',
    intro: 'Seed & Spoon NJ operates a dignity-first food rescue and meal preparation program that directly connects surplus food with families who need it most.',
    description: 'We bridge the gap between abundance and need through community-powered logistics, commercial kitchen operations, and partnerships built on trust and respect.',
    howItWorks: [
      {
        step: '01',
        title: 'Rescue Surplus Food',
        description: 'We partner with grocery stores, farms, restaurants, and food distributors to intercept high-quality produce, proteins, and staples before they\'re discarded. Our trained volunteers pick up donations daily using food-safe transport.',
        details: ['Daily pickup routes', 'Real-time inventory tracking', 'Safe cold-chain handling'],
      },
      {
        step: '02',
        title: 'Cook with Care & Skill',
        description: 'In our commercial kitchens, trained volunteers and culinary staff transform rescued ingredients into chef-designed, culturally diverse meals. We prioritize nutrition, flavor, and the dignity of home-cooked quality.',
        details: ['Food safety certified kitchens', 'Allergen labeling & tracking', 'Recipes from community voices'],
      },
      {
        step: '03',
        title: 'Package & Label',
        description: 'Every meal is individually portioned, clearly labeled with ingredients and reheating instructions, and packaged in eco-friendly, microwaveable containers. We treat every meal as if it were for our own family.',
        details: ['Clear nutritional info', 'Multi-language labels', 'Sustainable packaging'],
      },
      {
        step: '04',
        title: 'Deliver with Dignity',
        description: 'We coordinate delivery to schools, community centers, food banks, and direct distribution sites across New Jersey. No ID required, no paperwork, no stigma--just warm meals offered with respect.',
        details: ['Flexible pickup times', 'Home delivery for mobility-limited', 'Partner coordination'],
      },
    ],
  },

  // Values Section
  values: {
    title: 'Our Commitments',
    principles: [
      {
        icon: '🤝',
        title: 'Dignity First',
        description: 'We believe everyone deserves access to fresh, delicious, thoughtfully prepared food--no questions asked, no barriers, no shame.',
      },
      {
        icon: '🔒',
        title: 'Food Safety Always',
        description: 'Every meal is prepared in commercial kitchens meeting state and federal standards, with full allergen tracking and temperature control.',
      },
      {
        icon: '💚',
        title: 'Environmental Stewardship',
        description: 'By rescuing food, we reduce landfill waste, lower carbon emissions, and model sustainable community systems.',
      },
      {
        icon: '🌍',
        title: 'Culturally Responsive',
        description: 'We listen to the communities we serve and prepare meals that honor diverse culinary traditions and dietary needs.',
      },
      {
        icon: '🔓',
        title: 'Transparent & Accountable',
        description: 'We share how every dollar is spent, publish annual impact reports, and invite community feedback to continuously improve.',
      },
      {
        icon: '🤲',
        title: 'Volunteer Powered',
        description: 'Our work is possible because of hundreds of volunteers who give their time, skills, and heart to this mission every week.',
      },
    ],
  },

  // How We Operate Section
  operations: {
    title: 'How We Operate',
    intro: 'Transparency is at the heart of our work. Here\'s a detailed look at how we run our programs every day.',
    areas: [
      {
        title: 'Sourcing Surplus',
        points: [
          'Daily pickup routes from 50+ grocery partners (ShopRite, Whole Foods, local markets)',
          'Direct farm partnerships for seasonal produce',
          'Bakery and prepared food donations from restaurants and caterers',
          'Real-time inventory system to match donations with meal plans',
        ],
      },
      {
        title: 'Food Safety Practices',
        points: [
          'All volunteers complete ServSafe or equivalent food handler training',
          'Commercial kitchens inspected by local health departments',
          'Cold chain maintained from pickup to delivery (under 40°F)',
          'Allergen protocols: separate prep areas, clear labeling (contains dairy, nuts, gluten, etc.)',
          'Shelf-stable items stored per FIFO (first in, first out) rules',
        ],
      },
      {
        title: 'Packaging & Delivery',
        points: [
          'Meals packaged in BPA-free, microwaveable containers with snap lids',
          'Labels include: meal name, ingredients, reheating instructions, "use by" date',
          'Insulated bags and coolers for transport',
          'Delivery within 2 hours of packaging; refrigeration at distribution sites',
          'Coordinated drop-offs at 40+ partner locations (schools, shelters, community centers)',
        ],
      },
      {
        title: 'Partner Organizations',
        points: [
          'Food banks & pantries: We supplement shelf-stable boxes with fresh meals',
          'Schools: After-school meal programs and weekend backpack initiatives',
          'Senior centers: Delivered meals for homebound and congregate dining',
          'Shelters & transitional housing: Reliable meal service for residents',
          'Community health clinics: Medically tailored meal referrals',
        ],
      },
      {
        title: 'Volunteer Roles',
        points: [
          'Food Runners: Pick up donations, drive refrigerated vans',
          'Kitchen Crew: Prep, cook, and portion meals (training provided)',
          'Packers & Labelers: Assemble meal kits, quality-check labels',
          'Delivery Drivers: Distribute meals to partner sites',
          'Admin & Outreach: Coordinate schedules, update database, engage community',
          'Shift lengths: 2-4 hours, flexible scheduling, all skill levels welcome',
        ],
      },
    ],
  },

  // Impact Section
  impact: {
    title: 'Impact & Transparency',
    intro: 'We believe in radical transparency. Here\'s where your support goes and the tangible difference it makes.',
    metrics: {
      title: '2024 Impact Snapshot',
      stats: [
        { label: 'Meals Prepared & Distributed', value: '523,400', icon: '🍽️' },
        { label: 'Pounds of Food Rescued', value: '287,000', icon: '♻️' },
        { label: 'Volunteer Hours Contributed', value: '42,300', icon: '👐' },
        { label: 'Partner Distribution Sites', value: '210', icon: '📍' },
        { label: 'CO₂ Emissions Prevented (tons)', value: '1,150', icon: '🌱' },
        { label: 'Individuals Served Weekly', value: '8,600', icon: '❤️' },
      ],
    },
    financials: {
      title: 'How We Use Your Donations',
      intro: 'Every dollar is invested directly into our mission. Here\'s our breakdown for the 2024 fiscal year:',
      breakdown: [
        { category: 'Kitchen Operations & Food Costs', percent: 62, description: 'Commercial kitchen rental, ingredients, packaging, food safety supplies' },
        { category: 'Transportation & Logistics', percent: 18, description: 'Vehicle maintenance, fuel, refrigerated van leasing, driver stipends' },
        { category: 'Volunteer Training & Support', percent: 10, description: 'ServSafe certifications, onboarding materials, volunteer appreciation' },
        { category: 'Administrative & Operations', percent: 7, description: 'Staff salaries, insurance, software systems, accounting' },
        { category: 'Community Outreach & Development', percent: 3, description: 'Partnership building, fundraising events, communications' },
      ],
      note: 'Our goal is to keep administrative costs under 10% while maintaining the infrastructure needed for long-term impact. We\'re proud that 90 cents of every dollar goes directly to program delivery.',
    },
    cta: {
      text: 'Want to see the full breakdown? Download our annual impact report with detailed financials, program outcomes, and community testimonials.',
      linkText: 'Read Our 2024 Impact Report (PDF)',
      linkUrl: '/reports/seed-spoon-impact-2024.pdf',
    },
  },

  // FAQ Section
  faq: {
    title: 'Frequently Asked Questions',
    intro: 'We\'re here to answer your questions about how we work, who we serve, and how you can get involved.',
    questions: [
      {
        question: 'Who can receive food from Seed & Spoon NJ?',
        answer: 'Anyone who needs a meal can access our services--no ID, no income verification, no paperwork required. We work on a dignity-first model. Our partner distribution sites (schools, community centers, food banks) are open to all community members. If you or someone you know needs food, please visit our Partner Locations page or contact us directly.',
      },
      {
        question: 'Are donations tax-deductible?',
        answer: 'Yes! Seed & Spoon NJ is a registered 501(c)(3) nonprofit organization. All monetary and in-kind donations are tax-deductible to the fullest extent allowed by law. You\'ll receive a receipt for your records after every contribution. Our EIN is available upon request for your tax filings.',
      },
      {
        question: 'How do you ensure food safety?',
        answer: 'Food safety is our top priority. All operations occur in licensed commercial kitchens inspected by local health departments. Every volunteer completes food handler training (ServSafe or equivalent). We maintain cold chain from pickup to delivery (under 40°F), track allergens rigorously, label every meal with ingredients and dates, and follow FIFO protocols for storage. Our team includes certified food safety managers who oversee daily operations.',
      },
      {
        question: 'How can schools or organizations partner with you?',
        answer: 'We\'re always looking for mission-aligned partners! Schools, food banks, shelters, community centers, and other nonprofits can become distribution sites. We coordinate delivery schedules, provide insulated storage guidance, and work with you to understand your community\'s needs. To start a partnership, email partnerships@seedandspoon.org or fill out our Partner Interest Form on the website. We\'ll schedule a call to discuss logistics, volume, and how we can best support your population.',
      },
      {
        question: 'I\'m not a cook--can I still volunteer?',
        answer: 'Absolutely! We have roles for every skill level. You can drive pickup routes, pack meals, deliver to distribution sites, help with admin tasks, or support outreach efforts. Full training is provided for every role. Many of our most dedicated volunteers had zero kitchen experience when they started. What matters most is your commitment to the mission and your willingness to learn. Sign up on our Volunteer page to explore opportunities.',
      },
      {
        question: 'What if I have dietary restrictions or allergies?',
        answer: 'We prepare a variety of meals to accommodate common dietary needs (vegetarian, gluten-free, dairy-free, etc.), and every container is clearly labeled with ingredients and common allergens. While we can\'t guarantee custom meals for every individual restriction, we work with our distribution partners to understand community needs and adjust menus accordingly. If you have questions about specific ingredients, reach out to the distribution site coordinator or contact us directly.',
      },
    ],
  },

  // Call to Action Section
  cta: {
    title: 'Be Part of the Solution',
    intro: 'Every meal we serve, every pound of food we rescue, every volunteer hour given--it all adds up to a more just, sustainable, and nourished New Jersey.',
    message: 'Whether you donate, volunteer, or partner with us, you\'re helping to ensure that no one in our community goes hungry and no good food goes to waste.',
    actions: [
      {
        title: 'Donate',
        description: 'Fund meals, kitchen operations, and delivery logistics. Every $5 provides two nutritious meals.',
        buttonText: 'Make a Donation',
        buttonUrl: '/donate',
        isPrimary: true,
        color: 'orange',
      },
      {
        title: 'Volunteer',
        description: 'Join our kitchen crews, delivery teams, or outreach efforts. Flexible schedules and full training provided.',
        buttonText: 'Sign Up to Volunteer',
        buttonUrl: '/volunteer',
        isPrimary: true,
        color: 'green',
      },
      {
        title: 'Partner With Us',
        description: 'Schools, food banks, farms, and businesses--let\'s collaborate to amplify our collective impact.',
        buttonText: 'Explore Partnerships',
        buttonUrl: '/contact?subject=partnership',
        isPrimary: false,
        color: 'blue',
      },
    ],
    closingStatement: 'Together, we\'re building a future where good food, dignity, and community care are accessible to all.',
  },

  // Schema.org structured data
  schema: {
    organizationName: 'Seed & Spoon NJ',
    url: 'https://seedandspoon.org',
    logo: 'https://seedandspoon.org/assets/logo-transparent.png',
    description: 'Nonprofit food rescue and meal preparation organization serving New Jersey communities facing food insecurity.',
    email: 'info@seedandspoon.org',
    telephone: '+1-555-SPOON-NJ',
    address: {
      streetAddress: '123 Community Way',
      addressLocality: 'Newark',
      addressRegion: 'NJ',
      postalCode: '07102',
      addressCountry: 'US',
    },
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
              telephone: CONTENT.schema.telephone,
              contactType: 'General Inquiries',
              email: CONTENT.schema.email,
              availableLanguage: ['English', 'Spanish'],
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: CONTENT.schema.address.streetAddress,
              addressLocality: CONTENT.schema.address.addressLocality,
              addressRegion: CONTENT.schema.address.addressRegion,
              postalCode: CONTENT.schema.address.postalCode,
              addressCountry: CONTENT.schema.address.addressCountry,
            },
            sameAs: [
              'https://facebook.com/seedandspoon',
              'https://instagram.com/seedandspoon',
              'https://twitter.com/seedandspoon',
            ],
          }),
        }}
      />

      <main className="bg-white">
        {/* Hero Section */}
        <HeroSection />

        {/* Problem Section */}
        <ProblemSection />

        {/* Solution Section */}
        <SolutionSection />

        {/* Values Section */}
        <ValuesSection />

        {/* Operations Section */}
        <OperationsSection />

        {/* Impact Section */}
        <ImpactSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Call to Action Section */}
        <CTASection />
      </main>
    </>
  );
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-20 md:py-32">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {CONTENT.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-12 leading-relaxed text-green-50">
            {CONTENT.hero.subtitle}
          </p>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {CONTENT.hero.stats.map((stat, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
                <div className={`text-4xl md:text-5xl font-bold mb-2 text-${stat.color}-300`}>
                  {stat.number}
                </div>
                <div className="text-lg text-green-100">{stat.label}</div>
              </div>
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
        <header className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            {CONTENT.problem.title}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {CONTENT.problem.intro}
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto mb-12">
          {CONTENT.problem.challenges.map((challenge, index) => (
            <article key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Images */}
              <div className="relative h-64">
                <img
                  src={index === 0 ? '/images/about/problem.jpeg' : '/images/about/distribution.jpeg'}
                  alt={index === 0 ? 'Community members facing food insecurity' : 'Food waste and distribution challenges'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {challenge.title}
                </h3>
                <div className="text-3xl font-bold text-orange-600 mb-4">
                  {challenge.stat}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {challenge.description}
                </p>
                <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                  <p className="text-gray-800 italic">
                    <strong>The Impact:</strong> {challenge.impact}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl md:text-2xl text-gray-800 font-semibold leading-relaxed border-t-4 border-green-500 pt-8">
            {CONTENT.problem.conclusion}
          </p>
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            {CONTENT.solution.title}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-4">
            {CONTENT.solution.intro}
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            {CONTENT.solution.description}
          </p>
        </header>

        <div className="max-w-5xl mx-auto space-y-12">
          {CONTENT.solution.howItWorks.map((step, index) => (
            <article
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } gap-8 items-center`}
            >
              {/* Images */}
              <div className="w-full md:w-1/2">
                <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={
                      index === 0 ? '/images/about/problem.jpeg' :
                      index === 1 ? '/images/about/kitchen.png' :
                      index === 2 ? '/images/about/distribution.jpeg' :
                      '/images/about/volunteers.jpg'
                    }
                    alt={
                      index === 0 ? 'Rescued surplus food and fresh produce' :
                      index === 1 ? 'Volunteers cooking meals in commercial kitchen' :
                      index === 2 ? 'Meals being packaged for distribution' :
                      'Delivery team distributing meals to community'
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="text-6xl font-bold text-green-200 mb-2">
                  {step.step}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start">
                      <span className="text-green-600 mr-3 text-xl">✓</span>
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-6">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            {CONTENT.values.title}
          </h2>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {CONTENT.values.principles.map((principle, index) => (
            <article
              key={index}
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">{principle.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {principle.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperationsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            {CONTENT.operations.title}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {CONTENT.operations.intro}
          </p>
        </header>

        <div className="max-w-5xl mx-auto space-y-12">
          {CONTENT.operations.areas.map((area, index) => (
            <article key={index} className="bg-gray-50 rounded-lg p-8 border-l-4 border-blue-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {area.title}
              </h3>
              <ul className="space-y-3">
                {area.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">▸</span>
                    <span className="text-gray-700 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto px-6">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            {CONTENT.impact.title}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {CONTENT.impact.intro}
          </p>
        </header>

        {/* Impact Metrics */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-10">
            {CONTENT.impact.metrics.title}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONTENT.impact.metrics.stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Impact Graph */}
          <div className="mt-12 text-center">
            <img
              src="/images/about/impact-graph.png"
              alt="Impact metrics visualization showing growth over time"
              className="mx-auto rounded-lg shadow-lg max-w-full h-auto"
            />
          </div>
        </div>

        {/* Financial Transparency */}
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            {CONTENT.impact.financials.title}
          </h3>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            {CONTENT.impact.financials.intro}
          </p>

          <div className="space-y-6">
            {CONTENT.impact.financials.breakdown.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">
                    {item.category}
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    {item.percent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 ml-2">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="text-gray-800 leading-relaxed">
              {CONTENT.impact.financials.note}
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg text-gray-700 mb-4">
              {CONTENT.impact.cta.text}
            </p>
            <a
              href={CONTENT.impact.cta.linkUrl}
              className="inline-block bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
              aria-label="Download 2024 Impact Report"
            >
              {CONTENT.impact.cta.linkText} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="py-20 bg-white">
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

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {CONTENT.cta.title}
          </h2>
          <p className="text-xl md:text-2xl mb-6 leading-relaxed text-green-50">
            {CONTENT.cta.intro}
          </p>
          <p className="text-lg leading-relaxed text-green-100">
            {CONTENT.cta.message}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {CONTENT.cta.actions.map((action, index) => (
            <article
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 border border-white border-opacity-20 text-center hover:bg-opacity-20 transition-all"
            >
              <h3 className="text-2xl font-bold mb-4">{action.title}</h3>
              <p className="text-green-50 mb-6 leading-relaxed">
                {action.description}
              </p>
              <a
                href={action.buttonUrl}
                className={`inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl ${
                  action.isPrimary
                    ? action.color === 'orange'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-2 border-white'
                }`}
                aria-label={`${action.buttonText} - ${action.title}`}
              >
                {action.buttonText}
              </a>
            </article>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xl md:text-2xl font-semibold text-green-100 max-w-3xl mx-auto leading-relaxed">
            {CONTENT.cta.closingStatement}
          </p>
        </div>
      </div>
    </section>
  );
}
