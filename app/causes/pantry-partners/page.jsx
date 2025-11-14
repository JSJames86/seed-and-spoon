export const metadata = {
  title: "Community Pantry Partners | Seed & Spoon NJ",
  description:
    "Join Seed & Spoon NJ as a community pantry partner. We collaborate with schools, churches, local organizations, and micro-pantries to distribute fresh meals and groceries directly to families.",
};

export default function PantryPartnersPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
        <img
          src="/images/causes/pantry-partners/pantry-partners-hero.png"
          alt="Community pantry partnership with Seed & Spoon NJ"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-4">
          <h1 className="text-white text-3xl md:text-5xl font-bold text-center drop-shadow-lg">
            Community Pantry Partners
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          Together, We Expand Access to Fresh Food
        </h2>
        <p className="text-lg text-neutral-700 leading-relaxed mb-4">
          Seed & Spoon NJ partners with schools, churches, nonprofits, housing communities,
          small local pantries, and neighborhood leaders to bring fresh food directly to families.
          Our partnership model is designed to be simple, barrier-free, and community-powered —
          meeting people where they already are.
        </p>
        <p className="text-lg text-neutral-700 leading-relaxed">
          Whether you’re a school counselor, faith-based leader, community organizer,
          or local business owner, you can help us reach more families with dignity,
          reliability, and care.
        </p>
      </section>

      {/* How It Works */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            How Pantry Partnerships Work
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xl font-semibold mb-2">1. Connect & Assess</h3>
              <p className="text-neutral-700">
                We meet with your team to understand your community’s needs — number of families,
                preferred pickup schedule, dietary needs, and cultural preferences.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">2. Deliver & Distribute</h3>
              <p className="text-neutral-700">
                We prepare fresh meals or grocery boxes and deliver them directly to your site
                on a recurring schedule. You choose whether distribution is public or private,
                walk-up or discreet pickup.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">3. Track Impact Together</h3>
              <p className="text-neutral-700">
                We share simple monthly impact reports — families served, meals distributed,
                and partnership outcomes — so you can measure and communicate your impact
                to your community and supporters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Row */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <img
            src="/images/causes/pantry-partners/pantry-sorting-helpers.png"
            alt="Volunteers sorting pantry boxes at a partner site"
            className="rounded-lg shadow-md object-cover w-full h-64"
          />
          <img
            src="/images/causes/pantry-partners/pantry-local-grocers.png"
            alt="Shelves of food at a local community pantry"
            className="rounded-lg shadow-md object-cover w-full h-64"
          />
          <img
            src="/images/causes/pantry-partners/pantry-partners-hero.png"
            alt="Seed & Spoon NJ collaborating with a community pantry partner"
            className="rounded-lg shadow-md object-cover w-full h-64"
          />
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 text-center">
            What Partners Receive
          </h2>

          <ul className="space-y-3 text-neutral-700 text-lg max-w-3xl mx-auto">
            <li>• Reliable delivery of meals and/or grocery boxes for your families</li>
            <li>• Access to nutritious, culturally relevant foods</li>
            <li>• Optional volunteer support on distribution days</li>
            <li>• Flyers, digital assets, and communication templates</li>
            <li>• Simple monthly impact and service data</li>
            <li>• Priority access for special events and community dinners</li>
          </ul>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4 text-center">
          Who Can Become a Pantry Partner?
        </h2>
        <p className="text-lg text-neutral-700 leading-relaxed text-center mb-6">
          If you regularly see families struggling with food access, we want to talk to you.
        </p>
        <div className="grid md:grid-cols-2 gap-6 text-neutral-700 text-base">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-2">Community & Faith Partners</h3>
            <p>
              Churches, mosques, temples, mutual aid groups, neighborhood associations,
              and grassroots organizers who want to offer consistent food support on-site.
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-2">Schools & Youth Spaces</h3>
            <p>
              Schools, afterschool programs, and youth centers that want to provide
              discreet food support to students and families—especially during breaks.
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-2">Housing & Community Sites</h3>
            <p>
              Housing communities, shelters, and community centers where families
              already gather and feel safe receiving support.
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-2">Existing Micro-Pantries</h3>
            <p>
              Little free pantries, community fridges, or small food closets that need
              a steady partner to keep shelves stocked with fresh and staple items.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          Want to Become a Pantry Partner?
        </h2>
        <p className="text-lg text-neutral-700 mb-8">
          We’d love to learn about your community and explore how we can support your families.
          Partnerships can be weekly, monthly, or seasonal — built around your capacity and needs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/contact"
            className="inline-block px-8 py-3 rounded-full bg-emerald-600 text-white font-medium text-lg hover:bg-emerald-700 transition"
          >
            Contact Us to Get Started
          </a>
          <a
            href="mailto:seedandspoonnj@gmail.com"
            className="text-sm text-neutral-700 hover:text-neutral-900 underline underline-offset-4"
          >
            Or email us: seedandspoonnj@gmail.com
          </a>
        </div>
      </section>
    </div>
  );
}
