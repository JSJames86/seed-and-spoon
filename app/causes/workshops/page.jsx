export const metadata = {
  title: "Education & Workshops | Seed & Spoon NJ",
  description:
    "Seed & Spoon NJ offers practical, judgment-free workshops in budgeting, smart grocery shopping, cooking, and food preservation to help families build long-term food stability.",
};

export default function WorkshopsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
        <img
          src="/images/causes/workshops/workshops-hero.png"
          alt="Seed & Spoon NJ community workshop with families and volunteers"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center px-4">
          <div className="max-w-3xl text-center">
            <h1 className="text-white text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              Education &amp; Workshops
            </h1>
            <p className="text-white/90 text-base md:text-lg leading-relaxed">
              Not just meals — real-world skills. Seed &amp; Spoon NJ workshops help
              neighbors budget, shop, cook, and stretch every box with dignity.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          Turning Food Support into Food Stability
        </h2>
        <p className="text-lg text-neutral-700 leading-relaxed mb-4">
          Seed &amp; Spoon NJ&apos;s Education &amp; Workshops program is where
          the “seed” side of our mission comes to life. We don&apos;t just drop
          off meals and hope for the best — we sit down with families to talk
          about money, groceries, and what&apos;s actually realistic in their
          lives.
        </p>
        <p className="text-lg text-neutral-700 leading-relaxed">
          Sessions are short, practical, and shame-free. We focus on what works
          for working parents, elders, and youth who are juggling real bills,
          real schedules, and real pressure. No lectures. No judgment. Just tools
          people can use the same week.
        </p>
      </section>

      {/* Core Workshops – 3 Category Cards */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
            What We Teach in Our Workshops
          </h2>
          <p className="text-neutral-700 text-base text-center max-w-2xl mx-auto mb-8">
            Each workshop is built around one goal: helping families move from
            “getting by” to having a simple plan for their food, money, and meals.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col">
              <h3 className="text-xl font-semibold mb-2">
                Budgeting &amp; Credit Basics
              </h3>
              <p className="text-neutral-700 text-sm leading-relaxed mb-3">
                Straightforward, stigma-free conversations about how to organize
                bills, build a simple monthly budget, and understand credit scores
                without getting overwhelmed.
              </p>
              <ul className="text-neutral-700 text-sm space-y-1 mt-auto">
                <li>• Building a monthly food budget</li>
                <li>• Understanding credit reports</li>
                <li>• Planning for weeks with extra stress</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col">
              <h3 className="text-xl font-semibold mb-2">
                Smart Grocery Shopping
              </h3>
              <p className="text-neutral-700 text-sm leading-relaxed mb-3">
                How to stretch dollars or benefits at the store without giving up
                taste or culture — plus how to work with whatever shows up in a
                food box.
              </p>
              <ul className="text-neutral-700 text-sm space-y-1 mt-auto">
                <li>• Reading unit prices &amp; labels</li>
                <li>• Building a flexible meal plan</li>
                <li>• Making the most of rescued food</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col">
              <h3 className="text-xl font-semibold mb-2">
                Cooking &amp; Food Preservation
              </h3>
              <p className="text-neutral-700 text-sm leading-relaxed mb-3">
                Hands-on demos that show how to turn basic pantry items and fresh
                produce into meals, freeze leftovers, and keep food safe longer.
              </p>
              <ul className="text-neutral-700 text-sm space-y-1 mt-auto">
                <li>• Batch cooking for busy weeks</li>
                <li>• Freezing &amp; storing produce safely</li>
                <li>• Easy, low-cost recipes for families</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Image Row */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="overflow-hidden rounded-lg shadow-md">
            <img
              src="/images/causes/workshops/workshops-family-class.png"
              alt="Families learning together during a Seed & Spoon NJ workshop"
              className="object-cover w-full h-64 hover:scale-[1.02] transition-transform"
            />
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            <img
              src="/images/causes/workshops/workshops-cooking-demo.png"
              alt="Cooking demonstration using simple ingredients"
              className="object-cover w-full h-64 hover:scale-[1.02] transition-transform"
            />
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            <img
              src="/images/causes/workshops/workshops-budgeting-session.png"
              alt="Budgeting and financial wellness session for the community"
              className="object-cover w-full h-64 hover:scale-[1.02] transition-transform"
            />
          </div>
        </div>
      </section>

      {/* Who It’s For */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            Who These Workshops Are Designed For
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-sm text-neutral-700">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold mb-2">Families &amp; Caregivers</h3>
              <p>
                Parents, grandparents, and caregivers who want to stretch their
                food budget, cook more at home, and feel less stressed about
                groceries each month.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold mb-2">Youth &amp; Young Adults</h3>
              <p>
                Teens and college-age youth learning how to manage money, shop,
                and cook for themselves for the first time — with real-life
                examples, not textbooks.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold mb-2">Community Partners</h3>
              <p>
                Schools, churches, housing communities, and nonprofits who want
                to add practical food and money skills to the support they
                already provide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band – No Form Yet */}
      <section className="bg-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
            Bring a Seed &amp; Spoon Workshop to Your Community
          </h2>
          <p className="text-lg text-neutral-700 leading-relaxed mb-8">
            If you&apos;re a school, pantry, church, clinic, or housing program,
            we can design a workshop that fits your families — budgeting, smart
            grocery shopping, cooking, or all of the above. Let&apos;s build
            food stability together, not just get through the week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/contact"
              className="inline-block px-8 py-3 rounded-full bg-emerald-600 text-white font-medium text-lg hover:bg-emerald-700 transition"
            >
              Inquire About a Workshop
            </a>
            <a
              href="/donate"
              className="inline-block px-8 py-3 rounded-full border border-emerald-600 text-emerald-700 font-medium text-lg hover:bg-emerald-100 transition"
            >
              Support Education &amp; Skills
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
