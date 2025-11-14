import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Education & Workshops | Seed & Spoon NJ",
  description:
    "Budgeting, cooking, food preservation, smart grocery shopping, and youth agriculture workshops that help New Jersey families build long-term food stability.",
};

export default function WorkshopsPage() {
  return (
    <main className="min-h-screen bg-[#F9EED4] pt-16 md:pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0B88C2] to-[#02538A] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[3fr,2fr] items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Education, Skills & Youth Agriculture
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-95">
              Food security isn’t just about tonight’s meal. Our workshops help
              families and young people build the money, kitchen, and growing
              skills that make food stability possible for the long run.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#0B88C2] font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Host a Workshop
              </Link>
              <Link
                href="/volunteer"
                className="inline-flex items-center justify-center px-8 py-3 border border-white/60 text-white font-semibold rounded-lg hover:bg-white/10 hover:-translate-y-0.5 transition-all"
              >
                Help Facilitate
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative w-full max-w-md ml-auto">
              <div className="relative h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src="/images/causes/workshops/workshops-hero.png"
                  alt="Instructor leading a community food skills workshop"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 400px, 100vw"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white text-[#02538A] rounded-2xl shadow-xl px-4 py-3 text-sm font-semibold">
                <p>Real-life skills. Zero judgement. Community-powered.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-4 py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[3fr,2fr] items-center">
          <div className="space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold text-[#02538A]">
              Skills that stretch every dollar and every meal
            </h2>
            <p className="text-lg text-gray-800 leading-relaxed">
              When money is tight, the smallest skills make the biggest
              difference: reading price tags, planning meals, freezing leftovers
              the right way, or knowing what to do with an unfamiliar ingredient.
              Our workshops are built for real life, not perfection.
            </p>
            <p className="text-lg text-gray-800 leading-relaxed">
              We create judgement-free spaces where families, youth, and
              community members can ask questions, practice hands-on, and leave
              with tools they can use the same day—whether that’s a new recipe,
              a budget template, or a tray of seedlings they grew themselves.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="relative h-40 sm:h-44 rounded-2xl overflow-hidden shadow-lg bg-white">
              <Image
                src="/images/causes/workshops/workshops-family-class.png"
                alt="Families learning together in a Seed & Spoon workshop"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 500px, 50vw"
              />
            </div>
            <div className="relative h-40 sm:h-44 rounded-2xl overflow-hidden shadow-lg bg-white">
              <Image
                src="/images/causes/workshops/workshops-budgeting-session.png"
                alt="Instructor teaching a budgeting and credit basics session"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 500px, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Categories */}
      <section className="max-w-7xl mx-auto px-4 pb-10 md:pb-14">
        <div className="mb-8 text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#02538A]">
            What We Teach
          </h2>
          <p className="text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
            Our workshops are designed with and for the community—practical,
            culturally responsive, and focused on what actually shows up in
            fridges, pantries, and paychecks.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-3">
          {/* Card 1 – Money & Planning */}
          <article className="bg-white rounded-2xl shadow-lg border border-black/5 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0B88C2]/10 text-[#0B88C2] text-xl">
                💸
              </span>
              <h3 className="text-xl font-bold text-[#02538A]">
                Budgeting & Food Planning
              </h3>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed mb-4">
              Simple, real-life budgeting sessions that help families see where
              money goes, plan around pay cycles, and make food last longer
              without shame or overwhelm.
            </p>
            <ul className="text-sm text-gray-800 space-y-2 mb-4">
              <li>• Budgeting around SNAP, WIC, and paychecks</li>
              <li>• Building realistic grocery lists</li>
              <li>• Understanding unit pricing and store “deals”</li>
              <li>• Intro to credit repair and debt basics</li>
            </ul>
            <p className="mt-auto text-xs text-gray-500">
              Great for: Adults, caregivers, and older teens.
            </p>
          </article>

          {/* Card 2 – Cooking & Preservation */}
          <article className="bg-white rounded-2xl shadow-lg border border-black/5 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#77A462]/10 text-[#77A462] text-xl">
                🍳
              </span>
              <h3 className="text-xl font-bold text-[#02538A]">
                Cooking, Meal Prep & Food Preservation
              </h3>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed mb-4">
              Hands-on kitchen sessions that show how to turn pantry staples,
              surplus ingredients, and donated items into meals families actually
              want to eat.
            </p>
            <ul className="text-sm text-gray-800 space-y-2 mb-4">
              <li>• One-pot and sheet-pan recipes</li>
              <li>• Batch cooking and safe freezing</li>
              <li>• Using “mystery” or surplus ingredients</li>
              <li>• Reducing waste with leftovers and simple preservation</li>
            </ul>
            <p className="mt-auto text-xs text-gray-500">
              Great for: Families, youth, and first-time cooks.
            </p>
          </article>

          {/* Card 3 – Smart Shopping & Systems */}
          <article className="bg-white rounded-2xl shadow-lg border border-black/5 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EA802F]/10 text-[#EA802F] text-xl">
                🛒
              </span>
              <h3 className="text-xl font-bold text-[#02538A]">
                Smart Grocery Shopping & Systems at Home
              </h3>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed mb-4">
              We walk through store aisles, circulars, and home pantries—either
              literally or virtually—to build systems that make food stretch and
              shopping less stressful.
            </p>
            <ul className="text-sm text-gray-800 space-y-2 mb-4">
              <li>• Reading store flyers and hidden costs</li>
              <li>• Comparing store brands vs. name brands</li>
              <li>• Setting up a “working” pantry at home</li>
              <li>• Shopping with kids and staying on track</li>
            </ul>
            <p className="mt-auto text-xs text-gray-500">
              Great for: Parents, caregivers, and community groups.
            </p>
          </article>
        </div>
      </section>

      {/* Youth Agriculture Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
        <div className="grid gap-10 lg:grid-cols-[3fr,2fr] items-center">
          <div className="space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold text-[#02538A]">
              Youth Agriculture: Growing Food, Growing Futures
            </h2>
            <p className="text-lg text-gray-800 leading-relaxed">
              Youth Agriculture is one of the most powerful “workshops” we
              offer. When young people learn how to plant, tend, and harvest
              food, they see themselves as part of the solution—not just as
              recipients of help.
            </p>
            <p className="text-lg text-gray-800 leading-relaxed">
              Through school-based gardens, pop-up plots, and farm visits, youth
              learn the basics of soil care, seeds, watering, and harvest. Many
              of the herbs and produce they grow help supply Seed & Spoon meals
              and grocery boxes—closing the loop from seed to spoon.
            </p>
            <ul className="text-base text-gray-800 space-y-2">
              <li>• Garden days at schools and community sites</li>
              <li>• Hands-on lessons in planting, composting, and harvesting</li>
              <li>• Simple cooking demos using what youth grew themselves</li>
              <li>• Pathways to future green jobs and urban agriculture</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="relative h-52 md:h-60 rounded-2xl overflow-hidden shadow-xl bg-white">
              <Image
                src="/images/causes/workshops/workshops-cooking-demo.png"
                alt="Youth and families watching a cooking demonstration"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 450px, 100vw"
              />
            </div>
            <div className="bg-white/90 rounded-2xl shadow-md p-4 border-l-4 border-[#77A462] text-sm text-gray-800">
              “The seed is knowledge. The spoon is care. Youth Agriculture brings
              both together—young people grow food that feeds their own
              community.”
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-[#77A462] to-[#5a8a4a] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Bring a Seed & Spoon Workshop to Your Community
          </h2>
          <p className="text-lg md:text-xl leading-relaxed opacity-95">
            Schools, churches, housing communities, and local groups can partner
            with Seed & Spoon NJ to host budgeting sessions, cooking classes,
            smart grocery workshops, or youth agriculture days. We’ll work with
            you to design something that fits your people and your space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-[#77A462] font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              Ask About Hosting
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center px-10 py-4 bg-[#EA802F] hover:bg-[#d6722a] text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              Help Lead Workshops
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
