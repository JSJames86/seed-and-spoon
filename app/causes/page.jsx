import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Our Causes | Seed & Spoon NJ - Feeding Families, Growing Community",
  description:
    "Explore Seed & Spoon NJ’s core causes: surplus food rescue, community pantry partners, prepared meals & family food boxes, and education & workshops that empower New Jersey families.",
};

// Causes hub data
const causesData = [
  {
    id: "surplus-rescue",
    title: "Surplus Rescue",
    href: "/causes/surplus-rescue",
    image: "/images/causes/surplus-rescue/surplus-rescue-volunteers.png",
    imageAlt:
      "Seed & Spoon volunteers sorting surplus food from a grocery partner",
    description: [
      "Every week, good food is thrown away while families go without. Our Surplus Rescue program bridges that gap by safely recovering excess food from grocery stores, restaurants, caterers, and local partners.",
      "We sort, portion, and route these ingredients into prepared meals and grocery boxes—so perfectly good food ends up on dinner tables, not in landfills.",
    ],
    impact: [
      "Rescues surplus from local grocers, restaurants, and food vendors",
      "Prioritizes fresh produce, proteins, and prepared foods that can be quickly used",
      "Reduces food waste while increasing access for families across New Jersey",
      "Builds consistent, reliable pickup routes with partner sites",
    ],
    volunteerRoles: [
      "Help with surplus pickups and drop-offs",
      "Sort, label, and safely store rescued food",
      "Support data tracking for rescued pounds and partner sites",
      "Connect new potential surplus partners in your neighborhood",
    ],
  },
  {
    id: "pantry-partners",
    title: "Community Pantry Partners",
    href: "/causes/pantry-partners",
    image: "/images/causes/pantry-partners/pantry-partners-hero.png",
    imageAlt: "Local pantry shelves stocked with fresh and shelf-stable food",
    description: [
      "We don’t believe in doing this work alone. Through our Community Pantry Partners network, we supply local schools, churches, and neighborhood organizations with fresh food, boxes, and support.",
      "Each partner site becomes a trusted, familiar place where families can access food with dignity—often in the same spaces where they already learn, worship, or gather.",
    ],
    impact: [
      "Supports pantries in schools, churches, and community centers",
      "Shares rescued and purchased food across multiple neighborhoods",
      "Centers dignity, choice, and culturally relevant foods at partner sites",
      "Expands reach without building duplicate infrastructure",
    ],
    volunteerRoles: [
      "Support stocking and set-up at partner pantries",
      "Help with deliveries to school or community sites",
      "Assist with pop-up distributions and pantry days",
      "Document stories and feedback from partner locations",
    ],
  },
  {
    id: "prepared-meals",
    title: "Prepared Meals & Family Food Boxes",
    href: "/causes/prepared-meals",
    image: "/images/causes/prepared-meals/prepared-meals-hero-alt.jpg",
    imageAlt: "Prepared meals in branded Seed & Spoon packaging",
    description: [
      "Some nights, cooking isn’t an option. Our Prepared Meals program creates ready-to-heat meals—like lasagna, chicken pot pie, and sliders—that families can enjoy with zero extra stress.",
      "Alongside hot meals, we assemble Family Food Boxes packed with pantry staples, fresh produce, and kid-friendly items to carry households through the week.",
    ],
    impact: [
      "Ready-to-heat meals for families facing tight schedules or crises",
      "Family Food Boxes packed with a balance of fresh and shelf-stable items",
      "Holiday and community meals during key times like Thanksgiving and school breaks",
      "Flexible distribution: home delivery, pickup, and community events",
    ],
    volunteerRoles: [
      "Prep, cook, and portion meals in the kitchen",
      "Assemble food boxes matched to family size and needs",
      "Deliver meals and boxes to families or pickup locations",
      "Support special holiday and community meal events",
    ],
  },
  {
    id: "workshops",
    title: "Education & Workshops (Including Youth Agriculture)",
    href: "/causes/workshops",
    image: "/images/causes/workshops/workshops-hero.png",
    imageAlt:
      "Instructor leading a Seed & Spoon budgeting and food skills workshop",
    description: [
      "Food security is more than a single meal. Our Education & Workshops cause covers budgeting, credit basics, smart grocery shopping, cooking, food preservation, and youth agriculture.",
      "From classroom sessions to garden days, we give families and young people real-world tools to stretch every dollar, every ingredient, and every harvest.",
    ],
    impact: [
      "Free or low-barrier workshops on budgeting, cooking, and grocery skills",
      "Hands-on cooking demos using common pantry and surplus items",
      "Youth agriculture days where young people plant, grow, and harvest food",
      "Partnerships with schools, community groups, and local farms",
    ],
    volunteerRoles: [
      "Help facilitate workshops or support as a room assistant",
      "Lead or assist with simple cooking demos",
      "Support youth garden days and basic garden maintenance",
      "Coordinate with schools, churches, or community centers to host sessions",
    ],
  },
];

export default function CausesPage() {
  return (
    <main className="min-h-screen bg-[#F9EED4] pt-16 md:pt-20 lg:pt-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0B88C2] to-[#02538A] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our Causes
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-95">
            Every surplus tray recovered, every pantry stocked, every meal
            prepared, and every skill taught—these are the ways we build a
            stronger, more food-secure New Jersey.
          </p>
          <p className="mt-4 text-sm md:text-base opacity-90">
            Explore each cause below to see how Seed & Spoon NJ turns compassion
            into action—and where you can plug in.
          </p>
        </div>
      </section>

      {/* Causes Sections */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        {causesData.map((cause, index) => {
          const isEven = index % 2 === 0;

          return (
            <section key={cause.id} id={cause.id} className="scroll-mt-20">
              <div
                className={`flex flex-col ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                } gap-8 lg:gap-12 items-center`}
              >
                {/* Image */}
                <div className="w-full lg:w-1/2">
                  <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={cause.image}
                      alt={cause.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 550px, 100vw"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="space-y-2">
                    <Link href={cause.href}>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#02538A] leading-tight hover:underline underline-offset-4">
                        {cause.title}
                      </h2>
                    </Link>
                    <p className="text-sm uppercase tracking-[0.16em] text-[#0B88C2]/80 font-semibold">
                      Seed & Spoon NJ Cause
                    </p>
                  </div>

                  <div className="space-y-4">
                    {cause.description.map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-lg text-gray-800 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Impact Highlights */}
                  <div className="bg-white/80 rounded-xl p-6 shadow-lg border-l-4 border-[#77A462]">
                    <h3 className="text-xl font-bold text-[#02538A] mb-4">
                      What This Cause Does
                    </h3>
                    <ul className="space-y-2">
                      {cause.impact.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-[#77A462] text-xl mt-0.5 flex-shrink-0">
                            ✓
                          </span>
                          <span className="text-gray-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Volunteer Roles */}
                  <div className="bg-gradient-to-br from-[#EA802F]/10 to-[#EA802F]/5 rounded-xl p-6 border border-[#EA802F]/20">
                    <h3 className="text-xl font-bold text-[#02538A] mb-4">
                      Ways to Help
                    </h3>
                    <ul className="space-y-2 mb-6">
                      {cause.volunteerRoles.map((role, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-[#EA802F] text-lg mt-0.5 flex-shrink-0">
                            →
                          </span>
                          <span className="text-gray-800">{role}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href={cause.href}
                        className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#02538A] font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-[#02538A]/20"
                      >
                        Learn More About {cause.title}
                      </Link>
                      <Link
                        href="/volunteer"
                        className="inline-flex items-center justify-center px-8 py-3 bg-[#0B88C2] hover:bg-[#0a77a9] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Volunteer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-br from-[#77A462] to-[#5a8a4a] text-white py-16 px-4 mt-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Stand Behind a Cause?
          </h2>
          <p className="text-xl leading-relaxed opacity-95">
            Whether you’re passionate about food rescue, pantries, prepared
            meals, or education, there’s a Seed & Spoon NJ cause that fits your
            heart. Support one—or support the whole ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-[#77A462] font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              Support Our Causes
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center px-10 py-4 bg-[#EA802F] hover:bg-[#d6722a] text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              Join the Work
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
